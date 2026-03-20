import React, { useRef, useState, useEffect } from 'react';
import { BookOpen, Trophy, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useLogoutServerMutation } from '../store/apiSlice';
import './Navbar.css';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [logoutServer] = useLogoutServerMutation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutServer().unwrap();
    } catch (err) {
      console.warn('Failed to logout on server, still logging out locally', err);
    } finally {
      dispatch(logout());
      setShowDropdown(false);
    }
  };

  const NavLinks = () => (
    <>
      <a 
        href="#" 
        className={`nav-link ${activeTab === 'study' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('study'); }}
      >
        <BookOpen size={24} className="nav-icon" />
        <span>Study</span>
      </a>
      <a 
        href="#" 
        className={`nav-link ${activeTab === 'library' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('library'); }}
      >
        <Plus size={24} className="nav-icon" />
        <span>Library</span>
      </a>
      <a 
        href="#" 
        className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('stats'); }}
      >
        <Trophy size={24} className="nav-icon" />
        <span>Stats</span>
      </a>
    </>
  );

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <div className="navbar-logo" onClick={() => onNavigate('study')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="LexiNote Logo" className="logo-img" />
            <span>LexiNote</span>
          </div>
          
          {isAuthenticated && (
            <div className="navbar-links desktop-only">
              <NavLinks />
            </div>
          )}
          
          <div className="navbar-actions">
            {isAuthenticated && (
               <div className="user-profile" ref={dropdownRef}>
                <div 
                  className="user-avatar-group clickable" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-name">{user?.fullName}</span>
                  <div className="user-avatar">{user?.avatar || '🐰'}</div>
                </div>
                
                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.fullName}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        onNavigate('profile');
                        setShowDropdown(false);
                      }}
                    >
                      <UserIcon size={16} /> My Profile
                    </button>
                    <button 
                      className="dropdown-item danger" 
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      {isAuthenticated && (
        <div className="mobile-bottom-nav">
          <NavLinks />
        </div>
      )}
    </>
  );
};

export default Navbar;
