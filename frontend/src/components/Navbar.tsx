import React, { useRef, useState, useEffect } from 'react';
import { BookOpen, Trophy, Plus, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useLogoutServerMutation } from '../store/apiSlice';
import { useTranslation } from 'react-i18next';
import { useCuteDialog } from '../context/DialogContext';
import './Navbar.css';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshToken } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showConfirm } = useCuteDialog();
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

  const handleLogout = () => {
    showConfirm(
      t('common.logout_confirm_title'),
      t('common.logout_confirm_msg'),
      async () => {
        try {
          await logoutServer({ refreshToken }).unwrap();
        } catch (err) {
          console.warn('Failed to logout on server, still logging out locally', err);
        } finally {
          dispatch(logout());
          setShowDropdown(false);
        }
      }
    );
  };

  const NavLinks = () => (
    <>
      <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <BookOpen size={24} className="nav-icon" />
        <span>{t('nav.dashboard')}</span>
      </NavLink>
      <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Plus size={24} className="nav-icon" />
        <span>{t('nav.library')}</span>
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Trophy size={24} className="nav-icon" />
        <span>{t('nav.stats')}</span>
      </NavLink>
    </>
  );

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <div className="navbar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
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
                  <span className="user-name" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</span>
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
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                    >
                      <UserIcon size={16} /> {t('nav.profile')}
                    </button>
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        navigate('/settings');
                        setShowDropdown(false);
                      }}
                    >
                      <Settings size={16} /> {t('profile.title')}
                    </button>
                    <button 
                      className="dropdown-item danger" 
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> {t('common.logout')}
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
