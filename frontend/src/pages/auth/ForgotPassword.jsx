import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import { Mail, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setErr('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      setErr(error.response?.data?.message || error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 20px', display: 'block' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', marginBottom: '10px', color: '#fff' }}>
            Check Your Email
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
            If the account exists, we have sent instructions to reset your password to <strong>{email}</strong>.
          </p>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', textAlign: 'left' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', marginBottom: '24px', fontWeight: 500 }}>
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
        
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', marginBottom: '8px', color: '#fff' }}>
          Reset Password
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Enter your email address and we'll send you a password reset link.
        </p>

        {err && (
          <div style={{ padding: '12px', background: 'var(--danger-glow)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13px', marginBottom: '20px' }}>
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? <Loader2 className="pulsing-glow" size={18} /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
