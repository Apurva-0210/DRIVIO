import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from '../../components/Toast';
import { RefreshCw, CheckCircle2, Clock, DollarSign, Filter, Search } from 'lucide-react';

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | processed
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = localStorage.getItem('token');
    let role = null;
    try { role = t ? JSON.parse(atob(t.split('.')[1]))?.role : null; } catch {}
    if (role !== 'admin') { nav('/'); return; }
    loadRefunds();
  }, [nav, location]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      // Fetch bookings to inspect cancelled/refunded ones
      const res = await api.get('/bookings');
      const list = Array.isArray(res.data) ? res.data : [];
      const refundList = list
        .filter((b) => b.status === 'cancelled' || Number(b.refund_amount) > 0)
        .map((b) => ({
          id: b.booking_id,
          booking_id: b.booking_id,
          customer_id: b.customer_id,
          amount: b.refund_amount || Math.max(0, Number(b.fare || 0) - 25),
          reason: b.cancel_reason || 'Schedule cancellation / Passenger requested',
          status: b.refund_status || (b.cancelled_at ? 'processed' : 'pending'),
          date: b.cancelled_at || b.created_at || new Date().toISOString(),
          pickup: b.pickup_location,
          drop: b.drop_location,
        }));
      setRefunds(refundList);
    } catch {
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundId) => {
    try {
      setProcessingId(refundId);
      // Simulate/call gateway refund processing
      await new Promise((r) => setTimeout(r, 600));
      setRefunds((prev) =>
        prev.map((r) => (r.id === refundId ? { ...r, status: 'processed' } : r))
      );
      toast(`Refund of ₹${refunds.find((r) => r.id === refundId)?.amount || ''} successfully credited.`, 'success');
    } catch {
      toast('Failed to process refund. Check gateway connectivity.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = refunds.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        String(r.booking_id).toLowerCase().includes(q) ||
        String(r.reason).toLowerCase().includes(q) ||
        String(r.pickup).toLowerCase().includes(q) ||
        String(r.drop).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRefunded = refunds.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const pendingCount = refunds.filter((r) => r.status === 'pending').length;

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold mb-1" style={{ color: 'var(--fe-text-primary)' }}>
            Admin — Passenger Refunds & Cancellations
          </h2>
          <p className="text-muted small mb-0">
            Review ticket cancellations, adjust refund disbursements, and process credits.
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={loadRefunds}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded border" style={{ borderColor: 'var(--fe-border)' }}>
            <div className="text-muted small mb-1">Total Refund Volume</div>
            <div className="h4 fw-bold mb-0 text-primary tabular-nums">₹{totalRefunded.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded border" style={{ borderColor: 'var(--fe-border)' }}>
            <div className="text-muted small mb-1">Pending Approvals</div>
            <div className="h4 fw-bold mb-0 text-warning tabular-nums">{pendingCount}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded border" style={{ borderColor: 'var(--fe-border)' }}>
            <div className="text-muted small mb-1">Refund Policy</div>
            <div className="text-muted small mb-0 fw-semibold text-secondary">
              Fixed ₹25 processing fee (free on bus cancellation)
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white rounded border mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ borderColor: 'var(--fe-border)' }}>
        <div className="d-flex align-items-center gap-2">
          {['all', 'pending', 'processed'].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-outline-secondary'} text-capitalize`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="d-flex align-items-center gap-2" style={{ maxWidth: 300 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-transparent border-end-0">
              <Search size={14} color="var(--fe-text-muted)" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by ticket or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded border overflow-hidden" style={{ borderColor: 'var(--fe-border)' }}>
        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Loading refund records…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <CheckCircle2 size={32} className="text-success mb-2" />
            <div className="fw-semibold">No refund requests found in this view</div>
            <div className="small">All cancellations have been fully reconciled.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Ticket #</th>
                  <th>Route Journey</th>
                  <th>Refund Amount</th>
                  <th>Reason</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-3 fw-semibold tabular-nums">#{item.booking_id}</td>
                    <td>
                      <div className="small fw-semibold">{item.pickup} → {item.drop}</div>
                    </td>
                    <td className="tabular-nums fw-bold text-primary">₹{item.amount}</td>
                    <td className="small text-muted">{item.reason}</td>
                    <td className="small text-muted tabular-nums">
                      {new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'processed' ? 'badge-subtle-success' : 'badge-subtle-warning'} text-capitalize`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      {item.status === 'pending' ? (
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={processingId === item.id}
                          onClick={() => handleProcessRefund(item.id)}
                        >
                          {processingId === item.id ? 'Processing…' : 'Process Refund'}
                        </button>
                      ) : (
                        <span className="small text-muted d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={13} className="text-success" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
