import React, { useEffect, useState } from 'react';
import coinService from '../services/coinService';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Loader2, TrendingUp, Calendar } from 'lucide-react';

export default function HistoryChart({ coinId }) {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30D'); // '7D', '30D', '365D'
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError('');
      try {
        const res = await coinService.getHistory(coinId);
        if (res.success && Array.isArray(res.data)) {
          setHistoryData(res.data);
        } else {
          setError('No historical records found for this asset.');
        }
      } catch (err) {
        console.error('Failed to fetch coin history:', err);
        setError('Failed to retrieve price history.');
      } finally {
        setLoading(false);
      }
    }

    if (coinId) fetchHistory();
  }, [coinId]);

  // Handle timeframe changes
  useEffect(() => {
    if (historyData.length === 0) return;

    let sliced = [...historyData];
    if (timeframe === '7D') {
      sliced = historyData.slice(-7);
    } else if (timeframe === '30D') {
      sliced = historyData.slice(-30);
    } else if (timeframe === '365D') {
      sliced = historyData.slice(-365);
    }

    // Format fields for chart mapping
    const formatted = sliced.map((item) => ({
      date: item.date,
      formattedDate: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: item.price,
      volume: item.volume
    }));

    setFilteredData(formatted);
  }, [historyData, timeframe]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);
  };

  // Custom tooltips matching glassmorphism style
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '12px 16px', border: '1px solid var(--border-hover)', fontSize: '13px', background: 'rgba(15, 17, 26, 0.95)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>{payload[0].payload.date}</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
            Price: <span style={{ color: 'var(--primary-hover)' }}>{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[0].payload.volume && (
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
              Vol: {payload[0].payload.volume.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
        <Loader2 className="pulsing-glow" size={32} color="var(--primary)" />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Compiling historic timelines...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--danger)', fontSize: '14px' }}>
        {error}
      </div>
    );
  }

  // Calculate percentage change over selected timeframe
  const getChange = () => {
    if (filteredData.length < 2) return { value: 0, isPositive: true };
    const first = filteredData[0].price;
    const last = filteredData[filteredData.length - 1].price;
    const change = ((last - first) / first) * 100;
    return { value: change, isPositive: change >= 0 };
  };

  const changeInfo = getChange();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {/* Chart controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Performance:</span>
          <span className={`badge ${changeInfo.isPositive ? 'badge-up' : 'badge-down'}`} style={{ fontSize: '13px' }}>
            {changeInfo.isPositive ? '+' : ''}{changeInfo.value.toFixed(2)}%
          </span>
        </div>

        {/* Timeframe selectors */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {['7D', '30D', '365D'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              style={{
                background: timeframe === t ? 'var(--primary)' : 'none',
                border: 'none',
                color: timeframe === t ? '#fff' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all var(--transition-fast)'
              }}
            >
              {t === '365D' ? '1Y' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div style={{ width: '100%', height: '320px', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
            <XAxis 
              dataKey="formattedDate" 
              stroke="var(--text-muted)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `$${val.toLocaleString()}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="var(--primary)" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
