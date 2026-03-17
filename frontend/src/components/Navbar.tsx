import React from 'react';
import { BookOpen, Trophy, Plus, Search } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo" onClick={() => onNavigate('study')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="LexiNote Logo" className="logo-img" />
          <span>LexiNote</span>
        </div>
        
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
        
        <div className="navbar-actions">
          {/* <button className="search-btn">
            <Search size={20} />
          </button> */}
          <div className="user-avatar">
            🐰
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
