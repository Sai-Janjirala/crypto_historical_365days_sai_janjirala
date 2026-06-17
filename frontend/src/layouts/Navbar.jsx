import React from 'react';
import { Menu, Search, User, LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Layout.css';

export default function Navbar({ onMenuToggle, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="menu-toggle" 
          onClick={onMenuToggle}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-search-container">
          <Search className="navbar-search-icon" />
          <input 
            type="text" 
            placeholder="Search coins (e.g. BTC, ETH)..." 
            className="form-input navbar-search"
            disabled // Enabled when search routes are integrated
          />
        </div>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-profile-widget">
            <div className="user-avatar">
              {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <span>{user.username}</span>
            <button 
              onClick={onLogout} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '8px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
              <LogIn size={14} />
              <span>Login</span>
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
