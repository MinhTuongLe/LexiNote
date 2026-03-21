import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../../store/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { useCuteDialog } from '../../context/DialogContext';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './Auth.css';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  // Get email from query params
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email] = useState(initialEmail);
  const [token, setToken] = useState(import.meta.env.VITE_MASTER_VERIFY_CODE || '');
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const masterCode = import.meta.env.VITE_MASTER_VERIFY_CODE;

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token.length < 6) {
      showAlert(t('common.error'), t('auth.verify_code_label'), 'error');
      return;
    }

    try {
      const result = await verifyEmail({ email, token }).unwrap();
      dispatch(setCredentials(result));
      setIsVerified(true);
      showAlert(t('common.success'), t('auth.verify_success_desc'), 'success');
    } catch (err: any) {
      showAlert(t('common.error'), err.data?.message || t('common.error'), 'error');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await resendVerification({ email }).unwrap();
      setCountdown(60);
      showAlert(t('common.success'), t('common.success'), 'success');
    } catch (err: any) {
      showAlert(t('common.error'), err.data?.message || t('common.error'), 'error');
    }
  };

  if (isVerified) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-circle success">
              <CheckCircle size={32} />
            </div>
            <h2>{t('auth.verify_success_title')}</h2>
            <p>{t('auth.verify_success_desc')}</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/dashboard')} className="auth-submit">
            {t('auth.go_to_dashboard')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <Mail size={32} />
          </div>
          <h2>{t('auth.verify_email_title')}</h2>
          {masterCode 
            ? <p><Trans i18nKey="auth.verify_email_master_desc" values={{ email }}>Nhập mã xác thực bên dưới để kích hoạt tài khoản <b>{email}</b> 🔑</Trans></p>
            : <p><Trans i18nKey="auth.verify_email_desc" values={{ email }}>Chúng mình đã gửi mã xác thực tới <b>{email}</b> 📧</Trans></p>
          }
        </div>

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label>{t('auth.verify_code_label')}</label>
            <input
              type="text"
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="code-input"
            />
          </div>

          <Button variant="primary" type="submit" disabled={isVerifying} className="auth-submit">
            {isVerifying ? t('common.loading') : t('auth.verify_now')}
          </Button>
        </form>

        <div className="auth-footer" style={{ flexDirection: 'column', gap: '12px' }}>
          {!masterCode && (
            <Button 
              variant="outline" 
              onClick={handleResend} 
              disabled={countdown > 0 || isResending}
              style={{ width: '100%' }}
            >
              {countdown > 0 ? t('auth.resend_timer', { count: countdown }) : t('auth.resend_code')}
            </Button>
          )}
          <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', marginTop: 12 }}>
            <ArrowLeft size={14} /> {t('auth.back_to_login')}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
