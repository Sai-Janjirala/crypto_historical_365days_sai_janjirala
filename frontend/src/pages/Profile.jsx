import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { User, Mail, Shield, ShieldCheck, KeyRound, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile, logout } = useAuth();

  // Edit profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passErr, setPassErr] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setProfileErr('Name and email are required');
      return;
    }

    setProfileErr('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      await authService.updateProfile({ name, email });
      await refreshProfile();
      setProfileSuccess('Profile details updated successfully');
    } catch (err) {
      setProfileErr(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPassErr('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassErr('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPassErr('Password must be at least 6 characters');
      return;
    }

    setPassErr('');
    setPassSuccess('');
    setPassLoading(true);

    try {
      await authService.changePassword(oldPassword, newPassword);
      setPassSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassErr(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (deleteInput !== 'DELETE') return;

    setDeleteLoading(true);
    try {
      await authService.deleteProfile();
      await logout();
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      <div>
        <h1 className="page-title">User Account</h1>
        <p className="page-subtitle">Manage your profile, password, and settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Profile Card & Info Edit */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary-hover)" />
            <span>Profile Details</span>
          </h2>

          {profileSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '13px', marginBottom: '16px' }}>
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileErr && (
            <div style={{ padding: '12px', background: 'var(--danger-glow)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>
              {profileErr}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Account ID</label>
              <input type="text" className="form-input" style={{ opacity: 0.6, cursor: 'not-allowed' }} value={user?.id || ''} readOnly />
            </div>

            <div>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required disabled={profileLoading} />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={profileLoading} />
            </div>

            <div>
              <label className="form-label">Account Role</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: user?.role === 'admin' ? 'var(--warning)' : 'var(--success)', fontSize: '14px', fontWeight: 600 }}>
                {user?.role === 'admin' ? <Shield size={16} /> : <ShieldCheck size={16} />}
                <span style={{ textTransform: 'capitalize' }}>{user?.role || 'user'}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }} disabled={profileLoading}>
              {profileLoading ? <Loader2 className="pulsing-glow" size={16} /> : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={20} color="var(--primary-hover)" />
            <span>Update Password</span>
          </h2>

          {passSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '13px', marginBottom: '16px' }}>
              <CheckCircle2 size={16} />
              <span>{passSuccess}</span>
            </div>
          )}
          {passErr && (
            <div style={{ padding: '12px', background: 'var(--danger-glow)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>
              {passErr}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required disabled={passLoading} />
            </div>

            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={passLoading} />
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={passLoading} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }} disabled={passLoading}>
              {passLoading ? <Loader2 className="pulsing-glow" size={16} /> : 'Update Password'}
            </button>
          </form>
        </div>

      </div>

      {/* Danger Zone */}
      <div className="glass-panel" style={{ padding: '24px', borderColor: 'rgba(244, 63, 94, 0.25)', background: 'rgba(244, 63, 94, 0.02)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} />
          <span>Danger Zone</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Deleting your profile is permanent and will instantly erase your simulated portfolios, credentials, and settings.
        </p>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger">
            Delete Profile
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
              To verify deletion, type <span style={{ color: 'var(--danger)' }}>DELETE</span> below:
            </p>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: 'var(--danger)' }}
              placeholder="DELETE"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                className="btn btn-danger"
                disabled={deleteInput !== 'DELETE' || deleteLoading}
                onClick={handleDeleteProfile}
              >
                {deleteLoading ? <Loader2 className="pulsing-glow" size={16} /> : 'I understand, delete account'}
              </button>
              <button
                className="btn btn-secondary"
                disabled={deleteLoading}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
