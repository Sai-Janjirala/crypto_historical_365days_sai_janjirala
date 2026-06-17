import React, { useState, useEffect } from 'react';
import coinService from '../services/coinService';
import { Briefcase, Plus, Trash2, AlertTriangle, CheckCircle, Percent, DollarSign, Play, Loader2, Sparkles } from 'lucide-react';

export default function Portfolio() {
  const [allCoins, setAllCoins] = useState([]);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [error, setError] = useState('');

  // Simulation states
  const [simulating, setSimulating] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Fetch all coins to populate the selection dropdown
  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await coinService.getLatest();
        if (res.success && Array.isArray(res.data)) {
          setAllCoins(res.data);
          if (res.data.length > 0) {
            setSelectedCoinId(res.data[0].coin_id);
          }
        }
      } catch (err) {
        console.error('Failed to load coins:', err);
        setError('Could not fetch coins list.');
      } finally {
        setLoadingCoins(false);
      }
    }
    fetchCoins();
  }, []);

  const handleAddAsset = () => {
    if (!selectedCoinId) return;
    
    // Check if asset already exists in allocation
    if (allocations.some(a => a.coinId === selectedCoinId)) {
      setError('This coin is already added to your allocation.');
      return;
    }

    const coin = allCoins.find(c => c.coin_id === selectedCoinId);
    if (!coin) return;

    setError('');
    const newAllocation = {
      coinId: coin.coin_id,
      name: coin.coin_name,
      symbol: coin.symbol,
      currentPrice: coin.price,
      weight: 0 // Initialize weight to 0%
    };

    setAllocations([...allocations, newAllocation]);
  };

  const handleUpdateWeight = (coinId, value) => {
    setError('');
    const numericValue = parseFloat(value);
    const weightVal = isNaN(numericValue) ? 0 : Math.max(0, Math.min(100, numericValue));

    setAllocations(allocations.map(a => 
      a.coinId === coinId ? { ...a, weight: weightVal } : a
    ));
  };

  const handleRemoveAsset = (coinId) => {
    setError('');
    setAllocations(allocations.filter(a => a.coinId !== coinId));
  };

  const totalWeight = allocations.reduce((sum, a) => sum + a.weight, 0);
  const isWeightValid = totalWeight === 100;

  const calculateVolatility = (timeline) => {
    const dailyChanges = [];
    for (let i = 1; i < timeline.length; i++) {
      const prev = timeline[i - 1].value;
      const curr = timeline[i].value;
      if (prev > 0) {
        dailyChanges.push(((curr - prev) / prev) * 100);
      }
    }
    if (dailyChanges.length === 0) return 0;
    const mean = dailyChanges.reduce((sum, val) => sum + val, 0) / dailyChanges.length;
    const variance = dailyChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyChanges.length;
    return Math.sqrt(variance);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (allocations.length === 0) {
      setError('Please add at least one asset to simulate.');
      return;
    }
    if (!isWeightValid) {
      setError(`Total weight must equal 100%. Currently at ${totalWeight}%.`);
      return;
    }
    setError('');
    setSimulating(true);
    setSimulated(false);
    setSimulationResult(null);

    try {
      // Fetch history for each selected coin in parallel
      const historyPromises = allocations.map(a => coinService.getHistory(a.coinId));
      const historyResponses = await Promise.all(historyPromises);

      const coinHistories = historyResponses.map((res, index) => {
        if (!res.success || !Array.isArray(res.data)) {
          throw new Error(`Failed to load historical data for ${allocations[index].name}.`);
        }
        return {
          coinId: allocations[index].coinId,
          weight: allocations[index].weight,
          name: allocations[index].name,
          history: [...res.data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        };
      });

      // Map prices by date and coin
      const priceByDateAndCoin = {};
      const allDatesSet = new Set();
      const getLocalDateString = (timestamp) => new Date(timestamp).toISOString().split('T')[0];

      coinHistories.forEach(ch => {
        ch.history.forEach(item => {
          const dStr = getLocalDateString(item.timestamp);
          if (!priceByDateAndCoin[dStr]) {
            priceByDateAndCoin[dStr] = {};
          }
          priceByDateAndCoin[dStr][ch.coinId] = item.price;
          allDatesSet.add(dStr);
        });
      });

      // Filter dates that have prices for ALL selected coins to align timeline
      const sortedDates = Array.from(allDatesSet).sort().filter(dStr => {
        return coinHistories.every(ch => priceByDateAndCoin[dStr][ch.coinId] !== undefined);
      });

      if (sortedDates.length === 0) {
        throw new Error('No overlapping historical dates found for the selected assets.');
      }

      // Compute units purchased on Day 0
      const firstDate = sortedDates[0];
      const units = {};
      coinHistories.forEach(ch => {
        const initialPrice = priceByDateAndCoin[firstDate][ch.coinId];
        const investedAmt = (ch.weight / 100) * initialInvestment;
        units[ch.coinId] = investedAmt / (initialPrice || 1);
      });

      // Create daily valuation timeline
      const timeline = sortedDates.map(dStr => {
        let totalVal = 0;
        const breakDown = {};
        coinHistories.forEach(ch => {
          const price = priceByDateAndCoin[dStr][ch.coinId];
          const coinVal = units[ch.coinId] * price;
          totalVal += coinVal;
          breakDown[ch.coinId] = {
            price,
            value: coinVal
          };
        });

        return {
          date: dStr,
          formattedDate: new Date(dStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: totalVal,
          breakDown
        };
      });

      const startingBalance = initialInvestment;
      const endingBalance = timeline[timeline.length - 1].value;
      const netReturnAmount = endingBalance - startingBalance;
      const netReturnPercent = (netReturnAmount / startingBalance) * 100;
      const volatility = calculateVolatility(timeline);

      setSimulationResult({
        timeline,
        startingBalance,
        endingBalance,
        netReturnAmount,
        netReturnPercent,
        volatility
      });
      setSimulated(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during simulation.');
    } finally {
      setSimulating(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Page Header */}
      <div>
        <h1 className="page-title">Portfolio Simulator</h1>
        <p className="page-subtitle">Design your target cryptocurrency portfolio allocation and simulate past returns.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Allocation Config Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <Briefcase size={20} color="var(--primary-hover)" />
            <span>Allocation Builder</span>
          </h2>

          {/* Investment settings */}
          <div>
            <label className="form-label">Initial Mock Investment ($)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <DollarSign size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={initialInvestment}
                onChange={e => setInitialInvestment(Math.max(1, parseFloat(e.target.value) || 0))}
                min="1"
              />
            </div>
          </div>

          {/* Add Coin Row */}
          <div>
            <label className="form-label">Choose Asset to Add</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="form-input"
                value={selectedCoinId}
                onChange={e => setSelectedCoinId(e.target.value)}
                disabled={loadingCoins || simulating}
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
                onClick={handleAddAsset}
                disabled={loadingCoins || !selectedCoinId || simulating}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="glass-panel" style={{ padding: '12px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Allocation Weights Table */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Allocated Assets
            </h3>

            {allocations.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '13px' }}>
                No assets added yet. Add coins above to configure allocations.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allocations.map(asset => (
                  <div 
                    key={asset.coinId} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-sm)' 
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{asset.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{asset.symbol} • ${asset.currentPrice?.toLocaleString()}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '90px' }}>
                        <input
                          type="number"
                          className="form-input"
                          style={{ paddingRight: '28px', textAlign: 'right' }}
                          value={asset.weight === 0 ? '' : asset.weight}
                          placeholder="0"
                          onChange={e => handleUpdateWeight(asset.coinId, e.target.value)}
                          min="0"
                          max="100"
                          disabled={simulating}
                        />
                        <Percent size={12} style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }} />
                      </div>
                      <button 
                        type="button" 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                        onClick={() => handleRemoveAsset(asset.coinId)}
                        disabled={simulating}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Validation Status Indicator */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 16px', 
                    marginTop: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isWeightValid ? 'var(--success-glow)' : 'rgba(245, 158, 11, 0.05)',
                    border: `1px solid ${isWeightValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    {isWeightValid ? (
                      <CheckCircle size={16} color="var(--success)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--warning)" />
                    )}
                    <span style={{ color: isWeightValid ? 'var(--success)' : 'var(--warning)', fontWeight: 500 }}>
                      {isWeightValid ? 'Perfect Allocation (100%)' : `Weight sum: ${totalWeight}%`}
                    </span>
                  </div>
                  <strong style={{ fontSize: '14px', color: isWeightValid ? 'var(--success)' : 'var(--warning)' }}>
                    {totalWeight}%
                  </strong>
                </div>
              </div>
            )}
          </div>

          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={!isWeightValid || allocations.length === 0 || simulating}
            onClick={handleSimulate}
          >
            {simulating ? <Loader2 size={16} className="spinning" /> : <Play size={16} fill="#fff" />}
            <span>{simulating ? 'Computing Simulation...' : 'Simulate Portfolio Growth'}</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '300px', justifyContent: 'center' }}>
          {simulating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 className="pulsing-glow spinning" size={36} color="var(--primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Processing historic parallel aggregates...</span>
            </div>
          )}

          {!simulating && !simulated && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Briefcase size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Simulation Results</h3>
              <p style={{ fontSize: '13px', maxWidth: '280px' }}>
                Configure your asset allocations to 100% and click simulate to visualize historical portfolio trends.
              </p>
            </div>
          )}

          {!simulating && simulated && simulationResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--warning)" />
                <span>Simulation Summary</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Starting Balance:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(simulationResult.startingBalance)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ending Balance:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(simulationResult.endingBalance)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Net Return ($):</span>
                  <span style={{ fontWeight: 600, color: simulationResult.netReturnAmount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {simulationResult.netReturnAmount >= 0 ? '+' : ''}{formatCurrency(simulationResult.netReturnAmount)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Net Return (%):</span>
                  <span style={{ fontWeight: 600, color: simulationResult.netReturnPercent >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {simulationResult.netReturnPercent >= 0 ? '+' : ''}{simulationResult.netReturnPercent.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Portfolio Volatility (Daily Std Dev):</span>
                  <span style={{ fontWeight: 600, color: 'var(--info)' }}>{simulationResult.volatility.toFixed(3)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

