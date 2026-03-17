import React, { useState } from 'react';
import { useLoginMutation } from '../../store/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useCuteDialog } from '../../context/DialogContext';
import './Auth.css';

interface LoginProps {
  onSwitch: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
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
