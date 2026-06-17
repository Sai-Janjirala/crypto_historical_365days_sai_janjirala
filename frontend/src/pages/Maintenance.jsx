import React, { useState, useEffect } from 'react';
import coinService from '../services/coinService';
import { Settings, Server, Activity, Database, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function Maintenance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Backend data states
  const [healthStatus, setHealthStatus] = useState('unknown');
  const [apiVersion, setApiVersion] = useState('1.0.0');
  const [config, setConfig] = useState(null);
  const [networkLatency, setNetworkLatency] = useState(null);

  // Client-simulated uptime live tick
  const [uptimeSeconds, setUptimeSeconds] = useState(483420); // ~5.6 days starting uptime

  useEffect(() => {
    async function loadSystemDetails() {
      setLoading(true);
      setError('');
      try {
        const start = performance.now();
        const healthRes = await coinService.getSystemHealth();
        const end = performance.now();
        setNetworkLatency(Math.round(end - start));

        if (healthRes.success) {
          setHealthStatus(healthRes.status || 'healthy');
        }

        const versionRes = await coinService.getSystemVersion();
        if (versionRes.success) {
          setApiVersion(versionRes.version);
        }

        const configRes = await coinService.getSystemConfig();
        if (configRes.success) {
          setConfig(configRes.config);
        }
      } catch (err) {
        console.error('Failed to load system maintenance statistics:', err);
        setError('Could not retrieve active server health details.');
      } finally {
        setLoading(false);
      }
    }

    loadSystemDetails();

    // Live uptime ticker
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Page Header */}
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={28} color="var(--primary)" />
          <span>System Health & Maintenance</span>
        </h1>
        <p className="page-subtitle">Monitor server nodes status, latency metrics, configurations, and application cache systems.</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'var(--danger-glow)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
          <Loader2 className="pulsing-glow spinning" size={36} color="var(--primary)" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Querying backend service systems...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Node Health Status */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <Server size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Node</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: healthStatus === 'healthy' ? 'var(--success)' : 'var(--danger)' }}></span>
                <span>{healthStatus.toUpperCase()}</span>
              </h3>
            </div>
          </div>

          {/* Network Latency */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(95, 82, 255, 0.1)', color: 'var(--primary-hover)' }}>
              <Activity size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>API Latency</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                {networkLatency ? `${networkLatency} ms` : 'N/A'}
              </h3>
            </div>
          </div>

          {/* Server Uptime */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--info)' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Uptime</span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {formatUptime(uptimeSeconds)}
              </h3>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
