import React, { useState, useEffect } from 'react';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { ArrowLeft, Mail, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Auth.css';

type ForgotStep = 'email' | 'code' | 'done';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState(import.meta.env.VITE_MASTER_VERIFY_CODE || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const masterCode = import.meta.env.VITE_MASTER_VERIFY_CODE;

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (countdown > 0) return;
    
    try {
      const result = await forgotPassword({ email }).unwrap();
      showAlert('Code Sent! 📬', result.message, 'success');
      setStep('code');
      setCountdown(60);
    } catch (err: any) {
      showAlert('Error! 😿', err.data?.message || 'Something went wrong.', 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showAlert('Too Short! 🔑', 'Password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Mismatch! 🔑', 'Passwords do not match.', 'error');
      return;
    }

    try {
      await resetPassword({ email, resetToken: resetCode, newPassword }).unwrap();
      showAlert('Success! 🎉', 'Your password has been reset!', 'success');
      setStep('done');
    } catch (err: any) {
      showAlert('Error! 😿', err.data?.message || 'Invalid or expired code.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        {step === 'email' && (
          <>
            <div className="auth-header">
              <div className="auth-icon-circle">
                <Mail size={32} />
              </div>
              <h2>{t('auth.forgot_password_title')}</h2>
              {masterCode
                ? <p>{t('auth.forgot_password_master_desc')}</p>
                : <p>{t('auth.forgot_password_email_desc')}</p>
              }
            </div>

            <form onSubmit={handleSendCode} className="auth-form">
              <div className="form-group">
                <label>{t('auth.email')}</label>
                <input
                  type="email"
                  placeholder="bunny@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button variant="primary" type="submit" disabled={isSending} className="auth-submit">
                {isSending ? t('common.loading') : t('auth.send_reset_code')}
              </Button>
            </form>

            <div className="auth-footer">
              <span onClick={onBack}><ArrowLeft size={14} /> {t('auth.back_to_login')}</span>
            </div>
          </>
        )}

        {step === 'code' && (
          <>
            <div className="auth-header">
              <div className="auth-icon-circle">
                <KeyRound size={32} />
              </div>
              <h2>{t('auth.reset_password_title')}</h2>
              <p>{t('auth.reset_password_desc')}</p>
            </div>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label>{t('auth.reset_code_label')}</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  maxLength={6}
                  className="code-input"
                />
              </div>

              <div className="form-group">
                <label>{t('auth.new_password_label')}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{t('auth.confirm_password_label')}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button variant="primary" type="submit" disabled={isResetting} className="auth-submit">
                {isResetting ? t('common.loading') : t('auth.reset_password_title')} ✨
              </Button>
            </form>

            <div className="auth-footer" style={{ flexDirection: 'column', gap: '12px' }}>
              {!masterCode && (
                <Button 
                  variant="outline" 
                  onClick={() => handleSendCode()} 
                  disabled={countdown > 0 || isSending}
                  style={{ width: '100%', pointerEvents: countdown > 0 ? 'none' : 'auto' }}
                >
                  {countdown > 0 ? t('auth.resend_timer', { count: countdown }) : t('auth.resend_code')}
                </Button>
              )}
              <span onClick={() => { setStep('email'); setCountdown(0); }} style={{ cursor: 'pointer', marginTop: 24 }}>
                <ArrowLeft size={14} /> {t('auth.try_another_email')}
              </span>
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <div className="auth-header">
              <div className="auth-icon-circle success">
                <ShieldCheck size={32} />
              </div>
              <h2>{t('auth.password_reset_success')}</h2>
              <p>{t('auth.password_reset_success_desc')}</p>
            </div>

            <Button variant="primary" onClick={onBack} className="auth-submit">
              {t('auth.back_to_login')} ✨
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
