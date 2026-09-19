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
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isDark, toggleTheme } = useTheme();


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'User Management', path: '/dashboard/users', icon: Users },
    { title: 'Word Library', path: '/dashboard/words', icon: BookOpen },
    { title: 'Moderation Queue', path: '/dashboard/moderation', icon: Sparkles },
    { title: 'Audit Logs', path: '/dashboard/audit', icon: ShieldCheck },
    { title: 'Trash & Recovery', path: '/dashboard/trash', icon: Trash2 },
    { title: 'System Config', path: '/dashboard/config', icon: Settings },
  ];

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const mapping: Record<string, string> = {
      dashboard: 'Overview',
      users: 'User Management',
      words: 'Word Library',
      moderation: 'Moderation Queue',
      audit: 'Audit Logs',
      trash: 'Trash & Recovery',
      config: 'System Config',
      profile: 'Account Profile',
      settings: 'Settings'
    };
    return parts.map((part, i) => ({
      name: mapping[part] || (part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ')),
      path: '/' + parts.slice(0, i + 1).join('/')
    }));
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans w-full selection:bg-primary/20 selection:text-primary">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <aside 
          className={`w-[280px] h-full bg-sidebar border-r border-border shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
                  <Sparkles className="text-primary-foreground" size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-foreground">LexiNote</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Admin Portal</span>
                </div>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Navigation</div>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 mt-auto border-t border-border">
              <button 
                onClick={() => { navigate('/dashboard/profile'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-muted transition-colors text-left mb-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user?.fullName || 'Administrator'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.role || 'Super Admin'}</p>
                </div>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-xs font-semibold"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-[260px] border-r border-border bg-sidebar hidden lg:flex flex-col sticky top-0 h-screen z-30 select-none">
        <div className="p-6 pb-4">
          <Link to="/dashboard" className="flex items-center gap-3 mb-8 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <Sparkles className="text-primary-foreground" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">LexiNote</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Admin Workspace</span>
            </div>
          </Link>
          
          <nav className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-1">Menu</div>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-semibold shadow-xs' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <item.icon 
                    size={18} 
                    className={`transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} 
                  />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto p-4 border-t border-border bg-muted/20">
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-muted/60 transition-all text-left mb-1.5 group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-sidebar"></span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {user?.fullName || 'Super Admin'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.role || 'Administrator'}</p>
            </div>
          </button>
          
          <button 
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium"
            onClick={handleLogout}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Glassmorphism */}
        <header className="h-16 border-b border-border/60 flex items-center justify-between px-6 lg:px-8 bg-background/80 backdrop-blur-md z-20 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              {getBreadcrumbs().map((crumb, i) => (
                <React.Fragment key={crumb.path}>
                  <ChevronRight size={14} className="text-muted-foreground/40" />
                  <span className={i === getBreadcrumbs().length - 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            {/* Quick Search */}
            <div className="relative max-w-sm w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input 
                type="text" 
                placeholder="Search words, users, configs..." 
                className="bg-muted/40 border-border/60 rounded-lg h-8 pl-9 pr-12 text-xs focus-visible:ring-1 focus-visible:ring-primary w-full transition-all placeholder:text-muted-foreground/70"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-mono font-medium text-muted-foreground/80 bg-background/80 border border-border px-1.5 py-0.5 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {/* Settings Quick Access */}
            <button 
              onClick={() => navigate('/dashboard/settings')}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Settings"
            >
              <Settings size={17} />
            </button>

            <div className="h-5 w-px bg-border/80 mx-1 hidden sm:block"></div>

            {/* Profile Pill */}
            <button 
              onClick={() => navigate('/dashboard/profile')}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              <div className="flex flex-col items-start hidden sm:flex text-left">
                <span className="text-xs font-semibold text-foreground leading-none">{user?.fullName || 'Super Admin'}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                  {user?.role || 'Administrator'}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative custom-scrollbar bg-background">
          <div className="max-w-7xl mx-auto h-full animate-in fade-in-50 duration-200">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
