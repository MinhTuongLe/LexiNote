import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import OverviewPage from './pages/OverviewPage';
import UserManagementPage from './pages/UserManagementPage';
import WordLibraryPage from './pages/WordLibraryPage';
import SystemConfigPage from './pages/SystemConfigPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Outlet } from 'react-router-dom';
import { 
  ShieldCheck, 
  Calendar, 
  Key, 
  Mail, 
  Globe,
  Languages,
  User as UserIcon,
  BadgeCheck,
  CreditCard,
  Bell,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f8fa]">
        <div className="w-12 h-12 border-4 border-[#009ef7]/20 border-t-[#009ef7] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const ProfilePage = () => (
  <div className="space-y-8 animate-in">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-[#181c32]">Account Details</h1>
        <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Manage your administrative identity and credentials.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Card */}
      <Card className="border-[#eff2f5] shadow-sm flex flex-col items-center">
        <CardContent className="p-10 flex flex-col items-center w-full">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2.5rem] bg-[#f1faff] flex items-center justify-center text-3xl font-black text-[#009ef7] border-4 border-white shadow-xl transition-transform group-hover:scale-105">
              AM
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#50cd89] border-4 border-white rounded-full flex items-center justify-center shadow-md">
              <BadgeCheck size={16} className="text-white" />
            </div>
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-lg font-bold text-[#181c32]">Tuong Le</h2>
            <p className="text-xs font-semibold text-[#a1a5b7] mt-1 italic">j.le@lexinote.ui</p>
          </div>
          <div className="mt-6 flex gap-2">
             <span className="bg-[#f1faff] text-[#009ef7] text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">Root Admin</span>
             <span className="bg-[#e8fff3] text-[#50cd89] text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">Verified</span>
          </div>
          
          <div className="w-full mt-10 space-y-2">
             <Button className="w-full bg-[#009ef7] hover:bg-[#0086d1] text-white">Edit Identity</Button>
             <Button variant="secondary" className="w-full bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]">View Public Node</Button>
          </div>
        </CardContent>
      </Card>

      {/* Metadata & Stats */}
      <div className="lg:col-span-2 space-y-8">
        <Card className="border-[#eff2f5] shadow-sm">
           <div className="p-6 border-b border-[#eff2f5] bg-[#f9fafb]/50 rounded-t-[inherit]">
              <h3 className="text-xs font-black text-[#181c32] uppercase tracking-[0.2em] border-l-3 border-[#009ef7] pl-3">Vault Parameters</h3>
           </div>
           <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Primary Mail', value: 'master@lexinote.com', icon: Mail, color: 'text-[#009ef7]' },
                { label: 'Member Since', value: 'Mar 12, 2024', icon: Calendar, color: 'text-[#50cd89]' },
                { label: 'Access Tier', value: 'SCHEMATIC_V0', icon: ShieldCheck, color: 'text-[#7239ea]' },
                { label: 'UID Signature', value: 'LEX_ROOT_X021_ALPHA', icon: Key, color: 'text-[#ffc700]' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f8fa] flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-sm">
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[#a1a5b7] uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-[#3f4254] mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
           </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
           <Card className="border-dashed border-2 flex items-center justify-between group cursor-pointer hover:border-[#009ef7]/30 transition-all border-[#eff2f5] shadow-sm">
              <CardContent className="p-6 w-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-[#f8f5ff] text-[#7239ea] flex items-center justify-center">
                      <CreditCard size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-[#181c32]">Billing Status</h4>
                      <p className="text-[10px] font-bold text-[#a1a5b7]">Professional Plan</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-[#eff2f5] group-hover:text-[#7239ea] transition-all" />
              </CardContent>
           </Card>
           <Card className="border-dashed border-2 flex items-center justify-between group cursor-pointer hover:border-[#009ef7]/30 transition-all border-[#eff2f5] shadow-sm">
              <CardContent className="p-6 w-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-[#e8fff3] text-[#50cd89] flex items-center justify-center">
                      <Bell size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-[#181c32]">Webhooks</h4>
                      <p className="text-[10px] font-bold text-[#a1a5b7]">12 active triggers</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-[#eff2f5] group-hover:text-[#50cd89] transition-all" />
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="space-y-8 animate-in">
    <div>
      <h1 className="text-xl font-bold text-[#181c32]">Environment Settings</h1>
      <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Customize your local node and UX variables.</p>
    </div>

    <div className="max-w-2xl space-y-6">
      <Card className="border-[#eff2f5] shadow-sm">
        <div className="p-6 border-b border-[#eff2f5] flex items-center justify-between bg-[#f9fafb]/50 rounded-t-[inherit]">
           <div className="flex items-center gap-3">
              <Languages className="text-[#009ef7]" size={20} />
              <h3 className="text-xs font-black text-[#181c32] uppercase tracking-[0.2em]">Localization Protocol</h3>
           </div>
        </div>
        <CardContent className="p-8">
           <div className="flex gap-3">
               <Button variant="outline" className="flex-1 py-6 border-2 border-[#009ef7] bg-[#f1faff] text-[#009ef7] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#e6f4ff] hover:text-[#009ef7] transition-all">Vietnam [VN]</Button>
               <Button variant="outline" className="flex-1 py-6 border-2 border-[#eff2f5] bg-white text-[#a1a5b7] text-xs font-black uppercase tracking-widest rounded-xl hover:border-[#009ef7]/20 hover:text-[#009ef7] hover:bg-transparent transition-all">English [EN]</Button>
           </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-[#eff2f5] shadow-sm">
        <div className="p-6 border-b border-[#eff2f5] flex items-center gap-3 bg-[#f9fafb]/50 rounded-t-[inherit]">
           <Globe className="text-[#7239ea]" size={20} />
           <h3 className="text-xs font-black text-[#181c32] uppercase tracking-[0.2em]">Interface Dynamics</h3>
        </div>
        <CardContent className="p-8 space-y-8">
          {[
            { label: 'Data Density Output', desc: 'Maximize information points per screen.', val: true },
            { label: 'Real-time Shard Sync', desc: 'Automatically poll for backend data changes.', val: true },
            { label: 'Hardware Acceleration', desc: 'Use GPU for complex graph rendering.', val: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div>
                <span className="text-xs font-bold text-[#3f4254] block group-hover:text-[#009ef7] transition-colors">{item.label}</span>
                <p className="text-[10px] font-bold text-[#a1a5b7] mt-0.5">{item.desc}</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.val ? 'bg-[#009ef7]' : 'bg-[#eff2f5]'}`}>
                 <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${item.val ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-3 mt-8">
         <Button variant="secondary" className="px-6 bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]">Discard</Button>
         <Button className="px-6 bg-[#009ef7] text-white hover:bg-[#0086d1]">Save Environment</Button>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AdminLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="words" element={<WordLibraryPage />} />
              <Route path="config" element={<SystemConfigPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
