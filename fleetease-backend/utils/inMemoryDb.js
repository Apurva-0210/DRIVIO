const { newDb } = require('pg-mem');
const bcrypt = require('bcrypt');

let memDbInstance = null;
let memPoolInstance = null;

function createInMemoryDb() {
  if (memPoolInstance) return memPoolInstance;

  console.log('⚡ Initializing DRIVIO Resilient In-Memory Database...');
  const mem = newDb({
    autoCreateForeignKeyIndices: true,
  });

  // Register common custom postgres functions / stubs
  mem.public.registerFunction({
    name: 'version',
    args: [],
    returns: mem.public.getType('text'),
    implementation: () => 'PostgreSQL 15.0 (DRIVIO In-Memory Resilience Engine)',
  });

  mem.public.registerFunction({
    name: 'date',
    args: [mem.public.getType('timestamp')],
    returns: mem.public.getType('date'),
    implementation: (ts) => (ts ? new Date(ts) : null),
  });

  mem.public.registerFunction({
    name: 'to_char',
    args: [mem.public.getType('timestamp'), mem.public.getType('text')],
    returns: mem.public.getType('text'),
    implementation: (ts, fmt) => {
      try {
        const d = new Date(ts);
        return d.toISOString().split('T')[0];
      } catch {
        return '';
      }
    },
  });

  mem.public.registerFunction({
    name: 'string_to_array',
    args: [mem.public.getType('text'), mem.public.getType('text')],
    returns: mem.public.getType('text').asArray(),
    implementation: (str, delim) => (str ? str.split(delim) : []),
  });

  mem.public.registerFunction({
    name: 'array_length',
    args: [mem.public.getType('text').asArray(), mem.public.getType('integer')],
    returns: mem.public.getType('integer'),
    implementation: (arr) => (Array.isArray(arr) ? arr.length : 0),
  });

  // PostGIS stubs
  mem.public.registerFunction({
    name: 'st_makepoint',
    args: [mem.public.getType('numeric'), mem.public.getType('numeric')],
    returns: mem.public.getType('text'),
    implementation: (lng, lat) => `POINT(${lng} ${lat})`,
  });

  mem.public.registerFunction({
    name: 'st_setsrid',
    args: [mem.public.getType('text'), mem.public.getType('integer')],
    returns: mem.public.getType('text'),
    implementation: (pt, srid) => `${pt}:${srid}`,
  });

  // Create full schema
  mem.public.none(`
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20),
      password_hash TEXT NOT NULL,
      points INT DEFAULT 0,
      agent_code TEXT,
      license_number TEXT,
      license_expiry DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE vehicles (
      vehicle_id SERIAL PRIMARY KEY,
      vehicle_number VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(50),
      capacity INT,
      status VARCHAR(20) DEFAULT 'available',
      assigned_driver_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE drivers (
      driver_id SERIAL PRIMARY KEY,
      user_id INT,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      license_no VARCHAR(50) UNIQUE,
      status VARCHAR(20) DEFAULT 'active',
      joined_date DATE DEFAULT CURRENT_DATE
    );

    CREATE TABLE routes (
      route_id SERIAL PRIMARY KEY,
      source VARCHAR(150) NOT NULL,
      destination VARCHAR(150) NOT NULL,
      distance_km NUMERIC NOT NULL,
      fare_per_km NUMERIC NOT NULL
    );

    CREATE TABLE schedules (
      schedule_id SERIAL PRIMARY KEY,
      route_id INT,
      vehicle_id INT,
      bus_number VARCHAR(50),
      bus_type VARCHAR(50),
      departure TIMESTAMP NOT NULL,
      arrival TIMESTAMP,
      status VARCHAR(20) DEFAULT 'active'
    );

    CREATE TABLE bookings (
      booking_id SERIAL PRIMARY KEY,
      customer_id INT,
      driver_id INT,
      vehicle_id INT,
      route_id INT,
      pickup_location TEXT,
      drop_location TEXT,
      booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(30) DEFAULT 'confirmed',
      payment_status VARCHAR(30) DEFAULT 'paid',
      fare NUMERIC,
      booking_type VARCHAR(10) DEFAULT 'B2C',
      company_name VARCHAR(255),
      company_contact VARCHAR(100),
      approval_status VARCHAR(20) DEFAULT 'approved'
    );

    CREATE TABLE payments (
      payment_id SERIAL PRIMARY KEY,
      booking_id INT,
      amount NUMERIC,
      method VARCHAR(50) DEFAULT 'card',
      status VARCHAR(30) DEFAULT 'success',
      transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE booking_seats (
      id SERIAL PRIMARY KEY,
      booking_id INT,
      seat_label VARCHAR(10) NOT NULL,
      price NUMERIC DEFAULT 0,
      status VARCHAR(20) DEFAULT 'booked',
      passenger_name VARCHAR(100),
      passenger_age INT,
      passenger_gender VARCHAR(20)
    );

    CREATE TABLE route_stops (
      stop_id SERIAL PRIMARY KEY,
      route_id INT,
      name VARCHAR(150) NOT NULL,
      latitude NUMERIC,
      longitude NUMERIC,
      sequence INT NOT NULL,
      arrival_time TIME,
      departure_time TIME
    );

    CREATE TABLE agents (
      agent_user_id INT PRIMARY KEY,
      agent_code TEXT UNIQUE,
      commission_rate NUMERIC DEFAULT 0.05,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE offline_bookings (
      id SERIAL PRIMARY KEY,
      agent_user_id INT,
      customer_name TEXT,
      customer_phone TEXT,
      route_id INT,
      schedule_id INT,
      seats TEXT,
      amount NUMERIC,
      payment_method VARCHAR(10) DEFAULT 'cash',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE testimonials (
      id SERIAL PRIMARY KEY,
      name TEXT,
      rating INT,
      comment TEXT,
      bus_condition INT,
      cleanliness INT,
      driver_behaviour INT,
      punctuality INT,
      comfort INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE fastag_accounts (
      account_id SERIAL PRIMARY KEY,
      vehicle_id INT,
      tag_id VARCHAR(100) UNIQUE,
      balance NUMERIC DEFAULT 1500.00,
      bank_name VARCHAR(100) DEFAULT 'State Bank of India',
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE fastag_transactions (
      transaction_id SERIAL PRIMARY KEY,
      tag_id VARCHAR(100),
      plaza_name VARCHAR(150),
      amount NUMERIC,
      toll_lane VARCHAR(20),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'success'
    );

    CREATE TABLE fuel_bills (
      bill_id SERIAL PRIMARY KEY,
      vehicle_id INT,
      liters NUMERIC,
      price_per_liter NUMERIC,
      total NUMERIC,
      station VARCHAR(150),
      receipt_no VARCHAR(100),
      payment_mode VARCHAR(50),
      billed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE toll_bills (
      bill_id SERIAL PRIMARY KEY,
      route_id INT,
      plaza VARCHAR(150),
      amount NUMERIC,
      receipt_no VARCHAR(100),
      payment_mode VARCHAR(50),
      billed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE permit_bills (
      bill_id SERIAL PRIMARY KEY,
      route_id INT,
      state VARCHAR(100),
      amount NUMERIC,
      valid_from DATE,
      valid_to DATE,
      receipt_no VARCHAR(100),
      payment_mode VARCHAR(50),
      billed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE invoices (
      invoice_id SERIAL PRIMARY KEY,
      booking_id INT,
      company_name VARCHAR(255),
      total_amount NUMERIC,
      issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_due DATE,
      payment_status VARCHAR(20) DEFAULT 'unpaid'
    );

    CREATE TABLE vehicle_locations (
      location_id SERIAL PRIMARY KEY,
      vehicle_id INT,
      latitude NUMERIC,
      longitude NUMERIC,
      speed_kmph NUMERIC,
      fuel_level NUMERIC,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE documents (
      doc_id SERIAL PRIMARY KEY,
      vehicle_id INT,
      entity_type VARCHAR(50) DEFAULT 'vehicle',
      entity_id INT,
      doc_type VARCHAR(50),
      doc_number VARCHAR(100),
      doc_name VARCHAR(150),
      expiry_date DATE,
      file_url TEXT,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'valid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE password_reset_tokens (
      user_id INT,
      token TEXT PRIMARY KEY,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const pg = mem.adapters.createPg();
  const pool = new pg.Pool();

  // Synchronously seed baseline records
  const adminHash = bcrypt.hashSync('admin123', 10);
  const managerHash = bcrypt.hashSync('manager123', 10);
  const driverHash = bcrypt.hashSync('driver123', 10);
  const agentHash = bcrypt.hashSync('agent123', 10);
  const corpHash = bcrypt.hashSync('corp123', 10);
  const custHash = bcrypt.hashSync('cust123', 10);
  const cust2Hash = bcrypt.hashSync('customer123', 10);

  const initialUsers = [
    { name: 'Admin User', email: 'admin@drivio.com', role: 'admin', hash: adminHash, phone: '9999999999', points: 0, code: null },
    { name: 'Admin FleetEase', email: 'admin@fleetease.com', role: 'admin', hash: adminHash, phone: '9999999991', points: 0, code: null },
    { name: 'Manager User', email: 'manager@drivio.com', role: 'manager', hash: managerHash, phone: '9999900022', points: 0, code: null },
    { name: 'Manager FleetEase', email: 'manager@fleetease.com', role: 'manager', hash: managerHash, phone: '9999900023', points: 0, code: null },
    { name: 'Rajesh Kumar (Driver)', email: 'driver@drivio.com', role: 'driver', hash: driverHash, phone: '9999900001', points: 50, code: null },
    { name: 'Driver User', email: 'driver1@fleetease.com', role: 'driver', hash: driverHash, phone: '9999900000', points: 50, code: null },
    { name: 'Sanjay Verma (Agent)', email: 'agent@drivio.com', role: 'agent', hash: agentHash, phone: '9999900011', points: 0, code: 'AG000007' },
    { name: 'Agent One', email: 'agent@fleetease.com', role: 'agent', hash: agentHash, phone: '9999900012', points: 0, code: 'AG000008' },
    { name: 'Corporate Admin', email: 'corporate@drivio.com', role: 'company_admin', hash: corpHash, phone: '8888888888', points: 0, code: null },
    { name: 'Company Admin Corp', email: 'corp@company.com', role: 'company_admin', hash: corpHash, phone: '8888888889', points: 0, code: null },
    { name: 'Apurva Sharma (Customer)', email: 'customer@drivio.com', role: 'customer', hash: cust2Hash, phone: '9876543210', points: 250, code: null },
    { name: 'Customer One', email: 'cust1@fleetease.com', role: 'customer', hash: custHash, phone: '9999990000', points: 100, code: null },
  ];

  initialUsers.forEach((u) => {
    pool.query(
      'INSERT INTO users (name, email, phone, role, password_hash, points, agent_code) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [u.name, u.email, u.phone, u.role, u.hash, u.points, u.code]
    ).catch(() => {});
  });

  // Seed standard routes
  const standardRoutes = [
    { source: 'Patna', destination: 'Purnea', distance: 310, fare: 2.1 },
    { source: 'Purnea', destination: 'Patna', distance: 310, fare: 2.1 },
    { source: 'Delhi', destination: 'Jaipur', distance: 280, fare: 2.2 },
    { source: 'Jaipur', destination: 'Delhi', distance: 280, fare: 2.2 },
    { source: 'Mumbai', destination: 'Pune', distance: 150, fare: 2.5 },
    { source: 'Pune', destination: 'Mumbai', distance: 150, fare: 2.5 },
    { source: 'Bengaluru', destination: 'Chennai', distance: 350, fare: 2.3 },
    { source: 'Chennai', destination: 'Bengaluru', distance: 350, fare: 2.3 },
    { source: 'Patna', destination: 'Muzaffarpur', distance: 75, fare: 2.0 },
    { source: 'Patna', destination: 'Gaya', distance: 110, fare: 2.0 },
    { source: 'Delhi', destination: 'Chandigarh', distance: 250, fare: 2.4 },
    { source: 'Mumbai', destination: 'Ahmedabad', distance: 530, fare: 2.2 },
    { source: 'Hyderabad', destination: 'Vijayawada', distance: 275, fare: 2.2 },
    { source: 'Kolkata', destination: 'Siliguri', distance: 580, fare: 2.3 },
  ];

  standardRoutes.forEach((r) => {
    pool.query(
      'INSERT INTO routes (source, destination, distance_km, fare_per_km) VALUES ($1, $2, $3, $4)',
      [r.source, r.destination, r.distance, r.fare]
    ).catch(() => {});
  });

  // Seed vehicles
  const vehicles = [
    { number: 'BR-01-EXP-1102', type: 'AC Seater 2x2', cap: 44, status: 'available', driver_id: 5 },
    { number: 'BR-01-VOL-2401', type: 'AC Multi-Axle Volvo', cap: 40, status: 'in-transit', driver_id: 6 },
    { number: 'BR-01-SLP-3904', type: '2x1 Luxury Sleeper', cap: 32, status: 'available', driver_id: null },
    { number: 'DL-01-EXP-5520', type: 'AC Seater 2x2', cap: 44, status: 'available', driver_id: null },
    { number: 'MH-02-VOL-8811', type: 'AC Multi-Axle Volvo', cap: 40, status: 'available', driver_id: null },
    { number: 'KA-05-SLP-9900', type: '2x1 Luxury Sleeper', cap: 32, status: 'available', driver_id: null },
  ];

  vehicles.forEach((v) => {
    pool.query(
      'INSERT INTO vehicles (vehicle_number, type, capacity, status, assigned_driver_id) VALUES ($1, $2, $3, $4, $5)',
      [v.number, v.type, v.cap, v.status, v.driver_id]
    ).catch(() => {});
  });

  // Seed schedules
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const schedules = [
    { route_id: 1, bus_number: 'BR-01-EXP-1102', bus_type: 'AC Seater 2x2', departure: `${todayStr} 06:30:00`, arrival: `${todayStr} 12:00:00` },
    { route_id: 1, bus_number: 'BR-01-VOL-2401', bus_type: 'AC Multi-Axle Volvo', departure: `${todayStr} 10:00:00`, arrival: `${todayStr} 15:30:00` },
    { route_id: 1, bus_number: 'BR-01-SLP-3904', bus_type: '2x1 Luxury Sleeper', departure: `${todayStr} 21:30:00`, arrival: `${todayStr} 03:30:00` },
    { route_id: 3, bus_number: 'DL-01-EXP-5520', bus_type: 'AC Seater 2x2', departure: `${todayStr} 07:00:00`, arrival: `${todayStr} 11:45:00` },
    { route_id: 5, bus_number: 'MH-02-VOL-8811', bus_type: 'AC Multi-Axle Volvo', departure: `${todayStr} 08:00:00`, arrival: `${todayStr} 11:15:00` },
  ];

  schedules.forEach((s) => {
    pool.query(
      'INSERT INTO schedules (route_id, bus_number, bus_type, departure, arrival, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [s.route_id, s.bus_number, s.bus_type, s.departure, s.arrival, 'active']
    ).catch(() => {});
  });

  // Seed bookings & payments for admin/manager analytics
  const seedBookings = [
    { customer_id: 11, vehicle_id: 1, route_id: 1, fare: 650, status: 'confirmed', pStatus: 'paid' },
    { customer_id: 11, vehicle_id: 2, route_id: 1, fare: 1300, status: 'confirmed', pStatus: 'paid' },
    { customer_id: 12, vehicle_id: 3, route_id: 1, fare: 850, status: 'confirmed', pStatus: 'paid' },
  ];

  seedBookings.forEach((b, idx) => {
    pool.query(
      'INSERT INTO bookings (customer_id, vehicle_id, route_id, fare, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6)',
      [b.customer_id, b.vehicle_id, b.route_id, b.fare, b.status, b.pStatus]
    ).then(() => {
      pool.query(
        'INSERT INTO payments (booking_id, amount, method, status) VALUES ($1, $2, $3, $4)',
        [idx + 1, b.fare, 'card', 'success']
      ).catch(() => {});
    }).catch(() => {});
  });

  // Seed offline bookings
  pool.query(
    'INSERT INTO offline_bookings (agent_user_id, customer_name, customer_phone, route_id, schedule_id, seats, amount, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [7, 'Ramesh Sahay', '9812345678', 1, 1, '1A,1B', 1300, 'cash']
  ).catch(() => {});

  // Seed bills
  pool.query(
    'INSERT INTO fuel_bills (vehicle_id, liters, price_per_liter, total, station) VALUES ($1, $2, $3, $4, $5)',
    [1, 80, 94.5, 7560, 'HPCL Highway Patna']
  ).catch(() => {});

  pool.query(
    'INSERT INTO toll_bills (route_id, plaza, amount) VALUES ($1, $2, $3)',
    [1, 'Didarganj Toll Plaza', 420]
  ).catch(() => {});

  pool.query(
    'INSERT INTO permit_bills (route_id, state, amount) VALUES ($1, $2, $3)',
    [1, 'Bihar State Transport Permit', 1200]
  ).catch(() => {});

  // Seed testimonials
  const testimonials = [
    { name: 'Ravi Kumar', rating: 5, comment: 'Very comfortable journey from Patna to Purnea. Bus was immaculate and on time.' },
    { name: 'Priya Sharma', rating: 5, comment: 'Clean sleeper berths, polite driver, and seamless digital boarding pass.' },
    { name: 'Amit Singh', rating: 5, comment: 'Best intercity fleet service in the region. Highly recommended!' },
  ];

  testimonials.forEach((t) => {
    pool.query(
      'INSERT INTO testimonials (name, rating, comment, bus_condition, cleanliness, driver_behaviour, punctuality, comfort) VALUES ($1, $2, $3, 5, 5, 5, 5, 5)',
      [t.name, t.rating, t.comment]
    ).catch(() => {});
  });

  console.log('✅ In-memory DRIVIO Database initialized with complete schema, default records, and analytics seed.');
  memDbInstance = mem;
  memPoolInstance = pool;
  return memPoolInstance;
}

module.exports = {
  createInMemoryDb,
};
