import React, { useState, useEffect } from 'react';
import coinService from '../services/coinService';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Loader2, RefreshCw, Star } from 'lucide-react';

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' or 'yearly'
  const [monthlyPerformers, setMonthlyPerformers] = useState([]);
  const [yearlyPerformers, setYearlyPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPerformers() {
      setLoading(true);
      setError('');
      try {
        const monRes = await coinService.getTopMonthlyPerformers();
        if (monRes.success && Array.isArray(monRes.data)) {
          setMonthlyPerformers(monRes.data);
        } else {
          setError('Failed to fetch monthly performance ranking.');
        }

        const yearRes = await coinService.getTopYearlyPerformers();
        if (yearRes.success && Array.isArray(yearRes.data)) {
          setYearlyPerformers(yearRes.data);
        } else {
          setError('Failed to fetch yearly performance ranking.');
        }
      } catch (err) {
        console.error('Error fetching leaderboard performance:', err);
        setError('Connection error with analytical leaderboard services.');
      } finally {
        setLoading(false);
      }
    }
    fetchPerformers();
  }, []);

  const activePerformers = activeTab === 'monthly' ? monthlyPerformers : yearlyPerformers;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Page Header */}
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy className="pulsing-glow" size={28} color="var(--primary)" />
          <span>Performance Leaderboards</span>
        </h1>
        <p className="page-subtitle">Identify highest cumulative returns, rank changes, and top-performing assets over monthly and yearly horizons.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', alignSelf: 'flex-start' }}>
        <button
          onClick={() => setActiveTab('monthly')}
          style={{
            background: activeTab === 'monthly' ? 'var(--primary)' : 'none',
            border: 'none',
            color: activeTab === 'monthly' ? '#fff' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Monthly Performance
        </button>
        <button
          onClick={() => setActiveTab('yearly')}
          style={{
            background: activeTab === 'yearly' ? 'var(--primary)' : 'none',
            border: 'none',
            color: activeTab === 'yearly' ? '#fff' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Yearly Performance
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
          <Loader2 className="pulsing-glow spinning" size={36} color="var(--primary)" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Computing leaderboards indices...</span>
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Leaderboard lists placeholder...
        </div>
      )}
    </div>
  );
}
