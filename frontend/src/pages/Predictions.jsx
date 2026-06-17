import React, { useState, useEffect } from 'react';
import coinService from '../services/coinService';
import { Sparkles, Loader2, AlertTriangle, TrendingUp, DollarSign, Award, Percent, Calendar } from 'lucide-react';

export default function Predictions() {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState('');

  // Selector and Simulation states
  const [allCoins, setAllCoins] = useState([]);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [predicted, setPredicted] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Fetch recommendations and latest coins list
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

    async function loadCoins() {
      try {
        const res = await coinService.getLatest();
        if (res.success && Array.isArray(res.data)) {
          setAllCoins(res.data);
          if (res.data.length > 0) {
            setSelectedCoinId(res.data[0].coin_id);
          }
        }
      } catch (err) {
        console.error('Failed to load latest coins list:', err);
      } finally {
        setLoadingCoins(false);
      }
    }

    loadRecommendations();
    loadCoins();
  }, []);

  const handleForecast = async (e) => {
    e.preventDefault();
    if (!selectedCoinId) return;

    setPredicting(true);
    setPredicted(false);
    setPredictionResult(null);
    setError('');

    try {
      // Fetch historical data
      const historyRes = await coinService.getHistory(selectedCoinId);
      if (!historyRes.success || !Array.isArray(historyRes.data)) {
        throw new Error('No historical records found for this asset.');
      }

      const history = [...historyRes.data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      if (history.length < 2) {
        throw new Error('Insufficient historical points to calculate drift.');
      }

      // Calculations: daily returns
      const prices = history.map(h => h.price);
      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
      }
      const meanReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
      const variance = returns.reduce((sum, val) => sum + Math.pow(val - meanReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const drift = meanReturn - 0.5 * variance;

      // Box-Muller normal distribution generator
      const randNormal = () => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      };

      const lastPoint = history[history.length - 1];
      const lastPrice = lastPoint.price;
      const lastTimestamp = new Date(lastPoint.timestamp);

      // Generate 7-day forecast
      let currentPrice = lastPrice;
      const forecast = [];
      for (let day = 1; day <= 7; day++) {
        const nextDate = new Date(lastTimestamp);
        nextDate.setDate(lastTimestamp.getDate() + day);

        const shock = stdDev * randNormal();
        const nextPrice = currentPrice * Math.exp(drift + shock);
        const changePercent = ((nextPrice - lastPrice) / lastPrice) * 100;

        forecast.push({
          day,
          date: nextDate.toISOString().split('T')[0],
          formattedDate: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: nextPrice,
          changePercent
        });
        currentPrice = nextPrice;
      }

      const coinInfo = allCoins.find(c => c.coin_id === selectedCoinId);

      setPredictionResult({
        coin: coinInfo,
        forecast,
        history,
        lastPrice
      });
      setPredicted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Forecast calculation failed.');
    } finally {
      setPredicting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
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
        
        {/* Left column: recommendations list & coin selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Selector Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
              <TrendingUp size={20} color="var(--primary-hover)" />
              <span>Asset Selector</span>
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="form-input"
                value={selectedCoinId}
                onChange={e => setSelectedCoinId(e.target.value)}
                disabled={loadingCoins || predicting}
              >
                {allCoins.map(coin => (
                  <option key={coin.coin_id} value={coin.coin_id} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
                    {coin.coin_name} ({coin.symbol})
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleForecast}
                disabled={loadingCoins || !selectedCoinId || predicting}
              >
                {predicting ? <Loader2 size={16} className="spinning" /> : <Calendar size={16} />}
                <span>{predicting ? 'Simulating...' : 'Run Forecast'}</span>
              </button>
            </div>
          </div>

          {/* Recommendations Panel */}
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

        </div>

        {/* Right column: Prediction Result */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '350px', justifyContent: 'center' }}>
          {predicting && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 className="pulsing-glow spinning" size={36} color="var(--primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Modeling drift volatility and random shocks...</span>
            </div>
          )}

          {!predicting && !predicted && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
              <TrendingUp size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Asset Price Forecasts</h3>
              <p style={{ fontSize: '13px', maxWidth: '280px' }}>
                Choose an asset in the forecasting selector to simulate and graph future 7-day projections.
              </p>
            </div>
          )}

          {!predicting && predicted && predictionResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  7-Day Monte Carlo Projections for {predictionResult.coin?.coin_name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Expected projections using historical price standard deviation.
                </p>
              </div>

              {/* Table of 7 day forecast */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {predictionResult.forecast.map((f) => {
                  const isUp = f.changePercent >= 0;
                  return (
                    <div 
                      key={f.day}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px 14px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)' 
                      }}
                    >
                      <div style={{ fontSize: '13px', color: '#fff', display: 'flex', gap: '10px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Day {f.day}</span>
                        <span>{f.formattedDate}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                        <strong style={{ color: '#fff' }}>{formatCurrency(f.price)}</strong>
                        <span className={`badge ${isUp ? 'badge-up' : 'badge-down'}`}>
                          {isUp ? '+' : ''}{f.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

