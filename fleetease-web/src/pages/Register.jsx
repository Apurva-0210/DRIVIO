import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '../components/Toast';
import AuthLayout from '../components/AuthLayout';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(String(phone || ''))) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/register', { name, email, phone, password });
      toast('Account registered successfully! Please log in.', 'success');
      nav('/login');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Registration failed';
      setErrorMsg(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Create your passenger account for instant boarding passes">
      <div
        className="p-4 p-md-5 bg-white rounded-4 border"
        style={{
          borderColor: '#E2E8F0',
          boxShadow: '0 4px 20px rgba(16, 27, 53, 0.06)',
        }}
      >
        <div className="mb-4">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 mb-2" style={{ fontSize: '0.75rem' }}>
            Passenger Membership
          </span>
          <h2 className="h4 fw-bold mb-1" style={{ color: '#0F172A', letterSpacing: '-0.3px' }}>
            Create your account
          </h2>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
            Sign up for 1-click intercity booking, GPS journey alerts, and DRIVIO Miles rewards.
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center gap-2 p-3 mb-3 rounded-3" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
              Full name
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <User size={15} color="#94A3B8" />
              </span>
              <input
                className="form-control border-start-0 ps-0"
                placeholder="Apurva Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg(null);
                }}
                required
              />
            </div>
          </div>

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
                  setErrorMsg(null);
                }}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
              Phone number (10 digits)
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Phone size={15} color="#94A3B8" />
              </span>
              <input
                type="tel"
                className="form-control border-start-0 ps-0"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrorMsg(null);
                }}
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
              Choose password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Lock size={15} color="#94A3B8" />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
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
            <span>{loading ? 'Creating account…' : 'Create Passenger Account'}</span>
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: '#E2E8F0', fontSize: '0.8125rem' }}>
          <span className="text-muted">Already registered? </span>
          <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#246BFD' }}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
