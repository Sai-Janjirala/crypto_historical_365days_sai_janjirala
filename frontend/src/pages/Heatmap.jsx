import React, { useEffect, useState } from 'react';
import coinService from '../services/coinService';
import { Grid, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Heatmap() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sizeMetric, setSizeMetric] = useState('market_cap'); // 'market_cap' or 'volume'
  const [marketStatus, setMarketStatus] = useState('Online');
  const [error, setError] = useState('');

  const fetchHeatmapData = async () => {
    setLoading(true);
    setError('');
    try {
      const [heatmapRes, statusRes] = await Promise.all([
        coinService.getHeatmap(),
        coinService.getMarketStatus().catch(() => ({ status: 'Offline' }))
      ]);

      if (heatmapRes.success && Array.isArray(heatmapRes.data)) {
        setCoins(heatmapRes.data);
      }
      setMarketStatus(statusRes.status || 'Offline');
    } catch (err) {
      console.error('Failed to load heatmap:', err);
      setError('Failed to fetch heatmap datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const getHeatmapColor = (dailyReturn) => {
    if (dailyReturn === null || dailyReturn === undefined) return 'rgba(75, 85, 99, 0.2)'; // Gray
    if (dailyReturn > 0) {
      // Scale green intensity up to 10%
      const alpha = Math.min(0.2 + (dailyReturn / 10) * 0.7, 0.9);
      return `rgba(16, 185, 129, ${alpha})`;
    } else {
      // Scale red intensity down to -10%
      const alpha = Math.min(0.2 + (Math.abs(dailyReturn) / 10) * 0.7, 0.9);
      return `rgba(244, 63, 94, ${alpha})`;
    }
  };

  // Determine size of the tile (flex basis/width multiplier)
  const getTileSizeStyle = (coin) => {
    const value = coin[sizeMetric] || 0;
    
    // Find max value in dataset to scale relative to it
    const values = coins.map(c => c[sizeMetric] || 0);
    const maxValue = Math.max(...values, 1);
    const ratio = value / maxValue;

    if (ratio > 0.6) {
      return { flexGrow: 4, minWidth: '150px', height: '140px' }; // Large
    } else if (ratio > 0.25) {
      return { flexGrow: 2, minWidth: '110px', height: '110px' }; // Medium
    } else {
      return { flexGrow: 1, minWidth: '85px', height: '90px' }; // Small
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Market Heatmap</h1>
          <p className="page-subtitle">Visual representation of daily asset performance.</p>
        </div>
        
        {/* Market Status Widget */}
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: marketStatus === 'Offline' ? 'var(--danger)' : 'var(--success)' }} />
          <span>Status: <strong>{marketStatus}</strong></span>
          <button 
            onClick={fetchHeatmapData} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '6px', display: 'flex', alignItems: 'center' }}
            title="Refresh Heatmap"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Control filters */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Size Tiles By:</span>
          
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setSizeMetric('market_cap')}
              style={{
                background: sizeMetric === 'market_cap' ? 'var(--primary)' : 'none',
                border: 'none',
                color: sizeMetric === 'market_cap' ? '#fff' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSizeMetric('volume')}
              style={{
                background: sizeMetric === 'volume' ? 'var(--primary)' : 'none',
                border: 'none',
                color: sizeMetric === 'volume' ? '#fff' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Trading Volume
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span>Loss (-10%)</span>
          <div style={{ width: '80px', height: '10px', borderRadius: '4px', background: 'linear-gradient(to right, var(--danger), rgba(244, 63, 94, 0.2), rgba(16, 185, 129, 0.2), var(--success))' }} />
          <span>Gain (+10%)</span>
        </div>

      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px' }}>
          <Loader2 className="pulsing-glow" size={32} color="var(--primary)" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Assembling performance grids...</span>
        </div>
      ) : coins.length > 0 ? (
        
        /* Heatmap Grid */
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
          {coins.map((coin) => {
            const sizeStyle = getTileSizeStyle(coin);
            const isPositive = (coin.daily_return || 0) >= 0;
            return (
              <Link
                key={coin.coin_id || coin._id}
                to={`/coins/${coin.coin_id}`}
                style={{
                  ...sizeStyle,
                  background: getHeatmapColor(coin.daily_return),
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease-in-out',
                  cursor: 'pointer',
                  color: '#fff',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.15)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 800, fontSize: sizeStyle.height === '140px' ? '18px' : '14px', letterSpacing: '-0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    {coin.symbol}
                  </span>
                  <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(coin.daily_return || 0).toFixed(1)}%
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: sizeStyle.height === '140px' ? '13px' : '11px', opacity: 0.9, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatPrice(coin.price)}
                  </span>
                  {sizeStyle.height === '140px' && (
                    <span style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>
                      Cap: ${(coin.market_cap / 1e9).toFixed(1)}B
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No heatmap indices recorded. Try adding some coin logs.
        </div>
      )}

    </div>
  );
}
