import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import coinService from '../services/coinService';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { ArrowLeftRight, Activity, Award, Scale, HelpCircle, Loader2 } from 'lucide-react';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Coin select states
  const [allLatestCoins, setAllLatestCoins] = useState([]);
  const [coin1, setCoin1] = useState(searchParams.get('coin1') || '');
  const [coin2, setCoin2] = useState(searchParams.get('coin2') || '');
  const [coin3, setCoin3] = useState(searchParams.get('coin3') || '');

  // Comparison metrics states
  const [comparisonData, setComparisonData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('GROWTH'); // 'GROWTH' (%) or 'PRICE' ($)
  const [error, setError] = useState('');

  // Fetch all coins to populate selection dropdowns
  useEffect(() => {
    async function loadCoinList() {
      try {
        const res = await coinService.getLatest();
        if (res.success && Array.isArray(res.data)) {
          setAllLatestCoins(res.data);
          // Auto-select if empty
          if (!coin1 && res.data.length > 0) setCoin1(res.data[0].coin_id);
          if (!coin2 && res.data.length > 1) setCoin2(res.data[1].coin_id);
        }
      } catch (err) {
        console.error('Failed to load coin dropdowns:', err);
      }
    }
    loadCoinList();
  }, []);

  // Fetch comparison records
  useEffect(() => {
    async function fetchComparison() {
      if (!coin1 || !coin2) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await coinService.compareCoins(coin1, coin2, coin3);
        if (res.success && Array.isArray(res.data)) {
          processComparisonData(res.data);
        } else {
          setError('No historical comparison data found.');
        }
      } catch (err) {
        console.error('Failed to load comparison:', err);
        setError('Failed to fetch historical comparison.');
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
    
    // Update query params
    const params = { coin1, coin2 };
    if (coin3) params.coin3 = coin3;
    setSearchParams(params);
  }, [coin1, coin2, coin3]);

  // Group historic points by date to map to Recharts
  const processComparisonData = (records) => {
    // Group records by coin_id
    const grouped = {};
    records.forEach(r => {
      if (!grouped[r.coin_id]) grouped[r.coin_id] = [];
      grouped[r.coin_id].push(r);
    });

    // Get unique dates sorted ascending
    // Sort records inside groups by timestamp ascending first
    Object.keys(grouped).forEach(cid => {
      grouped[cid].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    // Populate comparison cards (latest single record per coin)
    const latestItems = [];
    Object.keys(grouped).forEach(cid => {
      const list = grouped[cid];
      if (list.length > 0) {
        latestItems.push(list[list.length - 1]);
      }
    });
    setComparisonData(latestItems);

    // Build timeline chart points
    const dateMap = {};
    Object.keys(grouped).forEach(cid => {
      const list = grouped[cid];
      if (list.length === 0) return;
      const startPrice = list[0].price || 1;

      list.forEach(point => {
        const dateStr = new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { date: dateStr };
        }
        
        // Absolute price
        dateMap[dateStr][`${cid}_price`] = point.price;
        // Percentage growth
        const growth = ((point.price - startPrice) / startPrice) * 100;
        dateMap[dateStr][`${cid}_growth`] = growth;
      });
    });

    // Convert map to sorted array
    const chartPoints = Object.values(dateMap);
    setChartData(chartPoints);
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatLargeNum = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // Assign distinct colors to compared items
  const colors = ['#5f52ff', '#10b981', '#f59e0b'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Title */}
      <div>
        <h1 className="page-title">Compare Coins</h1>
        <p className="page-subtitle">Analyze historical trends and growth index side-by-side.</p>
      </div>

      {/* Select panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scale size={16} />
          <span>Select assets to compare</span>
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div>
            <label className="form-label" style={{ fontSize: '10px' }}>Asset #1 (Primary)</label>
            <select className="form-input" value={coin1} onChange={e => setCoin1(e.target.value)}>
              {allLatestCoins.map(c => (
                <option key={c.coin_id} value={c.coin_id} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
                  {c.coin_name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '10px' }}>Asset #2</label>
            <select className="form-input" value={coin2} onChange={e => setCoin2(e.target.value)}>
              <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>-- Select Asset --</option>
              {allLatestCoins.filter(c => c.coin_id !== coin1).map(c => (
                <option key={c.coin_id} value={c.coin_id} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
                  {c.coin_name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '10px' }}>Asset #3 (Optional)</label>
            <select className="form-input" value={coin3} onChange={e => setCoin3(e.target.value)}>
              <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>-- None --</option>
              {allLatestCoins.filter(c => c.coin_id !== coin1 && c.coin_id !== coin2).map(c => (
                <option key={c.coin_id} value={c.coin_id} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
                  {c.coin_name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

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
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Comparing indicators...</span>
        </div>
      ) : (
        coin1 && coin2 && (
          <>
            {/* Side-by-side matrices */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: '20px' }}>
              {comparisonData.map((coin, index) => {
                const isUp = (coin.daily_return || 0) >= 0;
                return (
                  <div 
                    key={coin.coin_id}
                    className="glass-panel" 
                    style={{ padding: '20px', borderTop: `4px solid ${colors[index]}`, display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{coin.coin_name}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{coin.symbol} • Rank #{coin.market_cap_rank || 'N/A'}</span>
                      </div>
                      <span className={`badge ${isUp ? 'badge-up' : 'badge-down'}`}>
                        {isUp ? '+' : ''}{coin.daily_return?.toFixed(2)}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Price:</span>
                        <strong style={{ color: '#fff' }}>{formatCurrency(coin.price)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Market Cap:</span>
                        <strong style={{ color: '#fff' }}>{formatLargeNum(coin.market_cap)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Volume:</span>
                        <strong style={{ color: '#fff' }}>{formatLargeNum(coin.volume)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Volatility (7d):</span>
                        <strong style={{ color: 'var(--info)' }}>{coin.volatility_7d ? `${coin.volatility_7d.toFixed(2)}%` : 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Cumulative Return:</span>
                        <strong style={{ color: (coin.cumulative_return || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {coin.cumulative_return ? `${coin.cumulative_return.toFixed(2)}%` : 'N/A'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price historical charts overlay */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowLeftRight size={18} color="var(--primary-hover)" />
                  <span>Historical Performance Comparison</span>
                </h3>

                {/* Mode Selector */}
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setChartMode('GROWTH')}
                    style={{
                      background: chartMode === 'GROWTH' ? 'var(--primary)' : 'none',
                      border: 'none',
                      color: chartMode === 'GROWTH' ? '#fff' : 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    % Growth Change
                  </button>
                  <button
                    onClick={() => setChartMode('PRICE')}
                    style={{
                      background: chartMode === 'PRICE' ? 'var(--primary)' : 'none',
                      border: 'none',
                      color: chartMode === 'PRICE' ? '#fff' : 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    Absolute Price ($)
                  </button>
                </div>
              </div>

              {/* Chart Overlay */}
              <div style={{ width: '100%', height: '360px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => chartMode === 'GROWTH' ? `${val.toFixed(0)}%` : `$${val.toLocaleString()}`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15, 17, 26, 0.95)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-sm)' }}
                      labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                      formatter={(value, name) => [
                        chartMode === 'GROWTH' ? `${Number(value).toFixed(2)}%` : formatCurrency(value),
                        name.replace(/_(price|growth)/g, '').toUpperCase()
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    
                    {/* Line 1 */}
                    <Line 
                      type="monotone" 
                      dataKey={`${coin1}_${chartMode.toLowerCase()}`} 
                      name={coin1} 
                      stroke={colors[0]} 
                      strokeWidth={2.5} 
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    
                    {/* Line 2 */}
                    <Line 
                      type="monotone" 
                      dataKey={`${coin2}_${chartMode.toLowerCase()}`} 
                      name={coin2} 
                      stroke={colors[1]} 
                      strokeWidth={2.5} 
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    
                    {/* Line 3 (Optional) */}
                    {coin3 && (
                      <Line 
                        type="monotone" 
                        dataKey={`${coin3}_${chartMode.toLowerCase()}`} 
                        name={coin3} 
                        stroke={colors[2]} 
                        strokeWidth={2.5} 
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          </>
        )
      )}

    </div>
  );
}
