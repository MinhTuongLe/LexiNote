import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../../store/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './Auth.css';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();

  // Get email from query params
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

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
      showAlert('Mã lỗi! 🔑', 'Vui lòng nhập đầy đủ mã xác thực 6 chữ số.', 'error');
      return;
    }

    try {
      const result = await verifyEmail({ email, token }).unwrap();
      dispatch(setCredentials(result));
      setIsVerified(true);
      showAlert('Thành công! 🎉', 'Tài khoản của bạn đã được xác thực!', 'success');
    } catch (err: any) {
      showAlert('Lỗi xác thực! 😿', err.data?.message || 'Mã không đúng hoặc đã hết hạn.', 'error');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await resendVerification({ email }).unwrap();
      setCountdown(60);
      showAlert('Đã gửi lại! 📬', 'Mã xác thực mới đã được gửi vào hòm thư của bạn.', 'success');
    } catch (err: any) {
      showAlert('Lỗi! 😿', err.data?.message || 'Không thể gửi lại mã lúc này.', 'error');
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
            <h2>Xác thực thành công! 🎉</h2>
            <p>Chào mừng bạn gia nhập LexiNote. Hãy bắt đầu học tập thôi nào!</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/dashboard')} className="auth-submit">
            Đi tới Dashboard ✨
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
          <h2>Xác thực tài khoản</h2>
          <p>Chúng mình đã gửi mã xác thực tới <b>{email}</b> 📧</p>
        </div>

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label>Mã xác thực (6 chữ số)</label>
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
            {isVerifying ? 'Đang xác thực...' : 'Xác thực ngay ✨'}
          </Button>
        </form>

        <div className="auth-footer" style={{ flexDirection: 'column', gap: '12px' }}>
          <Button 
            variant="outline" 
            onClick={handleResend} 
            disabled={countdown > 0 || isResending}
            style={{ width: '100%' }}
          >
            {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã xác thực'}
          </Button>
          <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', marginTop: 12 }}>
            <ArrowLeft size={14} /> Quay lại Đăng nhập
          </span>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
