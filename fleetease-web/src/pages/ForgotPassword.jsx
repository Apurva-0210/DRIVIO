import React, { useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot', { email });
      setSent(true);
    } catch {
      setSent(true); // avoid enumeration
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Reset your account password securely">
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
            Forgot your password?
          </h2>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
            Enter your verified email address and we'll send you password recovery instructions.
          </p>
        </div>

        {sent ? (
          <div className="alert alert-success d-flex align-items-start gap-2 p-3 mb-4 rounded-3" style={{ fontSize: '0.8125rem' }}>
            <CheckCircle2 size={16} className="mt-1 flex-shrink-0 text-success" />
            <div>
              <div className="fw-semibold">Recovery instructions generated</div>
              <div className="mt-1 text-muted">
                If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                Account email
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Mail size={15} color="#94A3B8" />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@drivio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <span>{loading ? 'Sending link…' : 'Send Reset Instructions'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        )}

        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: '#E2E8F0', fontSize: '0.8125rem' }}>
          <span className="text-muted">Remember your password? </span>
          <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#246BFD' }}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
