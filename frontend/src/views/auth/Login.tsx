import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../store/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Eye, EyeOff } from 'lucide-react';
import { useCuteDialog } from '../../context/DialogContext';
import { useTranslation } from 'react-i18next';
import './Auth.css';

interface LoginProps {
  onSwitch: () => void;
  onForgot: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch, onForgot }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      


      dispatch(setCredentials(result));
      showAlert(t('auth.login_success_title'), t('auth.login_success_msg', { name: result.user.fullName }), 'success');
    } catch (err: any) {
      if (err.data?.code === 'EMAIL_NOT_VERIFIED') {
        showAlert(t('auth.not_verified_title'), t('auth.not_verified_msg'), 'alert');
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      showAlert(t('auth.login_failed_title'), err.data?.message || t('auth.login_failed_msg'), 'error');
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="LexiNote" className="auth-logo" />
          <h2>{t('auth.login_title')}</h2>
          <p>{t('auth.login_subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
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
          
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-options" style={{ justifyContent: 'flex-end' }}>
            <span className="forgot-password-link" onClick={onForgot}>{t('auth.forgot_password')}</span>
          </div>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading}
            className="auth-submit"
          >
            {isLoading ? t('common.loading') : t('common.login')} ✨
          </Button>
        </form>
        
        <div className="auth-footer">
          {t('auth.no_account')} <span onClick={onSwitch}>{t('auth.register_now')}!</span>
        </div>
      </Card>
    </div>
  );
};

export default Login;
