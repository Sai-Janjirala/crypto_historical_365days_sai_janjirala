import React, { useEffect, useState } from 'react';
import coinService from '../services/coinService';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Coins() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  // Fetch handler
  const fetchCoins = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      const queryParams = { page, limit };

      if (searchQuery) {
        // Full text search
        const res = await coinService.searchCoins(searchQuery);
        if (res.success) {
          data = res.data;
          setHasMore(false); // Search returns fixed set
        }
      } else if (selectedPreset) {
        // Sorting presets
        const res = await coinService.sortByPreset(selectedPreset, queryParams);
        if (res.success) {
          data = res.data;
          setHasMore(data.length === limit);
        }
      } else if (selectedFilter) {
        // Filtering presets
        const res = await coinService.filterPreset(selectedFilter, queryParams);
        if (res.success) {
          data = res.data;
          setHasMore(data.length === limit);
        }
      } else {
        // General paginated list
        const res = await coinService.getAllCoins(queryParams);
        if (res.success) {
          data = res.data;
          setHasMore(data.length === limit);
        }
      }

      setCoins(data);
    } catch (err) {
      console.error('Error loading directory:', err);
      setError('Failed to fetch coin listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, [page, selectedPreset, selectedFilter]);

  // Debounced/manual search triggers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCoins();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPreset('');
    setSelectedFilter('');
    setPage(1);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatCap = (cap) => {
    if (cap === null || cap === undefined) return 'N/A';
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Title */}
      <div>
        <h1 className="page-title">Coins Directory</h1>
        <p className="page-subtitle">Search, sort, and filter historical coin records.</p>
      </div>

      {/* Control panel (Search & Filters) */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Row 1: Search Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px', height: '18px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search coins by ID, name, or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Search
          </button>
          <button type="button" className="btn btn-secondary" onClick={clearFilters} disabled={loading}>
            Clear
          </button>
        </form>

        {/* Row 2: Sort & Filter drop-downs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <SlidersHorizontal size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sort Preset:</span>
            <select
              className="form-input"
              style={{ flexGrow: 1, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)' }}
              value={selectedPreset}
              onChange={(e) => {
                setSelectedFilter('');
                setSelectedPreset(e.target.value);
                setPage(1);
              }}
            >
              <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>None</option>
              <option value="price-asc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Price (Low to High)</option>
              <option value="price-desc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Price (High to Low)</option>
              <option value="volume-desc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Volume (High to Low)</option>
              <option value="rank-asc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Rank (Low to High)</option>
              <option value="return-desc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Daily Return (High to Low)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <SlidersHorizontal size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Filter Preset:</span>
            <select
              className="form-input"
              style={{ flexGrow: 1, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)' }}
              value={selectedFilter}
              onChange={(e) => {
                setSelectedPreset('');
                setSelectedFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>None</option>
              <option value="bullish" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Bullish (Positive Return)</option>
              <option value="bearish" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Bearish (Negative Return)</option>
              <option value="high-price" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>High Price (&gt;= $100)</option>
              <option value="low-price" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Low Price (&lt; $100)</option>
              <option value="high-volume" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>High Volume (&gt;= 1M)</option>
              <option value="high-volatility" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>High Volatility (&gt;= 10%)</option>
              <option value="profitable" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Profitable (Cumulative &gt; 0)</option>
            </select>
          </div>

        </div>

      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Directory Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textRendering: 'optimizeLegibility' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '14px 10px', textAlign: 'left' }}>Rank</th>
              <th style={{ padding: '14px 10px', textAlign: 'left' }}>Asset Name</th>
              <th style={{ padding: '14px 10px', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '14px 10px', textAlign: 'right' }}>Market Cap</th>
              <th style={{ padding: '14px 10px', textAlign: 'right' }}>Volume (24H)</th>
              <th style={{ padding: '14px 10px', textAlign: 'right' }}>Daily Return</th>
              <th style={{ padding: '14px 10px', textAlign: 'right' }}>Volatility</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading table skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td colSpan={7} style={{ padding: '16px 10px' }}>
                    <div style={{ height: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse-slow 2s infinite ease-in-out' }} />
                  </td>
                </tr>
              ))
            ) : coins.length > 0 ? (
              coins.map((coin, index) => {
                const isUp = (coin.daily_return || 0) >= 0;
                return (
                  <tr 
                    key={coin.coin_id || coin._id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      #{coin.market_cap_rank || index + 1}
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <Link 
                        to={`/coins/${coin.coin_id}`} 
                        style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: '#fff' }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{coin.coin_name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{coin.symbol}</span>
                      </Link>
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                      {formatPrice(coin.price)}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {formatCap(coin.market_cap)}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {formatCap(coin.volume)}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      <span className={`badge ${isUp ? 'badge-up' : 'badge-down'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                        {isUp ? '+' : ''}{coin.daily_return?.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {coin.volatility_7d ? `${coin.volatility_7d.toFixed(2)}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No coin records found. Try modifying your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!searchQuery && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Viewing Page <strong>{page}</strong>
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 14px' }}
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 14px' }}
              disabled={!hasMore || loading}
              onClick={() => setPage(page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
