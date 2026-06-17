import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { KeyRound, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'test-reset-token';
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }

    setErr('');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSubmitted(true);
    } catch (error) {
      setErr(error.response?.data?.message || error.message || 'Failed to reset password');
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
            Password Reset Completed
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
            Your password has been successfully updated. You can now log in using your new credentials.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <span>Sign In Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', textAlign: 'left' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', marginBottom: '8px', color: '#fff' }}>
          Choose New Password
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Create a secure, strong password for your account.
        </p>

        {err && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--danger-glow)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13px', marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px', height: '16px' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px', height: '16px' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }} disabled={loading}>
            {loading ? <Loader2 className="pulsing-glow" size={18} /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
