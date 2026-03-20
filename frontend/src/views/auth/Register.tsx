import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../store/apiSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useCuteDialog } from '../../context/DialogContext';
import './Auth.css';

interface RegisterProps {
  onSwitch: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const { showAlert } = useCuteDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register({ email, password, fullName }).unwrap();
      showAlert('Account Created! 🎉', result.message || `Welcome to LexiNote, ${fullName}!`, 'success');
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      showAlert('Registration Failed! 😿', err.data?.message || 'Try a different email.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="LexiNote" className="auth-logo" />
          <h2>Join LexiNote</h2>
          <p>Start your vocabulary journey! 🚀</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
            {isLoading ? 'Creating account...' : 'Registers ✨'}
          </Button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <span onClick={onSwitch}>Login here!</span>
        </div>
      </Card>
    </div>
  );
};

export default Register;
