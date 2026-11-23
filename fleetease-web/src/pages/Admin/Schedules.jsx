import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import SeatMap from '../../components/SeatMap';
import { toast } from '../../components/Toast';
import { socket } from '../../utils/socket';
import { loadGoogleMapsPlaces } from '../../utils/loadGoogleMaps';

export default function Schedules(){
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ route_id:'', vehicle_id:'', bus_number:'', bus_type:'2x2 AC', departure:'', arrival:'', status:'active' });
  const [source, setSource] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [dateOut, setDateOut] = React.useState('');
  const [cities, setCities] = React.useState({ sources:[], destinations:[] });
  const [seatView, setSeatView] = React.useState({
    open: false,
    schedule: null,
    taken: [],
    locked: [],
    selectedSeat: null,
    layoutType: '2x2',
    upperDeck: false,
    working: false,
  });
  const [seatsCount, setSeatsCount] = React.useState({}); // { [schedule_id]: { booked, total } }
  const [cancelModal, setCancelModal] = React.useState({ open:false, schedule:null, working:false, result:null });
  const nav = useNavigate();
  const location = useLocation();

  // Lock background body scroll whenever modal is open
  React.useEffect(() => {
    if (seatView.open || cancelModal.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [seatView.open, cancelModal.open]);
  const [mapsReady, setMapsReady] = React.useState(!!(typeof window!=='undefined' && window.google && window.google.maps && window.google.maps.places));
  const acRefs = React.useRef({});

  const setupAutocomplete = (key)=> (el)=>{
    if (!el) return;
    if (acRefs.current[key]) return;
    if (!(window.google && window.google.maps && window.google.maps.places)) return;
    const ac = new window.google.maps.places.Autocomplete(el, { types: ['(cities)'] });
    ac.addListener('place_changed', ()=>{
      const p = ac.getPlace();
      const name = p.formatted_address || p.name || el.value;
      if (key==='source') setSource(name); else setDestination(name);
    });
    acRefs.current[key] = ac;
  };

  const refresh = async ()=>{
    setLoading(true);
    try{
      const qs = new URLSearchParams({ ...(source?{source}:{}) , ...(destination?{destination}:{}) , ...(dateOut?{date:dateOut}:{}) });
      const r = await api.get(`/schedules${qs.toString()?`?${qs.toString()}`:''}`);
      const list = Array.isArray(r.data)? r.data : [];
      setRows(list);
      // Join schedule rooms for live status updates
      try{ list.forEach(s=> socket.emit('join_schedule', s.schedule_id)); }catch{}
      // Prefetch seat counts for the fetched schedules (best-effort)
      setTimeout(()=>{
        list.slice(0,25).forEach(s=>{ loadCount(s); });
      }, 0);
    } finally { setLoading(false); }
  };

  // Realtime updates for seat modal
  React.useEffect(()=>{
    const sid = seatView.open ? seatView.schedule?.schedule_id : null;
    if (!sid) return;
    const refreshSeats = async()=>{
      try{
        const res = await api.get(`/admin/seats/${sid}`);
        const taken = Array.isArray(res.data)? res.data : [];
        setSeatView(v=> ({ ...v, taken }));
        const total = computeTotal(seatView.schedule||{});
        setSeatsCount(prev=> ({ ...prev, [sid]: { booked: taken.length, total } }));
      }catch{}
    };
    socket.emit('join_schedule', sid);
    const handler = ()=> refreshSeats();
    socket.on('seats_updated', handler);
    return ()=> socket.off('seats_updated', handler);
  },[seatView.open, seatView.schedule?.schedule_id]);

  React.useEffect(()=>{
    const t = localStorage.getItem('token');
    let role = null; try { role = t ? JSON.parse(atob(t.split('.')[1]))?.role : null; } catch{}
    if (role !== 'admin') { nav('/'); return; }
    api.get('/routes/cities')
      .then(r=> setCities({
        sources: Array.isArray(r.data?.sources)? r.data.sources : [],
        destinations: Array.isArray(r.data?.destinations)? r.data.destinations : []
      }))
      .catch(()=> setCities({ sources:[], destinations:[] }));
    refresh();
    (async()=>{ try{ await loadGoogleMapsPlaces(); setMapsReady(true); }catch{ setMapsReady(false); } })();
  },[nav, location]);

  React.useEffect(()=>{ refresh(); },[source, destination, dateOut]);

  const computeTotal = (sched)=>{
    const t = (sched?.seat_layout || sched?.bus_type || sched?.vehicle_type || '').toString().toLowerCase();
    const perRow = (t.includes('luxury') || t.includes('sleeper') || t.includes('2x1')) ? 3 : 4;
    const upper = perRow===3; // our map uses upper deck for non-2x2
    const rows = 10;
    return perRow * rows * (upper?2:1);
  };

  const loadCount = async (sched)=>{
    const sid = sched.schedule_id;
    if (seatsCount[sid]) return;
    try{
      const res = await api.get(`/admin/seats/${sid}`);
      const taken = Array.isArray(res.data)? res.data : [];
      const total = computeTotal(sched);
      setSeatsCount(prev=> ({ ...prev, [sid]: { booked: taken.length, total } }));
    }catch{
      const total = computeTotal(sched);
      setSeatsCount(prev=> ({ ...prev, [sid]: { booked: 0, total } }));
    }
  };

  const create = async (e)=>{
    e.preventDefault();
    await api.post('/schedules', form);
    setForm({ route_id:'', vehicle_id:'', bus_number:'', bus_type:'2x2 AC', departure:'', arrival:'', status:'active' });
    await refresh();
  };
  const remove = async (id)=>{ await api.delete(`/schedules/${id}`); await refresh(); };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Admin — Schedules</h3>

      {loading ? (
        <>
          <div className="card p-3 mb-3">
            <div className="skeleton skeleton-line mb-2" style={{ width: '20%' }}></div>
            <div className="row g-2">
              {[1,2,3,4].map(i=> (
                <div className="col-md-3" key={i}><div className="skeleton skeleton-line" style={{ height: 38 }}></div></div>
              ))}
            </div>
          </div>
          <div className="card p-3 mb-3">
            <div className="skeleton skeleton-line mb-2" style={{ width: '15%' }}></div>
            <div className="row g-2">
              {Array.from({length:8}).map((_,i)=> (
                <div className="col-2" key={i}><div className="skeleton skeleton-line" style={{ height: 38 }}></div></div>
              ))}
            </div>
          </div>
          <div className="card p-3">
            <div className="skeleton skeleton-line mb-3" style={{ width: '25%' }}></div>
            <div className="table-responsive">
              <table className="table table-sm align-middle admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Bus</th>
                    <th>Type</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Status</th>
                    <th>Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length:8}).map((_,i)=> (
                    <tr key={i}>
                      {Array.from({length:9}).map((__,j)=> (
                        <td key={j}><div className="skeleton skeleton-line" style={{ height: 16, width: j===1? 160 : 100 }}></div></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-body">
              <div className="row g-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Source</label>
                  {mapsReady ? (
                    <input ref={setupAutocomplete('source')} className="form-control" placeholder="City" value={source} onChange={e=> setSource(e.target.value)} />
                  ) : (
                    <select className="form-select" value={source} onChange={e=>{ setSource(e.target.value); }}>
                      <option value="">All</option>
                      {cities.sources.map(s=> <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Destination</label>
                  {mapsReady ? (
                    <input ref={setupAutocomplete('destination')} className="form-control" placeholder="City" value={destination} onChange={e=> setDestination(e.target.value)} />
                  ) : (
                    <select className="form-select" value={destination} onChange={e=> setDestination(e.target.value)}>
                      <option value="">All</option>
                      {cities.destinations.map(d=> <option key={d} value={d}>{d}</option>)}
                    </select>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Journey Date</label>
                  <input type="date" className="form-control" value={dateOut} onChange={e=> setDateOut(e.target.value)} />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button className="btn btn-outline-secondary me-2" onClick={()=>{ setSource(''); setDestination(''); setDateOut(''); }}>Reset</button>
                  <div className="small text-muted">View-only seat status. Admin cannot book tickets.</div>
                </div>
              </div>
            </div>
          </div>

          <form className="row g-2 mb-3" onSubmit={create}>
            <div className="col-2"><input className="form-control" placeholder="Route ID" value={form.route_id} onChange={e=>setForm({...form, route_id:e.target.value})}/></div>
            <div className="col-2"><input className="form-control" placeholder="Vehicle ID" value={form.vehicle_id} onChange={e=>setForm({...form, vehicle_id:e.target.value})}/></div>
            <div className="col-2"><input className="form-control" placeholder="Bus Number" value={form.bus_number} onChange={e=>setForm({...form, bus_number:e.target.value})}/></div>
            <div className="col-2">
              <select className="form-select" value={form.bus_type} onChange={e=>setForm({...form, bus_type:e.target.value})}>
                <option>2x2 AC</option>
                <option>2x2 Non-AC</option>
                <option>2x1 Lower Sleeper AC</option>
                <option>2x1 48 seat AC</option>
                <option>2x1 Lower Sleeper</option>
                <option>2x2 Seat Sleeper</option>
              </select>
            </div>
            <div className="col-2"><input type="datetime-local" className="form-control" value={form.departure} min={new Date().toISOString().slice(0,16)} onChange={e=>setForm({...form, departure:e.target.value})}/></div>
            <div className="col-2"><input type="datetime-local" className="form-control" value={form.arrival} min={form.departure || new Date().toISOString().slice(0,16)} onChange={e=>setForm({...form, arrival:e.target.value})}/></div>
            <div className="col-2">
              <select className="form-select" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                <option>active</option>
                <option>cancelled</option>
              </select>
            </div>
            <div className="col-2"><button className="btn btn-accent">Publish</button></div>
          </form>

          <div className="table-responsive">
            <table className="table table-sm align-middle admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Bus</th>
                  <th>Type</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Status</th>
                  <th>Seats</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r=> (
                  <tr key={r.schedule_id}>
                    <td>#{r.schedule_id}</td>
                    <td>{r.source || r.route_id} → {r.destination || ''}</td>
                    <td>{r.vehicle_id} {r.vehicle_number? `(${r.vehicle_number})` : ''}</td>
                    <td>{r.bus_number}</td>
                    <td>{r.bus_type || r.vehicle_type}</td>
                    <td>{r.departure ? new Date(r.departure).toLocaleString() : '—'}</td>
                    <td>{r.arrival ? new Date(r.arrival).toLocaleString() : '—'}</td>
                    <td>
                      {r.status==='boarding' ? (
                        <span className="badge bg-warning text-dark">Boarding</span>
                      ) : r.status==='on_route' ? (
                        <span className="badge bg-success">On Route</span>
                      ) : (
                        r.status || '—'
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onMouseEnter={()=>loadCount(r)} onClick={async ()=>{
                          try{
                            const [resSeats, resLocked] = await Promise.all([
                              api.get(`/admin/seats/${r.schedule_id}`).catch(() => ({ data: [] })),
                              api.get(`/schedules/${r.schedule_id}/locked-seats`).catch(() => ({ data: { locked: [] } }))
                            ]);
                            const taken = Array.isArray(resSeats.data) ? resSeats.data : [];
                            const locked = Array.isArray(resLocked.data?.locked) ? resLocked.data.locked : [];
                            const t = (r.seat_layout || r.bus_type || r.vehicle_type || '').toString().toLowerCase();
                            let lt = '2x2';
                            if (t.includes('luxury')) lt = '2x1_luxury'; else if (t.includes('sleeper') || t.includes('2x1')) lt = '2x1_sleeper';
                            setSeatView({ open:true, schedule:r, taken, locked, selectedSeat:null, layoutType:lt, upperDeck: lt!=='2x2', working:false });
                          }catch{ setSeatView({ open:true, schedule:r, taken:[], locked:[], selectedSeat:null, layoutType:'2x2', upperDeck:false, working:false }); }
                        }}>View Seats{seatsCount[r.schedule_id]? ` (${seatsCount[r.schedule_id].booked}/${seatsCount[r.schedule_id].total})` : ''}</button>
                        <button className="btn btn-outline-warning" onClick={()=> setCancelModal({ open:true, schedule:r, working:false, result:null })}>Cancel Trip</button>
                        <button className="btn btn-outline-danger" onClick={()=>remove(r.schedule_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* COMPACT VIEW SEATS & ADMIN QUOTA CONTROLS MODAL */}
      {seatView.open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
          onClick={() => setSeatView((v) => ({ ...v, open: false }))}
        >
          <div
            className="bg-white rounded-3 shadow-lg border d-flex flex-column"
            style={{
              width: 'min(94vw, 760px)',
              maxHeight: '88vh',
              borderColor: '#E2E8F0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white" style={{ fontSize: '0.7rem' }}>
                    Schedule #{seatView.schedule?.schedule_id}
                  </span>
                  <span className="fw-bold" style={{ fontSize: '0.9375rem', color: '#0F172A' }}>
                    {seatView.schedule?.source} → {seatView.schedule?.destination}
                  </span>
                </div>
                <div className="text-muted small mt-0.5" style={{ fontSize: '0.75rem' }}>
                  {seatView.schedule?.bus_number} • {seatView.schedule?.bus_type || seatView.schedule?.vehicle_type || 'AC Seater'} • Departure: {seatView.schedule?.departure ? new Date(seatView.schedule.departure).toLocaleDateString() : '—'}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSeatView((v) => ({ ...v, open: false }))}
              >
                Close
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-3 p-md-4 overflow-auto flex-grow-1">
              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <div className="p-2 border rounded-2" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
                    <SeatMap
                      layoutType={seatView.layoutType}
                      upperDeck={seatView.upperDeck}
                      rows={10}
                      compact={true}
                      adminMode={true}
                      selected={seatView.selectedSeat ? [seatView.selectedSeat] : []}
                      disabledSeats={seatView.taken}
                      lockedSeats={seatView.locked}
                      onToggle={(seatLabel) => {
                        setSeatView((v) => ({
                          ...v,
                          selectedSeat: v.selectedSeat === seatLabel ? null : seatLabel,
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-5">
                  <div className="p-3 bg-light rounded-3 border h-100" style={{ borderColor: '#E2E8F0' }}>
                    <div className="fw-bold mb-2" style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                      Admin Quota & Seat Controls
                    </div>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.75rem' }}>
                      Click on any seat on the left layout to select it, then toggle locking as Admin Quota or releasing back to public booking.
                    </p>

                    {seatView.selectedSeat ? (
                      <div className="p-2.5 bg-white rounded-2 border mb-3" style={{ borderColor: '#CBD5E1' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Selected Seat:</span>
                          <span className="badge bg-dark fs-6">{seatView.selectedSeat}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted small">Current Status:</span>
                          {seatView.locked.includes(String(seatView.selectedSeat).toUpperCase()) ? (
                            <span className="badge bg-warning text-dark">Locked (Admin Quota)</span>
                          ) : seatView.taken.includes(String(seatView.selectedSeat).toUpperCase()) ? (
                            <span className="badge bg-secondary">Booked (Passenger)</span>
                          ) : (
                            <span className="badge bg-success">Available (Public)</span>
                          )}
                        </div>

                        {seatView.locked.includes(String(seatView.selectedSeat).toUpperCase()) ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger w-100"
                            disabled={seatView.working}
                            onClick={async () => {
                              try {
                                setSeatView((v) => ({ ...v, working: true }));
                                await api.post(`/schedules/${seatView.schedule.schedule_id}/unlock-seat`, {
                                  seat_label: seatView.selectedSeat,
                                });
                                toast(`Seat ${seatView.selectedSeat} released to public`, 'success');
                                const resLocked = await api.get(`/schedules/${seatView.schedule.schedule_id}/locked-seats`);
                                setSeatView((v) => ({
                                  ...v,
                                  locked: resLocked.data?.locked || [],
                                  working: false,
                                }));
                              } catch (err) {
                                toast('Failed to unlock seat', 'error');
                                setSeatView((v) => ({ ...v, working: false }));
                              }
                            }}
                          >
                            {seatView.working ? 'Releasing…' : 'Unlock Seat (Release)'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-warning w-100 fw-semibold"
                            disabled={seatView.working || seatView.taken.includes(String(seatView.selectedSeat).toUpperCase())}
                            onClick={async () => {
                              try {
                                setSeatView((v) => ({ ...v, working: true }));
                                await api.post(`/schedules/${seatView.schedule.schedule_id}/lock-seat`, {
                                  seat_label: seatView.selectedSeat,
                                  reason: 'Admin Quota',
                                });
                                toast(`Seat ${seatView.selectedSeat} locked as Admin Quota`, 'success');
                                const resLocked = await api.get(`/schedules/${seatView.schedule.schedule_id}/locked-seats`);
                                setSeatView((v) => ({
                                  ...v,
                                  locked: resLocked.data?.locked || [],
                                  working: false,
                                }));
                              } catch (err) {
                                toast('Failed to lock seat', 'error');
                                setSeatView((v) => ({ ...v, working: false }));
                              }
                            }}
                          >
                            {seatView.working ? 'Locking…' : 'Lock as Admin Quota'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-info py-2 px-3 small mb-3" style={{ fontSize: '0.75rem' }}>
                        👉 Select a seat on the left layout to lock or unlock it.
                      </div>
                    )}

                    <div className="pt-2 border-top" style={{ borderColor: '#E2E8F0', fontSize: '0.75rem' }}>
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Total Quota Locked:</span>
                        <strong className="text-warning-emphasis">{seatView.locked?.length || 0} seats</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Booked / Taken:</span>
                        <strong>{seatView.taken?.length || 0} seats</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cancelModal.open && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,0.5)', zIndex:1060}} onClick={()=> setCancelModal({ open:false, schedule:null, working:false, result:null })}>
          <div className="position-absolute top-50 start-50 translate-middle bg-white p-3 rounded-3" style={{width:'min(90vw, 560px)'}} onClick={(e)=>e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-semibold">Cancel Trip — Schedule #{cancelModal.schedule?.schedule_id}</div>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=> setCancelModal({ open:false, schedule:null, working:false, result:null })}>Close</button>
            </div>
            <div className="small text-muted mb-2">This will cancel the entire schedule, release all seats, and refund all affected passengers 100% (no fees).</div>
            {cancelModal.result ? (
              <div className="alert alert-success">Trip cancelled. Online bookings refunded: {cancelModal.result.cancelled_bookings}. Offline marked refunded: {cancelModal.result.cancelled_offline}.</div>
            ) : (
              <div className="d-flex justify-content-end">
                <button className="btn btn-warning me-2" disabled={cancelModal.working} onClick={async()=>{
                  if (!cancelModal.schedule) return;
                  setCancelModal(m=> ({ ...m, working:true }));
                  try{
                    const r = await api.post(`/schedules/${cancelModal.schedule.schedule_id}/cancel`);
                    setCancelModal(m=> ({ ...m, result: r.data || { ok:true, cancelled_bookings:0, cancelled_offline:0 }, working:false }));
                    refresh();
                    toast('Trip cancelled and refunds queued','success');
                  }catch{
                    toast('Failed to cancel trip','error');
                    setCancelModal(m=> ({ ...m, working:false }));
                  }
                }}>{cancelModal.working? 'Cancelling…' : 'Confirm Cancel Trip'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
