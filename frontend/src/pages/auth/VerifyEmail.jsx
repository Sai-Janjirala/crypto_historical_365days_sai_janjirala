import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { CheckCircle2, ArrowRight, Loader2, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [err, setErr] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !token) {
      setErr('Email and Token are required to verify account');
      return;
    }

    setErr('');
    setLoading(true);
    try {
      await authService.verifyEmail(email, token);
      setVerified(true);
    } catch (error) {
      setErr(error.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 20px', display: 'block' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', marginBottom: '10px', color: '#fff' }}>
            Account Verified!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
            Thank you! Your email has been successfully verified. You can now access all features.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <span>Go to Login</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', textAlign: 'left' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', marginBottom: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={28} color="var(--primary-hover)" />
          <span>Verify Account</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Please verify your email address to confirm ownership.
        </p>

        {err && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--danger-glow)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13px', marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px', height: '16px' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Verification Code / Token</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter verification token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }} disabled={loading}>
            {loading ? <Loader2 className="pulsing-glow" size={18} /> : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
