import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../store/apiSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Eye, EyeOff } from 'lucide-react';
import { useCuteDialog } from '../../context/DialogContext';
import { useTranslation } from 'react-i18next';
import './Auth.css';

interface RegisterProps {
  onSwitch: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register({ email, password, fullName }).unwrap();
      showAlert(t('common.success'), result.message || `Welcome to LexiNote, ${fullName}!`, 'success');
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      showAlert(t('common.error'), err.data?.message || 'Try a different email.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="LexiNote" className="auth-logo" />
          <h2>{t('auth.register_title')}</h2>
          <p>{t('auth.register_subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('auth.fullname')}</label>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading}
            className="auth-submit"
          >
            {isLoading ? t('common.loading') : t('common.register')} ✨
          </Button>
        </form>
        
        <div className="auth-footer">
          {t('auth.already_has_account')} <span onClick={onSwitch}>{t('common.login')}!</span>
        </div>
      </Card>
    </div>
  );
};

export default Register;
