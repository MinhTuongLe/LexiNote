import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLoginMutation } from '../store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import Tooltip from '@/components/ui/Tooltip';

import { getErrorMessage } from '../utils/errors';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'));
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-6 selection:bg-primary/20 selection:text-primary">
      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
        <Tooltip content={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"} side="left">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-card/80 backdrop-blur-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs text-xs font-medium cursor-pointer group"
          >
            {isDark ? (
              <>
                <Sun size={16} className="text-amber-400 group-hover:rotate-45 transition-transform" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-foreground group-hover:-rotate-12 transition-transform" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>

      <div className="w-full max-w-md animate-in fade-in-50 duration-300">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-950 border border-primary/30 shadow-xl overflow-hidden">
              <img src="/admin-logo.png" alt="LexiNote Admin Command Center" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            LexiNote <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">Admin Command</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Authenticate to access LexiNote Infrastructure & Operations</p>
        </div>

        <Card className="border-border/60 bg-card shadow-lg shadow-black/5 rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-3">
            <CardTitle className="text-lg font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {error && (
              <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2.5 text-destructive text-xs font-semibold">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                  <Input 
                    type="email" 
                    required
                    placeholder="admin@lexinote.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/40 border-border/80 rounded-lg h-10 pl-10 pr-4 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/40 border-border/80 rounded-lg h-10 pl-10 pr-10 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-10 font-semibold text-xs shadow-xs mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <>Sign In <ArrowRight size={15} className="ml-1" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-xs text-muted-foreground">
          Protected by LexiNote Admin Security
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
