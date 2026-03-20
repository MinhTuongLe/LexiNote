import React, { useState, useEffect } from 'react';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import './Auth.css';

type ForgotStep = 'email' | 'code' | 'done';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const { showAlert } = useCuteDialog();

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
              <h2>Forgot Password?</h2>
              <p>Enter your email and we'll send you a reset code 📧</p>
            </div>

            <form onSubmit={handleSendCode} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="bunny@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button variant="primary" type="submit" disabled={isSending} className="auth-submit">
                {isSending ? 'Sending...' : 'Send Reset Code ✨'}
              </Button>
            </form>

            <div className="auth-footer">
              <span onClick={onBack}><ArrowLeft size={14} /> Back to Login</span>
            </div>
          </>
        )}

        {step === 'code' && (
          <>
            <div className="auth-header">
              <div className="auth-icon-circle">
                <KeyRound size={32} />
              </div>
              <h2>Reset Password</h2>
              <p>Enter the 6-digit code and your new password 🔑</p>
            </div>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label>Reset Code</label>
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
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button variant="primary" type="submit" disabled={isResetting} className="auth-submit">
                {isResetting ? 'Resetting...' : 'Reset Password ✨'}
              </Button>
            </form>

            <div className="auth-footer" style={{ flexDirection: 'column', gap: '12px' }}>
              <Button 
                variant="outline" 
                onClick={() => handleSendCode()} 
                disabled={countdown > 0 || isSending}
                style={{ width: '100%', pointerEvents: countdown > 0 ? 'none' : 'auto' }}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
              </Button>
              <span onClick={() => { setStep('email'); setCountdown(0); }} style={{ cursor: 'pointer', marginTop: 24 }}>
                <ArrowLeft size={14} /> Try a different email
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
              <h2>Password Reset! 🎉</h2>
              <p>Your password has been changed successfully.</p>
            </div>

            <Button variant="primary" onClick={onBack} className="auth-submit">
              Back to Login ✨
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
