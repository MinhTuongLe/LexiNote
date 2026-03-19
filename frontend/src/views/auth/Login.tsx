import React, { useState } from 'react';
import { useLoginMutation } from '../../store/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Check } from 'lucide-react';
import { useCuteDialog } from '../../context/DialogContext';
import './Auth.css';

interface LoginProps {
  onSwitch: () => void;
  onForgot: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch, onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();

  React.useEffect(() => {
    // Attempt to load saved credentials
    try {
      const saved = localStorage.getItem('lexinote_creds');
      if (saved) {
        const decoded = atob(saved);
        const { em, pw } = JSON.parse(decoded);
        if (em && pw) {
          setEmail(em);
          setPassword(pw);
          setRememberMe(true);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      
      // Save credentials if requested
      if (rememberMe) {
        const payload = btoa(JSON.stringify({ em: email, pw: password }));
        localStorage.setItem('lexinote_creds', payload);
      } else {
        localStorage.removeItem('lexinote_creds');
      }

      dispatch(setCredentials(result));
      showAlert('Welcome back! ✨', `Hello, ${result.user.fullName}!`, 'success');
    } catch (err: any) {
      showAlert('Login Failed! 😿', err.data?.message || 'Check your credentials.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="LexiNote" className="auth-logo" />
          <h2>Login to LexiNote</h2>
          <p>Ready to learn some new words? 🐰</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
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
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-options">
            <div 
              className="remember-me-label" 
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div className={`custom-checkbox ${rememberMe ? 'checked' : ''}`}>
                {rememberMe && <Check size={16} strokeWidth={4} />}
              </div>
              <span>Remember me</span>
            </div>
            <span className="forgot-password-link" onClick={onForgot}>Forgot password?</span>
          </div>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading}
            className="auth-submit"
          >
            {isLoading ? 'Logging in...' : 'Login ✨'}
          </Button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <span onClick={onSwitch}>Register here!</span>
        </div>
      </Card>
    </div>
  );
};

export default Login;
