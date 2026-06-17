import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import coinService from '../services/coinService';
import { ArrowLeft, TrendingUp, Calendar, Coins as CoinIcon, Award, DollarSign, Activity, ChevronRight, Loader2, BarChart2 } from 'lucide-react';

export default function CoinDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setError('');
      try {
        const res = await coinService.getCoinById(id);
        if (res.success && res.data) {
          setCoin(res.data);
        } else {
          setError('Coin not found or database record missing.');
        }
      } catch (err) {
        console.error('Failed to load coin details:', err);
        setError('Error retrieving coin information.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchDetails();
  }, [id]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatCap = (cap) => {
    if (cap === null || cap === undefined) return 'N/A';
    return `$${cap.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' }}>
        <Loader2 className="pulsing-glow" size={40} color="var(--primary)" />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading asset metrics...</span>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
        <button onClick={() => navigate('/coins')} className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>
        <div className="glass-panel" style={{ padding: '30px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)' }}>
          {error || 'An unexpected error occurred.'}
        </div>
      </div>
    );
  }

  const isUp = (coin.daily_return || 0) >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Breadcrumbs & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <Link to="/coins" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Coins</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#fff', fontWeight: 600 }}>{coin.symbol}</span>
      </div>

      {/* Hero Header Wrapper */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary-hover)', fontSize: '20px' }}>
              {coin.symbol}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', color: '#fff', margin: 0 }}>
                  {coin.coin_name}
                </h1>
                <span className="badge badge-secondary" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  Rank #{coin.market_cap_rank || 'N/A'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Historic tracking record for {coin.date} ({coin.month})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
              {formatPrice(coin.price)}
            </span>
            <span className={`badge ${isUp ? 'badge-up' : 'badge-down'}`} style={{ fontSize: '13px', padding: '4px 10px' }}>
              {isUp ? '+' : ''}{coin.daily_return?.toFixed(2)}%
            </span>
          </div>

        </div>
      </div>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Main Details Panel & Chart Placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chart Placement (Step 9 Integration) */}
          <div className="glass-panel" style={{ padding: '30px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <BarChart2 size={48} color="var(--primary-hover)" className="pulsing-glow" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#fff' }}>Historical Price Trends</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '320px', textAlign: 'center' }}>
              The interactive historical price charts will be loaded in Step 9.
            </p>
          </div>

          {/* Key Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span className="form-label" style={{ fontSize: '11px' }}>Market Cap</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                {formatCap(coin.market_cap)}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span className="form-label" style={{ fontSize: '11px' }}>24h Volume</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                {formatCap(coin.volume)}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span className="form-label" style={{ fontSize: '11px' }}>7d Volatility</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--info)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                {coin.volatility_7d ? `${coin.volatility_7d.toFixed(2)}%` : 'N/A'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span className="form-label" style={{ fontSize: '11px' }}>Cumulative Return</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: (coin.cumulative_return || 0) >= 0 ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                {coin.cumulative_return ? `${coin.cumulative_return.toFixed(2)}%` : 'N/A'}
              </div>
            </div>

          </div>

        </div>

        {/* Sidebar Analytics */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary-hover)" />
            <span>Technical Indicators</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>7d Price Moving Avg</span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {formatPrice(coin.price_ma7)}
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>30d Price Moving Avg</span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {formatPrice(coin.price_ma30)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking Period</span>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <Calendar size={14} color="var(--text-secondary)" />
                <span>{coin.month}</span>
              </div>
            </div>
          </div>

          <Link to={`/compare?coin1=${coin.coin_id}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '13px', justifyContent: 'center' }}>
            Compare Asset
          </Link>
        </div>

      </div>

    </div>
  );
}
