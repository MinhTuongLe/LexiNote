import React from 'react';
import { BookOpen, Trophy, Plus, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import './Navbar.css';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo" onClick={() => onNavigate('study')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="LexiNote Logo" className="logo-img" />
          <span>LexiNote</span>
        </div>
        
        {isAuthenticated && (
          <div className="navbar-links">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'study' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate('study'); }}
            >
              <BookOpen size={20} />
              Study
            </a>
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'library' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate('library'); }}
            >
              <Plus size={20} />
              Library
            </a>
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate('stats'); }}
            >
              <Trophy size={20} />
              Stats
            </a>
          </div>
        )}
        
        <div className="navbar-actions">
          {isAuthenticated && (
            <div className="user-profile">
              <span className="user-name">{user?.fullName}</span>
              <div className="user-avatar-group">
                <div className="user-avatar">{user?.avatar || '🐰'}</div>
                <button className="logout-btn" onClick={handleLogout} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
