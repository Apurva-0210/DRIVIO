const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { source, destination } = req.query;
    if (source || destination) {
      const result = await pool.query(
        `SELECT * FROM routes
         WHERE ($1::text IS NULL OR LOWER(source) LIKE LOWER('%' || $1 || '%'))
           AND ($2::text IS NULL OR LOWER(destination) LIKE LOWER('%' || $2 || '%'))
         ORDER BY route_id`,
        [source || null, destination || null]
      );
      return res.json({
        success: true,
        data: result.rows
      });
    }
    const result = await pool.query('SELECT * FROM routes ORDER BY route_id');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Distinct route sources and destinations for dropdowns
router.get('/cities', async (req, res) => {
  try {
    const r = await pool.query('SELECT DISTINCT source, destination FROM routes');
    const sourcesSet = new Set();
    const destSet = new Set();
    for (const row of r.rows) {
      if (row.source) sourcesSet.add(row.source);
      if (row.destination) destSet.add(row.destination);
    }
    const sources = Array.from(sourcesSet).sort();
    const destinations = Array.from(destSet).sort();
    res.json({ sources, destinations });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list cities', details: e.message });
  }
});

// Get stops for a given route
router.get('/:id/stops', async (req, res) => {
  try{
    const rid = req.params.id;
    const r = await pool.query('SELECT * FROM route_stops WHERE route_id=$1 ORDER BY sequence', [rid]);
    res.json(r.rows);
  }catch(e){
    res.status(500).json({ error: 'Failed to fetch stops', details: e.message });
  }
});

// Search trips by query (for TrackBus)
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const result = await pool.query(
      `SELECT s.*, r.source, r.destination, v.vehicle_number 
       FROM schedules s
       LEFT JOIN routes r ON r.route_id = s.route_id
       LEFT JOIN vehicles v ON v.vehicle_id = s.vehicle_id
       WHERE CAST(s.schedule_id AS TEXT) ILIKE '%' || $1 || '%'
          OR r.source ILIKE '%' || $1 || '%'
          OR r.destination ILIKE '%' || $1 || '%'
          OR v.vehicle_number ILIKE '%' || $1 || '%'
       LIMIT 10`,
      [q]
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Single trip / schedule details with route coordinates for tracking
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const scheduleQ = await pool.query(
      `SELECT s.*, r.source, r.destination, r.distance_km, v.vehicle_number, v.type as vehicle_type
       FROM schedules s
       LEFT JOIN routes r ON r.route_id = s.route_id
       LEFT JOIN vehicles v ON v.vehicle_id = s.vehicle_id
       WHERE s.schedule_id = $1`,
      [id]
    );

    if (!scheduleQ.rows.length) {
      // Check if ID corresponds to route_id directly
      const routeQ = await pool.query('SELECT * FROM routes WHERE route_id=$1', [id]);
      if (!routeQ.rows.length) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
      const route = routeQ.rows[0];
      return res.json({
        success: true,
        data: {
          id: route.route_id,
          source: route.source,
          destination: route.destination,
          status: 'scheduled',
          route: {
            source: route.source,
            destination: route.destination,
            coordinates: [[25.6120, 85.2010], [25.7500, 86.0000], [25.7771, 87.4753]],
            stops: [
              { name: `${route.source} Terminal`, time: '08:00 AM', status: 'completed' },
              { name: 'Midway Halt', time: '10:30 AM', status: 'next' },
              { name: `${route.destination} Bus Stand`, time: '01:30 PM', status: 'pending' }
            ]
          }
        }
      });
    }

    const s = scheduleQ.rows[0];
    const stopsQ = await pool.query('SELECT * FROM route_stops WHERE route_id=$1 ORDER BY sequence', [s.route_id]);
    const stops = stopsQ.rows.map(st => ({
      name: st.stop_name || st.name,
      time: st.arrival_time || 'On schedule',
      status: 'pending'
    }));

    res.json({
      success: true,
      data: {
        id: s.schedule_id,
        tripId: s.schedule_id,
        schedule_id: s.schedule_id,
        bus_number: s.bus_number || s.vehicle_number,
        bus_type: s.bus_type || s.vehicle_type,
        departure: s.departure,
        arrival: s.arrival,
        status: s.status || 'scheduled',
        route: {
          source: s.source,
          destination: s.destination,
          coordinates: [[25.6120, 85.2010], [25.7500, 86.0000], [25.7771, 87.4753]],
          stops: stops.length > 0 ? stops : [
            { name: `${s.source} Terminal`, time: '08:00 AM', status: 'completed' },
            { name: `${s.destination} Bus Stand`, time: '01:30 PM', status: 'pending' }
          ]
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start trip (driver action)
router.post('/:id/start', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("UPDATE schedules SET status='on_route' WHERE schedule_id=$1", [id]);
    const io = req.app.get('io');
    if (io) {
      io.to(`trip_${id}`).emit('tripStarted', { tripId: id, status: 'on_route' });
    }
    res.json({ success: true, message: 'Trip started successfully', tripId: id, status: 'on_route' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// End trip (driver action)
router.post('/:id/end', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("UPDATE schedules SET status='completed' WHERE schedule_id=$1", [id]);
    const io = req.app.get('io');
    if (io) {
      io.to(`trip_${id}`).emit('tripEnded', { tripId: id, status: 'completed' });
    }
    res.json({ success: true, message: 'Trip completed successfully', tripId: id, status: 'completed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Emergency alert broadcast
router.post('/:id/emergency', async (req, res) => {
  try {
    const id = req.params.id;
    const { message, location, type = 'emergency' } = req.body || {};
    const io = req.app.get('io');
    if (io) {
      io.emit('alert', {
        tripId: id,
        type,
        message: message || 'Driver reported an emergency alert!',
        location,
        timestamp: new Date().toISOString()
      });
    }
    res.json({ success: true, message: 'Emergency alert dispatched to control center' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
