import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import coinService from '../services/coinService';
import HistoryChart from '../components/HistoryChart';
import { ArrowLeft, TrendingUp, Calendar, Coins as CoinIcon, Award, DollarSign, Activity, ChevronRight, Loader2, BarChart2 } from 'lucide-react';

export default function CoinDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extended statistics states
  const [volatilityExtremes, setVolatilityExtremes] = useState(null);
  const [returnsExtremes, setReturnsExtremes] = useState(null);
  const [marketCapExtremes, setMarketCapExtremes] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setError('');
      try {
        const [res, volRes, retRes, capRes] = await Promise.all([
          coinService.getCoinById(id),
          coinService.getVolatility(id).catch(() => null),
          coinService.getReturns(id).catch(() => null),
          coinService.getMarketCapDetails(id).catch(() => null)
        ]);

        if (res.success && res.data) {
          setCoin(res.data);

          // Compute volatility extremes
          if (volRes?.success && Array.isArray(volRes.data) && volRes.data.length > 0) {
            const vols = volRes.data.map(c => c.volatility_7d).filter(v => v !== null && v !== undefined);
            if (vols.length > 0) {
              setVolatilityExtremes({
                max: Math.max(...vols),
                min: Math.min(...vols),
                avg: vols.reduce((sum, v) => sum + v, 0) / vols.length
              });
            }
          }

          // Compute returns extremes
          if (retRes?.success && Array.isArray(retRes.data) && retRes.data.length > 0) {
            const rets = retRes.data.map(c => c.daily_return).filter(r => r !== null && r !== undefined);
            const cumRets = retRes.data.map(c => c.cumulative_return).filter(r => r !== null && r !== undefined);
            if (rets.length > 0) {
              setReturnsExtremes({
                max: Math.max(...rets),
                min: Math.min(...rets),
                avgCum: cumRets.length > 0 ? cumRets.reduce((sum, r) => sum + r, 0) / cumRets.length : null
              });
            }
          }

          // Compute market cap extremes
          if (capRes?.success && Array.isArray(capRes.data) && capRes.data.length > 0) {
            const caps = capRes.data.map(c => c.market_cap).filter(c => c !== null && c !== undefined);
            if (caps.length > 0) {
              setMarketCapExtremes({
                max: Math.max(...caps),
                min: Math.min(...caps),
                avg: caps.reduce((sum, c) => sum + c, 0) / caps.length
              });
            }
          }
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
          
          {/* Chart Placement */}
          <div className="glass-panel" style={{ padding: '24px 30px', minHeight: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--primary-hover)" />
              <span>Historical Price Charts</span>
            </h3>
            <HistoryChart coinId={coin.coin_id} />
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

          {/* Extended Metrics Widget */}
          {(volatilityExtremes || returnsExtremes || marketCapExtremes) && (
            <div className="glass-panel" style={{ padding: '24px 30px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="var(--primary-hover)" />
                <span>Historical Extremes & Distribution (365 Days)</span>
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                
                {volatilityExtremes && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--info)', fontWeight: 700, textTransform: 'uppercase' }}>Volatility (7d)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Historic Peak:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>{volatilityExtremes.max.toFixed(2)}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Historic Low:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>{volatilityExtremes.min.toFixed(2)}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: '2px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Yearly Average:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>{volatilityExtremes.avg.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {returnsExtremes && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Returns</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Best Return:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--success)' }}>+{returnsExtremes.max.toFixed(2)}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Worst Return:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--danger)' }}>{returnsExtremes.min.toFixed(2)}%</span>
                      </div>
                      {returnsExtremes.avgCum !== null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: '2px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Avg Cum. Return:</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: returnsExtremes.avgCum >= 0 ? 'var(--success)' : 'var(--danger)' }}>{returnsExtremes.avgCum.toFixed(2)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {marketCapExtremes && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--primary-hover)', fontWeight: 700, textTransform: 'uppercase' }}>Valuation Cap</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Highest Cap:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>{formatCap(marketCapExtremes.max)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Lowest Cap:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>{formatCap(marketCapExtremes.min)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: '2px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Avg Cap:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>{formatCap(Math.round(marketCapExtremes.avg))}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

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
