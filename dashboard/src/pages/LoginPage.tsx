import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLoginMutation } from '../store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center p-6 selection:bg-[#009ef7] selection:text-white">
      <div className="w-full max-w-[450px] animate-in">
        <div className="mb-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#009ef7] rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,158,247,0.3)] hover:scale-105 transition-transform cursor-pointer">
            <Zap className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#181c32] tracking-tighter uppercase italic">LexiNote.Admin</h1>
          <p className="text-[11px] font-bold text-[#a1a5b7] uppercase tracking-[0.3em] mt-2">Enterprise Access Protocol</p>
        </div>

        <Card className="rounded-[2rem] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] border-[#eff2f5]">
           <CardHeader className="text-center pt-10 pb-2">
             <CardTitle className="text-xl font-bold text-[#181c32]">Authentication Required</CardTitle>
             <CardDescription className="text-xs font-semibold text-[#a1a5b7]">Input your credentials to access the node.</CardDescription>
           </CardHeader>
           <CardContent className="px-10 lg:px-12 pb-10 lg:pb-12 pt-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in">
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest block mb-2 px-1">Identity Mail</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a5b7] group-focus-within:text-[#009ef7] transition-colors" size={16} />
                       <Input 
                        type="email" 
                        required
                        placeholder="admin@lexinote.ui"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#f5f8fa] border-none rounded-xl h-12 pl-12 pr-4 text-xs font-bold text-[#3f4254] focus-visible:ring-2 focus-visible:ring-[#009ef7] transition-all"
                       />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest block mb-2 px-1">Security Key</label>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a5b7] group-focus-within:text-[#009ef7] transition-colors" size={16} />
                       <Input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#f5f8fa] border-none rounded-xl h-12 pl-12 pr-12 text-xs font-bold text-[#3f4254] focus-visible:ring-2 focus-visible:ring-[#009ef7] transition-all"
                       />
                       <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a5b7] hover:text-[#3f4254] transition-colors"
                       >
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 bg-[#009ef7] hover:bg-[#0086d1] rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(0,158,247,0.4)] transition-all flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Initiate Access <ArrowRight size={18} /></>
                  )}
                </Button>
                
                <div className="text-center">
                   <button type="button" className="text-[10px] font-black text-[#009ef7] uppercase tracking-widest hover:underline">Request Elevated Access</button>
                </div>
             </form>
           </CardContent>
        </Card>
        
        <p className="text-center mt-12 text-[10px] font-bold text-[#a1a5b7] uppercase tracking-[0.2em] italic">
           Secured by LexiNode Sentinel Architecture
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
