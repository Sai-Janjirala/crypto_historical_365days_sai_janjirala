import React, { useState, useEffect } from 'react';
import coinService from '../services/coinService';
import { AlertOctagon, MessageSquareAlert, Send, FileText, CheckCircle, Search, Filter, Loader2, RefreshCw } from 'lucide-react';

export default function Reports() {
  // Form states
  const [selectedCoin, setSelectedCoin] = useState('');
  const [reportType, setReportType] = useState('scam');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  // UI state
  const [coinsList, setCoinsList] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await coinService.getLatest();
        if (res.success && Array.isArray(res.data)) {
          setCoinsList(res.data);
        }
      } catch (err) {
        console.error('Failed to load coins directory for report selection:', err);
      } finally {
        setLoadingCoins(false);
      }
    }
    fetchCoins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Stub for Commit 2 submission implementation
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Page Header */}
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertOctagon size={28} color="var(--danger)" />
          <span>Coin Reports & Scam Center</span>
        </h1>
        <p className="page-subtitle">Submit security alerts, flag suspected rug pulls, or report coin parameter inaccuracies directly to verification systems.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Side: Report Submission Form */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareAlert size={18} color="var(--primary-hover)" />
            <span>Submit Intelligence Report</span>
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Coin Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Target Asset</label>
              {loadingCoins ? (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Loading catalog...</div>
              ) : (
                <select
                  className="form-input"
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  required
                  style={{ width: '100%', background: 'var(--bg-dark)' }}
                >
                  <option value="">-- Choose target coin --</option>
                  {coinsList.map((c) => (
                    <option key={c.coin_id} value={c.coin_id}>
                      {c.coin_name} ({c.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Incident Classification */}
            <div>
              <label className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Classification</label>
              <select
                className="form-input"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-dark)' }}
              >
                <option value="scam">Project Scam / Rugpull Suspicion</option>
                <option value="inaccurate_price">Pricing / Market Data Inaccuracy</option>
                <option value="missing_history">Missing Historical Metrics</option>
                <option value="security_exploit">Smart Contract Security Risk</option>
                <option value="other">Other Incident Type</option>
              </select>
            </div>

            {/* Reporter Email */}
            <div>
              <label className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Reporter Email Address (for verification)</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. analyst@domain.com"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                required
              />
            </div>

            {/* Evidence Link */}
            <div>
              <label className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>On-Chain Evidence URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="e.g. explorer hash or report link"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Incident Description</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Describe the scam indicators, incorrect pricing metrics, or smart contract bugs observed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <Send size={16} />
              <span>Submit Incident Report</span>
            </button>
          </form>
        </div>

        {/* Right Side: Informative Card / Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="var(--primary-hover)" />
              <span>Verification Standards</span>
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              CryptoSphere maintains a high-quality historical database. To prevent catalog manipulation, reports are cross-referenced with on-chain oracle APIs. 
            </p>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: 'var(--danger)' }}>⚠️</span>
                <span>Submitting spam reports will lead to reporter IP/account rate limits.</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: 'var(--success)' }}>🛡️</span>
                <span>Verified security vulnerabilities are eligible for our Bug Bounty program.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
