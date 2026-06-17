import React, { useState, useEffect } from 'react';
import coinService from '../services/coinService';
import { Bell, BellRing, AlertTriangle, TrendingDown, Activity, Volume2, VolumeX, Filter, Loader2, RefreshCw } from 'lucide-react';

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('volatility'); // 'volatility' or 'drops'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Audio alert settings state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [minSeverity, setMinSeverity] = useState('all'); // 'all', 'medium', 'high'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BellRing className="pulsing-glow" size={28} color="var(--primary)" />
            <span>Market Alerts & Risk Feed</span>
          </h1>
          <p className="page-subtitle">Track high volatility events and sharp price drop risks filtered by on-chain indicators.</p>
        </div>

        {/* Quick Audio & Volume Control panel */}
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              background: 'none',
              border: 'none',
              color: audioEnabled ? 'var(--primary-hover)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{audioEnabled ? 'Audio Alerts On' : 'Audio Muted'}</span>
          </button>
        </div>
      </div>

      {/* Tabs and Filtering Sub-Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {/* Toggle tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('volatility')}
            style={{
              background: activeTab === 'volatility' ? 'var(--primary)' : 'none',
              border: 'none',
              color: activeTab === 'volatility' ? '#fff' : 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} />
              <span>High Volatility ({`>=10%`})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('drops')}
            style={{
              background: activeTab === 'drops' ? 'var(--primary)' : 'none',
              border: 'none',
              color: activeTab === 'drops' ? '#fff' : 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingDown size={14} />
              <span>Market Drops ({`<=-5%`})</span>
            </div>
          </button>
        </div>

        {/* Severity Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Severity Threshold:</span>
          <select
            className="form-input"
            value={minSeverity}
            onChange={(e) => setMinSeverity(e.target.value)}
            style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}
          >
            <option value="all">All Alerts</option>
            <option value="medium">Medium & High Risk</option>
            <option value="high">High Risk Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '12px' }}>
          <Loader2 className="pulsing-glow spinning" size={32} color="var(--primary)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monitoring active alert signals...</span>
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Feed items placeholder...
        </div>
      )}
    </div>
  );
}
