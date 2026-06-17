import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, X, Activity } from 'lucide-react';
import coinService from '../services/coinService';

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Close/Open keyboard triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '15vh'
      }}
      onClick={() => setIsOpen(false)}
    >
      {/* Modal Container */}
      <div
        className="glass-panel"
        style={{
          width: '90%',
          maxWidth: '560px',
          background: 'rgba(20, 20, 28, 0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          padding: 0,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '15px',
              outline: 'none',
              boxShadow: 'none',
              color: '#fff'
            }}
            placeholder="Type a command or search assets... (Press ESC to close)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Command listings placeholder */}
        <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Shortcuts and listings placeholder...
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span>Navigate with ↑↓ and Enter</span>
          <span>Open with Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
