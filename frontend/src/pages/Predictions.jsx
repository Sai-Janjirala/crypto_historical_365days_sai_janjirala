import React, { useState, useEffect } from 'react';
import coinService from '../services/coinService';
import { Sparkles, Loader2, AlertTriangle, TrendingUp, DollarSign, Award, Percent } from 'lucide-react';

export default function Predictions() {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState('');

  // Fetch recommendations on mount
  useEffect(() => {
    async function loadRecommendations() {
      try {
        const res = await coinService.getRecommendations();
        if (res.success && Array.isArray(res.data)) {
          setRecommendations(res.data);
        } else {
          setError('Failed to load recommended assets.');
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
        setError('Error retrieving market recommendation signals.');
      } finally {
        setLoadingRecs(false);
      }
    }
    loadRecommendations();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatLargeNum = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num?.toLocaleString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Page Header */}
      <div>
        <h1 className="page-title">Predictions & Recommendations</h1>
        <p className="page-subtitle">Algorithmic recommendation engines and simulated future value projections.</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Recommendations column */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
              <Sparkles size={20} color="var(--warning)" />
              <span>Recommended Buy Signals</span>
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Assets selected based on positive daily performance and top historical return rankings.
            </p>
          </div>

          {loadingRecs ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '10px' }}>
              <Loader2 className="pulsing-glow spinning" size={28} color="var(--primary)" />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Filtering recommendation signals...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '13px' }}>
              No current positive recommendation signals found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendations.slice(0, 5).map((coin, index) => (
                <div 
                  key={coin.coin_id}
                  className="glass-panel"
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderLeft: `4px solid ${index === 0 ? 'var(--warning)' : 'var(--success)'}`
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{coin.coin_name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{coin.symbol}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Price: <strong>{formatCurrency(coin.price)}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="badge badge-up" style={{ fontSize: '11px' }}>
                      +{coin.daily_return?.toFixed(2)}%
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Cum. Return: <strong style={{ color: 'var(--success)' }}>{coin.cumulative_return?.toFixed(0)}%</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prediction column placeholder */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <TrendingUp size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Asset Price Forecasts</h3>
          <p style={{ fontSize: '13px', maxWidth: '280px' }}>
            Choose an asset in the forecasting selector to simulate and graph future 7-day projections.
          </p>
        </div>

      </div>
    </div>
  );
}
