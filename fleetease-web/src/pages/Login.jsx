import React, { useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { toast } from '../components/Toast';
import AuthLayout from '../components/AuthLayout';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Shield,
  CheckCircle2
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLoginError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setLoginError(null);
    try {
      const payload = { email: email.trim(), password };
      const r = await api.post('/auth/login', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const token = r.data?.token;
      if (!token) throw new Error('No authentication token received');
      localStorage.setItem('token', token);

      let role = r.data?.user?.role;
      if (!role) {
        try {
          role = JSON.parse(atob(token.split('.')[1]))?.role || null;
        } catch {}
      }

      toast('Signed in successfully', 'success');

      // Redirect directly to the authorized portal
      if (role === 'admin') window.location.href = '/admin/dashboard';
      else if (role === 'agent') window.location.href = '/agent/dashboard';
      else if (role === 'driver') window.location.href = '/driver/dashboard';
      else if (role === 'manager') window.location.href = '/manager/dashboard';
      else if (role === 'company_admin') window.location.href = '/company/charter';
      else window.location.href = '/my-bookings';
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Invalid email or password. Please try again.';
      setLoginError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div
        className="p-4 p-md-5 bg-white rounded-4 border"
        style={{
          borderColor: '#E2E8F0',
          boxShadow: '0 4px 24px rgba(16, 27, 53, 0.06)',
        }}
      >
        {/* Header with verified compliance badge */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span
              className="badge d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-2"
              style={{
                background: '#F1F5F9',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Shield size={13} color="#246BFD" />
              <span>DRIVIO Portal</span>
            </span>

            {/* 256-bit SSL Tab just like on Home */}
            <div
              className="d-flex align-items-center gap-2 px-2.5 py-1.5 rounded-2"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={14} color="#10B981" />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                256-Bit SSL
                <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.7rem' }}>Encrypted</span>
              </div>
            </div>
          </div>

          <h2 className="h4 fw-bold mb-1" style={{ color: '#0F172A', letterSpacing: '-0.4px' }}>
            Sign in to DRIVIO
          </h2>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
            Enter your registered email address and password to continue.
          </p>
        </div>

        {/* Error notification */}
        {loginError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 p-3 mb-4 rounded-3" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            <div>{loginError}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
              Email address
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Mail size={15} color="#94A3B8" />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError(null);
                }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-decoration-none small"
                style={{ color: '#246BFD', fontSize: '0.75rem', fontWeight: 500 }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Lock size={15} color="#94A3B8" />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(null);
                }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-group-text bg-white border-start-0 text-muted"
                onClick={() => setShowPwd((s) => !s)}
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label text-muted" htmlFor="rememberMe" style={{ fontSize: '0.8125rem' }}>
                Keep me signed in
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white"
            disabled={loading}
            style={{
              background: '#246BFD',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              height: 42,
              borderRadius: 8,
            }}
          >
            <span>{loading ? 'Authenticating…' : 'Sign in'}</span>
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: '#E2E8F0', fontSize: '0.8125rem' }}>
          <span className="text-muted">Don&apos;t have an account? </span>
          <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: '#246BFD' }}>
            Register as passenger
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
