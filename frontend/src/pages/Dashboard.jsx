import React, { useEffect, useState } from 'react';
import coinService from '../services/coinService';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Award, Flame, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [latestCoins, setLatestCoins] = useState([]);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [marketStatus, setMarketStatus] = useState('Online');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [latestRes, trendingRes, gainersRes, losersRes, statusRes] = await Promise.all([
          coinService.getLatest(),
          coinService.getTrending(),
          coinService.getTopGainers(),
          coinService.getTopLosers(),
          coinService.getMarketStatus().catch(() => ({ status: 'Offline' }))
        ]);

        if (latestRes.success) setLatestCoins(latestRes.data.slice(0, 3));
        if (trendingRes.success) setTrendingCoins(trendingRes.data.slice(0, 4));
        if (gainersRes.success) setGainers(gainersRes.data.slice(0, 5));
        if (losersRes.success) setLosers(losersRes.data.slice(0, 5));
        setMarketStatus(statusRes.status || 'Offline');
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Could not connect to the database. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatLargeNum = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' }}>
        <Loader2 className="pulsing-glow" size={40} color="var(--primary)" />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading live market feeds...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Top Banner / Hero Overview */}
      <div className="glass-panel" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', zIndex: 1, position: 'relative' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Market Overview</h1>
            <p className="page-subtitle" style={{ fontSize: '15px' }}>
              Track real-time coin metrics, historical shifts, and portfolio performance trends.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: marketStatus === 'Offline' ? 'var(--danger)' : 'var(--success)', boxShadow: marketStatus === 'Offline' ? 'var(--glow-danger)' : 'var(--glow-success)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Node Status: <strong style={{ color: '#fff' }}>{marketStatus}</strong>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '20px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Top 3 Market Cap Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {latestCoins.length > 0 ? (
          latestCoins.map((coin, index) => {
            const isUp = (coin.daily_return || 0) >= 0;
            return (
              <Link 
                key={coin.coin_id || coin._id}
                to={`/coins/${coin.coin_id}`}
                className="glass-panel glass-panel-interactive" 
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary-hover)', fontSize: '14px' }}>
                      {coin.symbol}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{coin.coin_name}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rank #{coin.market_cap_rank || index + 1}</span>
                    </div>
                  </div>
                  <span className={`badge ${isUp ? 'badge-up' : 'badge-down'}`}>
                    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(coin.daily_return || 0).toFixed(2)}%
                  </span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                    {formatPrice(coin.price)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Cap: <strong>{formatLargeNum(coin.market_cap)}</strong></span>
                  <span>Vol: <strong>{formatLargeNum(coin.volume)}</strong></span>
                </div>
              </Link>
            );
          })
        ) : (
          !loading && (
            <div className="glass-panel" style={{ padding: '30px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No coins found in database. Please seed database or check backend logs.
            </div>
          )
        )}
      </div>

      {/* Trending Section */}
      {trendingCoins.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', marginBottom: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="var(--warning)" className="pulsing-glow" />
            <span>Trending Under High Volume</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {trendingCoins.map((coin) => (
              <Link
                key={coin.coin_id || coin._id}
                to={`/coins/${coin.coin_id}`}
                className="glass-panel glass-panel-interactive"
                style={{ padding: '16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{coin.coin_name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{coin.symbol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{formatPrice(coin.price)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>+{coin.daily_return?.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gainers & Losers Stack */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Gainers Widget */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpRight size={18} color="var(--success)" />
            <span>Top Performing Gainers</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gainers.length > 0 ? (
              gainers.map((coin) => (
                <Link
                  key={coin.coin_id || coin._id}
                  to={`/coins/${coin.coin_id}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'background var(--transition-fast)' }}
                  className="glass-panel-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{coin.symbol}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{coin.coin_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{formatPrice(coin.price)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                      +{coin.daily_return?.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No data available</span>
            )}
          </div>
        </div>

        {/* Losers Widget */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowDownRight size={18} color="var(--danger)" />
            <span>Top Performing Losers</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {losers.length > 0 ? (
              losers.map((coin) => (
                <Link
                  key={coin.coin_id || coin._id}
                  to={`/coins/${coin.coin_id}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'background var(--transition-fast)' }}
                  className="glass-panel-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{coin.symbol}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{coin.coin_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{formatPrice(coin.price)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                      {coin.daily_return?.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No data available</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
