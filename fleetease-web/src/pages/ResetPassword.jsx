import React, { useState } from 'react';
import api from '../utils/api';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from '../components/Toast';
import AuthLayout from '../components/AuthLayout';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const token = sp.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Missing or invalid reset token.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const r = await api.post('/auth/reset', { token, password });
      if (r.data?.ok) {
        setOk(true);
        toast('Password updated successfully!', 'success');
        setTimeout(() => nav('/login'), 1500);
      } else {
        setErrorMsg('Failed to reset password. Token may have expired.');
      }
    } catch {
      setErrorMsg('Failed to reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Choose a new secure password">
      <div
        className="p-4 p-md-5 bg-white rounded-4 border"
        style={{
          borderColor: '#E2E8F0',
          boxShadow: '0 4px 20px rgba(16, 27, 53, 0.06)',
        }}
      >
        <div className="mb-4">
          <Link
            to="/login"
            className="d-inline-flex align-items-center gap-1 text-decoration-none small text-muted mb-3"
            style={{ fontSize: '0.75rem' }}
          >
            <ArrowLeft size={13} />
            <span>Back to sign in</span>
          </Link>
          <h2 className="h4 fw-bold mb-1" style={{ color: '#0F172A', letterSpacing: '-0.3px' }}>
            Set new password
          </h2>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center gap-2 p-3 mb-3 rounded-3" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {ok ? (
          <div className="alert alert-success d-flex align-items-center gap-2 p-3 mb-4 rounded-3" style={{ fontSize: '0.8125rem' }}>
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
            <div>
              <div className="fw-semibold">Password updated successfully!</div>
              <div className="small text-muted">Redirecting you to the sign-in portal…</div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                New password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={15} color="#94A3B8" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                Confirm new password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={15} color="#94A3B8" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="Re-type your password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #246BFD, #0052e0)',
                fontSize: '0.875rem',
                fontWeight: 600,
                height: 42,
                borderRadius: 8,
              }}
            >
              <span>{loading ? 'Updating password…' : 'Save New Password'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        )}

        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: '#E2E8F0', fontSize: '0.8125rem' }}>
          <span className="text-muted">Return to </span>
          <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#246BFD' }}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
