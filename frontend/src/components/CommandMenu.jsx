import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, X, Command } from 'lucide-react';

const shortcuts = [
  { label: 'Go to Dashboard', path: '/' },
  { label: 'Go to Coins Directory', path: '/coins' },
  { label: 'Go to Compare Coins', path: '/compare' },
  { label: 'Go to Market Heatmap', path: '/heatmap' },
  { label: 'Go to Global Statistics', path: '/stats' },
  { label: 'Go to Performance Leaderboards', path: '/leaderboards' },
  { label: 'Go to Analytics Hub', path: '/analytics' },
  { label: 'Go to Portfolio Simulator', path: '/portfolio' },
  { label: 'Go to Predictions & Recommendations', path: '/predictions' },
  { label: 'Go to Risk Alerts', path: '/alerts' },
  { label: 'Go to Coin Reports', path: '/reports' },
  { label: 'Go to System Health & Maintenance', path: '/admin/maintenance' },
  { label: 'Go to Admin Control Center', path: '/admin' },
  { label: 'Go to Settings', path: '/settings' }
];

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Filter shortcuts
  const filteredShortcuts = shortcuts.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredShortcuts.length;

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Close/Open keyboard triggers and index navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (totalItems > 0 ? (prev + 1) % totalItems : 0));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (totalItems > 0 ? (prev - 1 + totalItems) % totalItems : 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (totalItems > 0 && filteredShortcuts[highlightedIndex]) {
          handleSelect(filteredShortcuts[highlightedIndex].path);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalItems, highlightedIndex, filteredShortcuts]);

  // Focus input on open & reset
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

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

        {/* Shortcuts list container */}
        <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '8px' }} className="custom-scroll">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 10px', fontWeight: 600 }}>
            Global Shortcuts
          </div>
          {filteredShortcuts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No commands matched your query.
            </div>
          ) : (
            filteredShortcuts.map((item, index) => {
              const isHighlighted = highlightedIndex === index;
              return (
                <div
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isHighlighted ? 'var(--primary)' : 'none',
                    color: isHighlighted ? '#fff' : 'var(--text-secondary)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <Command size={14} color={isHighlighted ? '#fff' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                </div>
              );
            })
          )}
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
