import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from '../../components/Toast';
import {
  Bus,
  Users,
  UserCheck,
  FileText,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  CreditCard
} from 'lucide-react';

export default function ManagerFleet() {
  const nav = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState('vehicles'); // 'vehicles' | 'drivers' | 'agents' | 'documents'
  const [data, setData] = useState({ drivers: [], agents: [], vehicles: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [docModal, setDocModal] = useState({
    open: false,
    id: null,
    entity_type: 'driver',
    entity_id: '',
    doc_type: '',
    doc_number: '',
    expiry_date: '',
    file_url: '',
    notes: '',
    working: false,
  });

  const [userModal, setUserModal] = useState({
    open: false,
    id: null,
    role: 'driver',
    name: '',
    email: '',
    phone: '',
    password: '',
    license_number: '',
    license_expiry: '',
    working: false,
  });

  const [vehForm, setVehForm] = useState({
    vehicle_number: '',
    type: '2x2 AC Seater',
    capacity: 40,
    status: 'available',
    working: false,
  });

  const refresh = async () => {
    try {
      setLoading(true);
      const r = await api.get('/manager/summary');
      setData(r.data || { drivers: [], agents: [], vehicles: [], documents: [] });
    } catch (err) {
      toast('Failed to load fleet data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    let role = null;
    try {
      role = t ? JSON.parse(atob(t.split('.')[1]))?.role : null;
    } catch {}
    if (role !== 'manager' && role !== 'admin') {
      nav('/');
      return;
    }
    refresh();
  }, [nav, location]);

  const editDoc = (d) =>
    setDocModal({
      open: true,
      id: d?.id || null,
      entity_type: d?.entity_type || 'driver',
      entity_id: d?.entity_id || '',
      doc_type: d?.doc_type || '',
      doc_number: d?.doc_number || '',
      expiry_date: d?.expiry_date || '',
      file_url: d?.file_url || '',
      notes: d?.notes || '',
      working: false,
    });

  const saveDoc = async () => {
    try {
      setDocModal((m) => ({ ...m, working: true }));
      const payload = {
        entity_type: docModal.entity_type,
        entity_id: Number(docModal.entity_id || 0),
        doc_type: docModal.doc_type,
        doc_number: docModal.doc_number,
        expiry_date: docModal.expiry_date || null,
        file_url: docModal.file_url,
        notes: docModal.notes,
      };
      if (docModal.id) {
        await api.put(`/manager/documents/${docModal.id}`, payload);
        toast('Compliance document updated', 'success');
      } else {
        await api.post('/manager/documents', payload);
        toast('Compliance document uploaded', 'success');
      }
      setDocModal({
        open: false,
        id: null,
        entity_type: 'driver',
        entity_id: '',
        doc_type: '',
        doc_number: '',
        expiry_date: '',
        file_url: '',
        notes: '',
        working: false,
      });
      refresh();
    } catch {
      toast('Failed to save document', 'error');
      setDocModal((m) => ({ ...m, working: false }));
    }
  };

  const deleteDoc = async (id) => {
    if (!window.confirm('Delete this compliance document?')) return;
    try {
      await api.delete(`/manager/documents/${id}`);
      toast('Document deleted', 'success');
      refresh();
    } catch {
      toast('Failed to delete document', 'error');
    }
  };

  const openAddUser = (role) =>
    setUserModal({
      open: true,
      id: null,
      role,
      name: '',
      email: '',
      phone: '',
      password: '',
      license_number: '',
      license_expiry: '',
      working: false,
    });

  const openEditUser = (u) =>
    setUserModal({
      open: true,
      id: u.user_id,
      role: u.role,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      license_number: u.license_number || '',
      license_expiry: u.license_expiry || '',
      working: false,
    });

  const saveUser = async () => {
    try {
      setUserModal((m) => ({ ...m, working: true }));
      const { id, role, name, email, phone, password, license_number, license_expiry } = userModal;
      if (!name || !email || (!id && !password)) {
        toast('Name, email, and initial password are required', 'error');
        setUserModal((m) => ({ ...m, working: false }));
        return;
      }
      if (role === 'driver' && !license_number) {
        toast('Valid commercial driver license number required', 'error');
        setUserModal((m) => ({ ...m, working: false }));
        return;
      }
      if (id) {
        await api.put(`/manager/users/${id}`, { name, email, phone, role, license_number, license_expiry });
      } else {
        await api.post('/manager/users', { name, email, phone, password, role, license_number, license_expiry });
      }
      toast(id ? 'Staff profile updated' : `${role === 'driver' ? 'Driver' : 'Agent'} account created`, 'success');
      setUserModal({
        open: false,
        id: null,
        role: 'agent',
        name: '',
        email: '',
        phone: '',
        password: '',
        license_number: '',
        license_expiry: '',
        working: false,
      });
      refresh();
    } catch (e) {
      toast('Failed to save staff account', 'error');
      setUserModal((m) => ({ ...m, working: false }));
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete staff account for ${u.name}?`)) return;
    try {
      await api.delete(`/manager/users/${u.user_id}`);
      toast('Staff member removed', 'success');
      refresh();
    } catch (e) {
      toast(e?.response?.data?.error || 'Failed to remove staff member', 'error');
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1240 }}>
      {/* Top Header with breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link
              to="/manager/dashboard"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 py-0.5 px-2 text-decoration-none"
              style={{ fontSize: '0.75rem' }}
            >
              <ArrowLeft size={12} />
              <span>Dashboard</span>
            </Link>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
              Operations Registry
            </span>
          </div>
          <h1 className="h4 fw-bold mb-0" style={{ color: '#0F172A', letterSpacing: '-0.3px' }}>
            Fleet & Vehicle Compliance Operations
          </h1>
          <p className="text-muted small mb-0 mt-0.5" style={{ fontSize: '0.8125rem' }}>
            Manage commercial coaches, assigned drivers, booking counter agents, and AIS-140 compliance records.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={refresh}
            title="Refresh records"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>

          {tab === 'vehicles' && (
            <button
              type="button"
              className="btn btn-sm btn-accent text-white d-flex align-items-center gap-1 shadow-sm"
              onClick={() => {
                const el = document.getElementById('addVehicleCard');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Plus size={14} />
              <span>Add Vehicle</span>
            </button>
          )}

          {tab === 'drivers' && (
            <button
              type="button"
              className="btn btn-sm btn-accent text-white d-flex align-items-center gap-1 shadow-sm"
              onClick={() => openAddUser('driver')}
            >
              <Plus size={14} />
              <span>Add Driver</span>
            </button>
          )}

          {tab === 'agents' && (
            <button
              type="button"
              className="btn btn-sm btn-accent text-white d-flex align-items-center gap-1 shadow-sm"
              onClick={() => openAddUser('agent')}
            >
              <Plus size={14} />
              <span>Add Station Agent</span>
            </button>
          )}

          {tab === 'documents' && (
            <button
              type="button"
              className="btn btn-sm btn-accent text-white d-flex align-items-center gap-1 shadow-sm"
              onClick={() => editDoc(null)}
            >
              <Plus size={14} />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY KPI TILES */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div
            className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Active Coaches</div>
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#0F172A' }}>{data.vehicles.length}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <Bus size={18} />
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Certified Drivers</div>
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#0F172A' }}>{data.drivers.length}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <UserCheck size={18} />
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Station Agents</div>
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#0F172A' }}>{data.agents.length}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
              <Users size={18} />
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Compliance Docs</div>
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#0F172A' }}>{data.documents.length}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* SEGMENTED TAB NAVIGATION */}
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 flex-wrap gap-2" style={{ borderColor: '#E2E8F0' }}>
        <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-2 border" style={{ borderColor: '#E2E8F0' }}>
          {[
            { id: 'vehicles', label: 'Coaches & FASTag', count: data.vehicles.length, icon: <Bus size={14} /> },
            { id: 'drivers', label: 'Roster Drivers', count: data.drivers.length, icon: <UserCheck size={14} /> },
            { id: 'agents', label: 'Station Agents', count: data.agents.length, icon: <Users size={14} /> },
            { id: 'documents', label: 'Safety & Compliance Docs', count: data.documents.length, icon: <FileText size={14} /> },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`btn btn-sm d-flex align-items-center gap-1.5 py-1.5 px-3 rounded-2 border-0 transition-all ${
                tab === t.id
                  ? 'bg-white text-primary shadow-sm fw-bold'
                  : 'text-secondary'
              }`}
              style={{ fontSize: '0.8125rem' }}
            >
              {t.icon}
              <span>{t.label}</span>
              <span className={`badge rounded-pill ms-1 ${tab === t.id ? 'bg-primary-subtle text-primary' : 'bg-light text-muted'}`} style={{ fontSize: '0.65rem' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Table Search */}
        <div className="position-relative" style={{ minWidth: 220 }}>
          <Search size={13} className="position-absolute top-50 start-0 translate-middle-y ms-2.5 text-muted" />
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search records…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: '0.8125rem', borderColor: '#CBD5E1' }}
          />
        </div>
      </div>

      {/* TAB 1: VEHICLES & FASTAG */}
      {tab === 'vehicles' && (
        <>
          {/* Add Vehicle Card */}
          <div
            id="addVehicleCard"
            className="p-3 bg-white rounded-3 border mb-4 shadow-sm"
            style={{ borderColor: '#E2E8F0' }}
          >
            <div className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.875rem', color: '#0F172A' }}>
              <Plus size={15} color="#2563EB" />
              <span>Register New Commercial Coach</span>
            </div>
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>Registration Number</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="BR-01-EXP-1102"
                  value={vehForm.vehicle_number}
                  onChange={(e) => setVehForm((v) => ({ ...v, vehicle_number: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>Vehicle Configuration</label>
                <select
                  className="form-select form-select-sm"
                  value={vehForm.type}
                  onChange={(e) => setVehForm((v) => ({ ...v, type: e.target.value }))}
                >
                  <option value="2x2 AC Seater">2x2 AC Seater</option>
                  <option value="2x2 Non-AC Seater">2x2 Non-AC Seater</option>
                  <option value="2x1 Sleeper AC">2x1 Sleeper AC</option>
                  <option value="2x1 Luxury Sleeper">2x1 Luxury Sleeper</option>
                  <option value="AC Multi-Axle Volvo">AC Multi-Axle Volvo</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>Seating Capacity</label>
                <input
                  className="form-control form-control-sm tabular-nums"
                  type="number"
                  placeholder="40"
                  value={vehForm.capacity}
                  onChange={(e) => setVehForm((v) => ({ ...v, capacity: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>Initial Status</label>
                <select
                  className="form-select form-select-sm"
                  value={vehForm.status}
                  onChange={(e) => setVehForm((v) => ({ ...v, status: e.target.value }))}
                >
                  <option value="available">Available</option>
                  <option value="active">Active (On Run)</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="col-md-2 d-grid">
                <button
                  type="button"
                  className="btn btn-sm btn-accent text-white fw-semibold"
                  disabled={vehForm.working}
                  onClick={async () => {
                    try {
                      setVehForm((v) => ({ ...v, working: true }));
                      if (!vehForm.vehicle_number) {
                        toast('Registration number is required', 'error');
                        setVehForm((v) => ({ ...v, working: false }));
                        return;
                      }
                      await api.post('/vehicles', {
                        vehicle_number: vehForm.vehicle_number,
                        type: vehForm.type,
                        capacity: vehForm.capacity ? Number(vehForm.capacity) : 40,
                        status: vehForm.status,
                      });
                      toast('Vehicle registered successfully', 'success');
                      setVehForm({
                        vehicle_number: '',
                        type: '2x2 AC Seater',
                        capacity: 40,
                        status: 'available',
                        working: false,
                      });
                      refresh();
                    } catch {
                      toast('Failed to register vehicle', 'error');
                      setVehForm((v) => ({ ...v, working: false }));
                    }
                  }}
                >
                  {vehForm.working ? 'Saving…' : 'Register Coach'}
                </button>
              </div>
            </div>
          </div>

          {/* Vehicles Table */}
          <div className="card border rounded-3 overflow-hidden shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8125rem' }}>
                <thead style={{ background: '#F8FAFC', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
                  <tr>
                    <th className="py-2.5 ps-3">ID</th>
                    <th className="py-2.5">Coach Details</th>
                    <th className="py-2.5">Type & Capacity</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5" style={{ minWidth: 260 }}>FASTag Telemetry</th>
                    <th className="py-2.5" style={{ minWidth: 220 }}>Assigned Driver</th>
                    <th className="py-2.5 pe-3 text-end">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vehicles.map((v) => (
                    <tr key={v.vehicle_id}>
                      <td className="ps-3 text-muted">#{v.vehicle_id}</td>
                      <td>
                        <div className="fw-bold" style={{ color: '#0F172A' }}>{v.vehicle_number}</div>
                        <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                          AIS-140 GPS Fitted
                        </span>
                      </td>
                      <td>
                        <div>{v.type || 'AC Seater'}</div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{v.capacity || 40} Seats Total</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            v.status === 'available' || v.status === 'active'
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {v.status || 'available'}
                        </span>
                      </td>
                      <td>
                        <div className="row g-1 align-items-center">
                          <div className="col-4">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Issuer (e.g. ICICI)"
                              defaultValue={v.fastag_issuer || ''}
                              onChange={(e) => (v._fastag_issuer = e.target.value)}
                              style={{ fontSize: '0.75rem' }}
                            />
                          </div>
                          <div className="col-5">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Tag ID"
                              defaultValue={v.fastag_tag_id || ''}
                              onChange={(e) => (v._fastag_tag_id = e.target.value)}
                              style={{ fontSize: '0.75rem' }}
                            />
                          </div>
                          <div className="col-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary w-100"
                              onClick={async () => {
                                try {
                                  const payload = {
                                    fastag_issuer: v._fastag_issuer !== undefined ? v._fastag_issuer : v.fastag_issuer || '',
                                    fastag_tag_id: v._fastag_tag_id !== undefined ? v._fastag_tag_id : v.fastag_tag_id || '',
                                    fastag_status: 'active',
                                  };
                                  await api.put(`/vehicles/${v.vehicle_id}/fastag`, payload);
                                  toast('FASTag linked', 'success');
                                  refresh();
                                } catch {
                                  toast('Failed to update FASTag', 'error');
                                }
                              }}
                              style={{ fontSize: '0.72rem' }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <select
                            className="form-select form-select-sm"
                            defaultValue={v.assigned_driver_id || v.driver_user_id || ''}
                            onChange={(e) => (v._nextDriver = e.target.value)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            <option value="">— Unassigned —</option>
                            {data.drivers.map((d) => (
                              <option key={d.user_id} value={d.user_id}>
                                {d.name} (#{d.user_id})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={async () => {
                              try {
                                const did = v._nextDriver ? Number(v._nextDriver) : null;
                                await api.put(`/vehicles/${v.vehicle_id}/assign`, { driver_user_id: did });
                                toast('Driver assigned', 'success');
                                refresh();
                              } catch {
                                toast('Failed to assign driver', 'error');
                              }
                            }}
                            style={{ fontSize: '0.72rem' }}
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                      <td className="pe-3 text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={async () => {
                              if (!window.confirm(`Delete coach ${v.vehicle_number}?`)) return;
                              try {
                                await api.delete(`/vehicles/${v.vehicle_id}`);
                                toast('Coach removed', 'success');
                                refresh();
                              } catch (e) {
                                toast(e?.response?.data?.error || 'Failed to remove coach', 'error');
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: DRIVERS ROSTER */}
      {tab === 'drivers' && (
        <div className="card border rounded-3 overflow-hidden shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8125rem' }}>
              <thead style={{ background: '#F8FAFC', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  <th className="py-2.5 ps-3">ID</th>
                  <th className="py-2.5">Driver Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Contact Phone</th>
                  <th className="py-2.5">Commercial License</th>
                  <th className="py-2.5">License Expiry</th>
                  <th className="py-2.5 pe-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.drivers.map((d) => (
                  <tr key={d.user_id}>
                    <td className="ps-3 text-muted">#{d.user_id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                          style={{ width: 28, height: 28, background: '#059669', fontSize: '0.7rem' }}
                        >
                          {d.name ? d.name.slice(0, 2).toUpperCase() : 'DR'}
                        </div>
                        <span className="fw-bold" style={{ color: '#0F172A' }}>{d.name}</span>
                      </div>
                    </td>
                    <td>{d.email}</td>
                    <td className="tabular-nums">{d.phone || '—'}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {d.license_number || 'DL-PENDING'}
                      </span>
                    </td>
                    <td className="tabular-nums text-muted">{d.license_expiry || '—'}</td>
                    <td className="pe-3 text-end">
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => openEditUser(d)}>
                          <Edit size={12} className="me-1" /> Edit
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeUser(d)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATION AGENTS */}
      {tab === 'agents' && (
        <div className="card border rounded-3 overflow-hidden shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8125rem' }}>
              <thead style={{ background: '#F8FAFC', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  <th className="py-2.5 ps-3">ID</th>
                  <th className="py-2.5">Agent Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Contact Phone</th>
                  <th className="py-2.5">Counter Terminal Code</th>
                  <th className="py-2.5 pe-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.agents.map((a) => (
                  <tr key={a.user_id}>
                    <td className="ps-3 text-muted">#{a.user_id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                          style={{ width: 28, height: 28, background: '#7C3AED', fontSize: '0.7rem' }}
                        >
                          {a.name ? a.name.slice(0, 2).toUpperCase() : 'AG'}
                        </div>
                        <span className="fw-bold" style={{ color: '#0F172A' }}>{a.name}</span>
                      </div>
                    </td>
                    <td>{a.email}</td>
                    <td className="tabular-nums">{a.phone || '—'}</td>
                    <td>
                      <span className="badge bg-light text-primary border">
                        {a.agent_code || `AGT-${a.user_id}`}
                      </span>
                    </td>
                    <td className="pe-3 text-end">
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => openEditUser(a)}>
                          <Edit size={12} className="me-1" /> Edit
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeUser(a)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & SAFETY DOCUMENTS */}
      {tab === 'documents' && (
        <div className="card border rounded-3 overflow-hidden shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8125rem' }}>
              <thead style={{ background: '#F8FAFC', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  <th className="py-2.5 ps-3">Doc #</th>
                  <th className="py-2.5">Entity Type</th>
                  <th className="py-2.5">Entity Ref</th>
                  <th className="py-2.5">Document Classification</th>
                  <th className="py-2.5">Certificate / Policy #</th>
                  <th className="py-2.5">Renewal Expiry</th>
                  <th className="py-2.5">File Link</th>
                  <th className="py-2.5 pe-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.documents.map((d) => (
                  <tr key={d.id}>
                    <td className="ps-3 text-muted">#{d.id}</td>
                    <td>
                      <span className="badge bg-light text-dark border text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {d.entity_type}
                      </span>
                    </td>
                    <td>ID #{d.entity_id}</td>
                    <td className="fw-semibold" style={{ color: '#0F172A' }}>{d.doc_type || 'Commercial Fitness'}</td>
                    <td className="tabular-nums">{d.doc_number || 'AIS-140-CERT-01'}</td>
                    <td className="tabular-nums text-muted">{d.expiry_date || '2027-12-31'}</td>
                    <td>
                      {d.file_url ? (
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary text-decoration-none small">
                          View Cert
                        </a>
                      ) : (
                        <span className="text-muted small">Digital Validated</span>
                      )}
                    </td>
                    <td className="pe-3 text-end">
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => editDoc(d)}>
                          <Edit size={12} className="me-1" /> Edit
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => deleteDoc(d.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT EDIT / ADD MODAL */}
      {docModal.open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
          onClick={() => setDocModal((m) => ({ ...m, open: false }))}
        >
          <div
            className="bg-white rounded-3 shadow-lg border p-4"
            style={{ width: 'min(92vw, 560px)', borderColor: '#E2E8F0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '1rem' }}>
                {docModal.id ? 'Edit Compliance Document' : 'Upload Safety & Regulatory Document'}
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setDocModal((m) => ({ ...m, open: false }))}
              >
                Close
              </button>
            </div>
            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label small text-muted mb-1">Entity Type</label>
                <select
                  className="form-select form-select-sm"
                  value={docModal.entity_type}
                  onChange={(e) => setDocModal((m) => ({ ...m, entity_type: e.target.value }))}
                >
                  <option value="driver">Driver</option>
                  <option value="agent">Agent</option>
                  <option value="vehicle">Vehicle</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small text-muted mb-1">Entity ID</label>
                <input
                  className="form-control form-control-sm"
                  value={docModal.entity_id}
                  onChange={(e) => setDocModal((m) => ({ ...m, entity_id: e.target.value }))}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small text-muted mb-1">Doc Classification</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="e.g. AIS-140 GPS Cert"
                  value={docModal.doc_type}
                  onChange={(e) => setDocModal((m) => ({ ...m, doc_type: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted mb-1">Certificate / Policy #</label>
                <input
                  className="form-control form-control-sm"
                  value={docModal.doc_number}
                  onChange={(e) => setDocModal((m) => ({ ...m, doc_number: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted mb-1">Expiry / Renewal Date</label>
                <input
                  className="form-control form-control-sm tabular-nums"
                  type="date"
                  value={docModal.expiry_date || ''}
                  onChange={(e) => setDocModal((m) => ({ ...m, expiry_date: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label small text-muted mb-1">Document Link / URL</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="https://..."
                  value={docModal.file_url}
                  onChange={(e) => setDocModal((m) => ({ ...m, file_url: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label small text-muted mb-1">Compliance Notes</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="Safety audit notes, RTO inspection verification…"
                  value={docModal.notes}
                  onChange={(e) => setDocModal((m) => ({ ...m, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setDocModal((m) => ({ ...m, open: false }))}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-accent text-white fw-semibold"
                disabled={docModal.working}
                onClick={saveDoc}
              >
                {docModal.working ? 'Saving…' : 'Save Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER EDIT / ADD MODAL */}
      {userModal.open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
          onClick={() => setUserModal((m) => ({ ...m, open: false }))}
        >
          <div
            className="bg-white rounded-3 shadow-lg border p-4"
            style={{ width: 'min(92vw, 560px)', borderColor: '#E2E8F0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '1rem' }}>
                {userModal.id ? 'Edit Staff Profile' : `Add ${userModal.role === 'driver' ? 'Commercial Driver' : 'Station Agent'}`}
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setUserModal((m) => ({ ...m, open: false }))}
              >
                Close
              </button>
            </div>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label small text-muted mb-1">Full Legal Name</label>
                <input
                  className="form-control form-control-sm"
                  value={userModal.name}
                  onChange={(e) => setUserModal((m) => ({ ...m, name: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted mb-1">Official Email</label>
                <input
                  className="form-control form-control-sm"
                  type="email"
                  value={userModal.email}
                  onChange={(e) => setUserModal((m) => ({ ...m, email: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted mb-1">Contact Phone</label>
                <input
                  className="form-control form-control-sm"
                  value={userModal.phone}
                  onChange={(e) => setUserModal((m) => ({ ...m, phone: e.target.value }))}
                />
              </div>
              {!userModal.id && (
                <div className="col-md-6">
                  <label className="form-label small text-muted mb-1">Initial Password</label>
                  <input
                    className="form-control form-control-sm"
                    type="password"
                    value={userModal.password}
                    onChange={(e) => setUserModal((m) => ({ ...m, password: e.target.value }))}
                  />
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label small text-muted mb-1">Role Type</label>
                <select
                  className="form-select form-select-sm"
                  value={userModal.role}
                  onChange={(e) => setUserModal((m) => ({ ...m, role: e.target.value }))}
                >
                  <option value="driver">Commercial Driver</option>
                  <option value="agent">Booking Station Agent</option>
                </select>
              </div>
              {userModal.role === 'driver' && (
                <>
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1">Commercial Driver License #</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="DL-01-2024-0091"
                      value={userModal.license_number}
                      onChange={(e) => setUserModal((m) => ({ ...m, license_number: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1">License Expiry Date</label>
                    <input
                      className="form-control form-control-sm tabular-nums"
                      type="date"
                      value={userModal.license_expiry || ''}
                      onChange={(e) => setUserModal((m) => ({ ...m, license_expiry: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setUserModal((m) => ({ ...m, open: false }))}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-accent text-white fw-semibold"
                disabled={userModal.working}
                onClick={saveUser}
              >
                {userModal.working ? 'Saving…' : 'Save Staff Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
