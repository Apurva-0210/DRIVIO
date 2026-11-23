const { Pool } = require('pg');
const { createInMemoryDb } = require('./utils/inMemoryDb');
require('dotenv').config();

let activePool = null;
let isInMemory = false;
let realPool = null;

function createRealPool() {
  if (process.env.DATABASE_URL) {
    const useSsl =
      process.env.DB_SSL === 'true' ||
      /render\.com|amazonaws\.com|supabase/i.test(process.env.DATABASE_URL);

    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 2000,
    });
  }

  return new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fleetease',
    password: process.env.DB_PASS || 'postgres',
    port: Number(process.env.DB_PORT || 5432),
    connectionTimeoutMillis: 2000,
  });
}

realPool = createRealPool();
activePool = realPool;

// Asynchronously test PostgreSQL availability and activate fallback if unreachable
realPool.query('SELECT 1')
  .then(() => {
    console.log('✅ PostgreSQL connected successfully to', process.env.DB_HOST || 'localhost');
  })
  .catch((err) => {
    console.warn('⚠️ Local PostgreSQL not accessible (' + (err.code || err.message) + ').');
    console.log('⚡ Activating resilient DRIVIO In-Memory Database engine.');
    isInMemory = true;
    activePool = createInMemoryDb();
  });

function isDdlQuery(text) {
  const trimmed = (text || '').trim().toUpperCase();
  return (
    trimmed.startsWith('CREATE ') ||
    trimmed.startsWith('ALTER ') ||
    trimmed.startsWith('DROP ') ||
    trimmed.startsWith('DO $$') ||
    trimmed.startsWith('DO $')
  );
}

// Resilient wrapper that delegates queries and catches ECONNREFUSED at query time
const proxyPool = {
  query: async function (text, params) {
    if (isInMemory) {
      try {
        return await activePool.query(text, params);
      } catch (memErr) {
        if (isDdlQuery(text)) {
          // Schema is already defined in memory; safely ignore DDL incompatibilities
          return { rows: [], rowCount: 0 };
        }
        throw memErr;
      }
    }

    try {
      return await activePool.query(text, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message?.includes('ECONNREFUSED')) {
        if (!isInMemory) {
          console.warn('⚠️ PostgreSQL connection refused at query time. Switching to resilient In-Memory DB.');
          isInMemory = true;
          activePool = createInMemoryDb();
        }
        try {
          return await activePool.query(text, params);
        } catch (memErr) {
          if (isDdlQuery(text)) {
            return { rows: [], rowCount: 0 };
          }
          throw memErr;
        }
      }
      throw err;
    }
  },

  connect: async function () {
    if (isInMemory) {
      const client = await activePool.connect();
      const origQuery = client.query.bind(client);
      client.query = async (t, p) => {
        try {
          return await origQuery(t, p);
        } catch (e) {
          if (isDdlQuery(t)) return { rows: [], rowCount: 0 };
          throw e;
        }
      };
      return client;
    }

    try {
      return await activePool.connect();
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message?.includes('ECONNREFUSED')) {
        if (!isInMemory) {
          console.warn('⚠️ PostgreSQL connection refused at connect(). Switching to resilient In-Memory DB.');
          isInMemory = true;
          activePool = createInMemoryDb();
        }
        const client = await activePool.connect();
        const origQuery = client.query.bind(client);
        client.query = async (t, p) => {
          try {
            return await origQuery(t, p);
          } catch (e) {
            if (isDdlQuery(t)) return { rows: [], rowCount: 0 };
            throw e;
          }
        };
        return client;
      }
      throw err;
    }
  },

  on: function (event, handler) {
    if (activePool && typeof activePool.on === 'function') {
      activePool.on(event, handler);
    }
  },

  end: function () {
    if (activePool && typeof activePool.end === 'function') {
      return activePool.end();
    }
  },
};

module.exports = proxyPool;
