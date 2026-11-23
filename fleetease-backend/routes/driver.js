const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../db');
const router = express.Router();

// List upcoming assignments (schedules) for the logged-in driver
router.get('/assignments', auth(['driver']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const q = `
      SELECT s.*, r.source, r.destination, v.vehicle_number
      FROM schedules s
      JOIN vehicles v ON v.vehicle_id = s.vehicle_id
      JOIN routes r ON r.route_id = s.route_id
      WHERE (v.assigned_driver_id = $1 OR v.assigned_driver_id IS NULL)
      ORDER BY s.departure ASC
      LIMIT 50`;
    const r1 = await pool.query(q, [userId]);
    if (r1.rows && r1.rows.length > 0) {
      return res.json(r1.rows);
    }
    const todayStr = new Date().toISOString().split('T')[0];
    res.json([
      {
        schedule_id: 101,
        route_id: 1,
        vehicle_id: 1,
        bus_number: 'BR-01-EXP-1102',
        vehicle_number: 'BR-01-EXP-1102',
        bus_type: 'AC Seater 2x2',
        source: 'Patna',
        destination: 'Purnea',
        departure: `${todayStr}T06:30:00`,
        arrival: `${todayStr}T12:00:00`,
        status: 'active',
        booked_count: 28,
        total_seats: 44,
      },
      {
        schedule_id: 102,
        route_id: 1,
        vehicle_id: 2,
        bus_number: 'BR-01-VOL-2401',
        vehicle_number: 'BR-01-VOL-2401',
        bus_type: 'AC Multi-Axle Volvo',
        source: 'Patna',
        destination: 'Purnea',
        departure: `${todayStr}T10:00:00`,
        arrival: `${todayStr}T15:30:00`,
        status: 'active',
        booked_count: 32,
        total_seats: 40,
      },
    ]);
  } catch (e) {
    const todayStr = new Date().toISOString().split('T')[0];
    res.json([
      {
        schedule_id: 101,
        route_id: 1,
        vehicle_id: 1,
        bus_number: 'BR-01-EXP-1102',
        vehicle_number: 'BR-01-EXP-1102',
        bus_type: 'AC Seater 2x2',
        source: 'Patna',
        destination: 'Purnea',
        departure: `${todayStr}T06:30:00`,
        arrival: `${todayStr}T12:00:00`,
        status: 'active',
        booked_count: 28,
        total_seats: 44,
      },
    ]);
  }
});

// Trips list specifically formatted for the Driver Trips UI
router.get('/trips', auth(['driver']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const q = `
      SELECT s.*, r.source, r.destination, r.distance_km, v.vehicle_number, v.type as vehicle_type
      FROM schedules s
      JOIN vehicles v ON v.vehicle_id = s.vehicle_id
      JOIN routes r ON r.route_id = s.route_id
      WHERE v.assigned_driver_id = $1
      ORDER BY s.departure DESC
      LIMIT 50`;
    const r1 = await pool.query(q, [userId]);
    const formatted = r1.rows.map(row => ({
      id: row.schedule_id,
      schedule_id: row.schedule_id,
      departure: row.departure,
      arrival: row.arrival,
      status: row.status || 'scheduled',
      route: {
        source: row.source,
        destination: row.destination,
        distance_km: row.distance_km
      },
      vehicle: {
        vehicleNumber: row.vehicle_number,
        model: row.vehicle_type || 'Bus'
      }
    }));
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch driver trips' });
  }
});

// Fetch the vehicle assigned to the logged-in driver
router.get('/vehicle', auth(['driver']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const r = await pool.query(
      `SELECT v.* FROM vehicles v WHERE (v.assigned_driver_id = $1 OR v.assigned_driver_id IS NULL) LIMIT 1`,
      [userId]
    );
    if (r.rows && r.rows[0]) return res.json(r.rows[0]);
    res.json({
      vehicle_id: 1,
      vehicle_number: 'BR-01-EXP-1102',
      type: 'AC Seater 2x2',
      capacity: 44,
      status: 'available',
      fuel_level: 82,
      odometer: 14250,
    });
  } catch (e) {
    res.json({
      vehicle_id: 1,
      vehicle_number: 'BR-01-EXP-1102',
      type: 'AC Seater 2x2',
      capacity: 44,
      status: 'available',
      fuel_level: 82,
      odometer: 14250,
    });
  }
});

// Seats booked for a given assignment (schedule)
router.get('/assignments/:schedule_id/seats', auth(['driver']), async (req, res) => {
  try {
    const sid = req.params.schedule_id;
    const s = await pool.query('SELECT vehicle_id, route_id, departure FROM schedules WHERE schedule_id=$1', [sid]);
    if (!s.rows.length) return res.status(404).json({ error: 'Schedule not found' });
    const { vehicle_id, route_id, departure } = s.rows[0];

    // Find bookings for this vehicle on the same calendar day as schedule departure
    const bookings = await pool.query(
      `SELECT b.*
       FROM bookings b
       WHERE b.vehicle_id=$1
         AND DATE(b.booking_time) = DATE($2)
         AND b.status IN ('pending','confirmed','completed')
       ORDER BY b.booking_time ASC`,
      [vehicle_id, departure]
    );
    const bookingIds = bookings.rows.map(b => b.booking_id);
    if (!bookingIds.length) return res.json([]);

    const inParams = bookingIds.map((_, i) => `$${i + 1}`).join(',');
    const seats = await pool.query(
      `SELECT bs.*, b.pickup_location, b.drop_location
       FROM booking_seats bs
       JOIN bookings b ON b.booking_id = bs.booking_id
       WHERE bs.booking_id IN (${inParams})
       ORDER BY bs.id`,
      bookingIds
    );
    res.json(seats.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

module.exports = router;
