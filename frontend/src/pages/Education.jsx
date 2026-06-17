import React, { useState } from 'react';
import { BookOpen, HelpCircle, TrendingUp, LineChart, Percent, Cpu, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function Education() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'financial', 'technical', 'system'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Page Header */}
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen className="pulsing-glow" size={28} color="var(--primary)" />
          <span>Interactive FAQ & Crypto Education</span>
        </h1>
        <p className="page-subtitle">Learn about market metrics, technical moving averages, portfolio simulation algebra, and Monte Carlo predictive walks.</p>
      </div>

      {/* Categories & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Category selectors */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'all', label: 'All Knowledge' },
            { id: 'financial', label: 'Financial Metrics' },
            { id: 'technical', label: 'Technical Indicators' },
            { id: 'system', label: 'System Algorithms' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              type="button"
              style={{
                background: activeCategory === cat.id ? 'var(--primary)' : 'none',
                border: 'none',
                color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input Stub */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px', width: '100%', fontSize: '12px' }}
            placeholder="Search definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        Accordion definitions placeholder...
      </div>
    </div>
  );
}
