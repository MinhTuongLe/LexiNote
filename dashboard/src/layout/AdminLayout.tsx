import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  Search,
  User,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import { Input } from "@/components/ui/input";

import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'User Management', path: '/dashboard/users', icon: Users },
    { title: 'Word Library', path: '/dashboard/words', icon: BookOpen },
    { title: 'System Config', path: '/dashboard/config', icon: Settings },
  ];

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      name: part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' '),
      path: '/' + parts.slice(0, i + 1).join('/')
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#f5f8fa] text-slate-800 font-sans w-full selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar - ReUI/Metronic Style */}
      <aside className="w-[260px] border-r border-[#eff2f5] bg-white flex flex-col hidden lg:flex sticky top-0 h-screen z-30">
        <div className="p-8 pb-4">
          <Link to="/dashboard" className="flex items-center gap-3 mb-10 group">
            <div className="w-9 h-9 bg-[#009ef7] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,158,247,0.3)] group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#181c32]">LexiNote</span>
              <span className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Enterprise</span>
            </div>
          </Link>
          
          <nav className="space-y-1">
            <div className="px-4 py-2 text-[10px] font-bold text-[#a1a5b7] uppercase tracking-[0.2em] mb-2">Category</div>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-[#f1faff] text-[#009ef7]' 
                      : 'text-[#7e8299] hover:text-[#009ef7] hover:bg-[#f1faff]'
                  }`}
                >
                  <item.icon size={20} className={`${isActive ? 'text-[#009ef7]' : 'text-[#7e8299] group-hover:text-[#009ef7]'}`} />
                  <span className="text-sm font-semibold">{item.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[#eff2f5] bg-[#f9fafb]/50">
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left mb-2"
          >
            <div className="w-8 h-8 rounded-full bg-[#f1faff] border border-[#d1edff] flex items-center justify-center shrink-0">
               {user?.avatar ? (
                 <span className="text-base">{user.avatar}</span>
               ) : (
                 <User size={16} className="text-[#009ef7]" />
               )}
            </div>
            <div className="flex-1 overflow-hidden">
               <p className="text-xs font-bold text-[#181c32] truncate">{user?.fullName || 'Super Admin'}</p>
               <p className="text-[10px] text-[#a1a5b7] truncate">{user?.role || 'Administrator'}</p>
            </div>
          </button>
          
          <button 
            className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-[#a1a5b7] hover:text-[#f1416c] hover:bg-[#fff5f8] transition-all text-xs font-bold uppercase tracking-wider"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Fixed & High Density */}
        <header className="h-[70px] border-b border-[#eff2f5] flex items-center justify-between px-8 bg-white/95 backdrop-blur-sm z-20 sticky top-0">
           <div className="flex items-center gap-6 flex-1">
              {/* Breadcrumbs */}
              <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
                <Link to="/dashboard" className="text-[#a1a5b7] hover:text-[#009ef7] transition-colors">Home</Link>
                {getBreadcrumbs().map((crumb, i) => (
                  <React.Fragment key={crumb.path}>
                    <ChevronRight size={14} className="text-[#e1e3ea]" />
                    <span className={i === getBreadcrumbs().length - 1 ? 'text-[#3f4254]' : 'text-[#a1a5b7]'}>
                      {crumb.name}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              <div className="relative max-w-[400px] w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a5b7] group-focus-within:text-[#009ef7] transition-colors" size={18} />
                <Input 
                  type="text" 
                  placeholder="Quick Search..." 
                  className="bg-[#f5f8fa] border-none rounded-lg h-9 pl-12 pr-4 text-xs font-medium focus-visible:ring-2 focus-visible:ring-[#009ef7] w-full transition-all text-[#3f4254] placeholder:text-[#a1a5b7]"
                />
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f5f8fa] hover:bg-[#eff2f5] text-[#3f4254] transition-all relative">
                 <Bell size={20} />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#f1416c] rounded-full border-2 border-white"></span>
              </button>
              
              <div className="h-8 w-px bg-[#eff2f5]"></div>

              <div className="flex items-center gap-3 pl-2">
                 <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold text-[#181c32]">{user?.fullName || 'Super Admin'}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${user?.isActive ? 'text-[#50cd89]' : 'text-[#f1416c]'}`}>
                      {user?.isActive ? 'Verified' : 'Inactive'}
                    </span>
                 </div>
                 <button 
                  onClick={() => navigate('/dashboard/settings')}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f5f8fa] border-2 border-transparent hover:border-[#009ef7] transition-all"
                >
                  <Settings size={20} className="text-[#7e8299]" />
                </button>
              </div>
           </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 relative custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full re-animate">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
