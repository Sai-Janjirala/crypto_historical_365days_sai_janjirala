import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Temporary page placeholders (will be built out in future PRs)
function HomePlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
        <h1 className="page-title">Welcome to CryptoSphere</h1>
        <p className="page-subtitle">A premium 365-day historical analytics dashboard.</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <span className="badge badge-up">+14.2% Market Cap</span>
          <span className="badge badge-down">-2.4% Volatility Spike</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px', textAlign: 'left' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '10px' }}>Market Trends</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Analyze trending, highest-volume, and high-performance coins from our curated real-time directory.
          </p>
        </div>
        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px', textAlign: 'left' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '10px' }}>Advanced Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Evaluate volatility ratios, check yearly analyses, run comparison matrices, and forecast portfolios.
          </p>
        </div>
      </div>
    </div>
  );
}

function PagePlaceholder({ title }) {
  return (
    <div className="glass-panel" style={{ padding: '40px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', marginBottom: '8px' }}>{title} Page</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>This section is currently under construction and will be implemented in a subsequent PR step.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePlaceholder />} />
            <Route path="coins" element={<PagePlaceholder title="Coins Directory" />} />
            <Route path="compare" element={<PagePlaceholder title="Compare Coins" />} />
            <Route path="heatmap" element={<PagePlaceholder title="Market Heatmap" />} />
            <Route path="stats" element={<PagePlaceholder title="Global Statistics" />} />
            <Route path="analytics" element={<PagePlaceholder title="Analytics Hub" />} />
            <Route path="portfolio" element={<PagePlaceholder title="Portfolio Simulator" />} />
            <Route path="admin" element={<PagePlaceholder title="Admin Panel" />} />
            <Route path="settings" element={<PagePlaceholder title="Settings" />} />
            <Route path="*" element={<PagePlaceholder title="404 Not Found" />} />
          </Route>
          
          {/* Authentication Pages (Full Viewport) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
