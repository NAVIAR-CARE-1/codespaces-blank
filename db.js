// Database connection and query execution
// PostgreSQL setup with connection pooling

const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.pool.max,
  min: config.database.pool.min,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  if (config.database.debug) {
    console.log('[DB] Pool connection established');
  }
});

/**
 * Execute a query and return results
 * @param {string} query - SQL query string
 * @param {array} params - Query parameters for parameterized queries
 * @returns {Promise<object>} Query result
 */
const query = async (queryText, values = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(queryText, values);
    const duration = Date.now() - start;

    if (config.database.debug) {
      console.log('[DB] Query executed', { queryText, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('[DB] Query error', { queryText, error: error.message });
    throw error;
  }
};

/**
 * Get a single row
 * @param {string} query - SQL query string
 * @param {array} params - Query parameters
 * @returns {Promise<object|null>} Single row or null
 */
const queryOne = async (queryText, values = []) => {
  const result = await query(queryText, values);
  return result.rows[0] || null;
};

/**
 * Get all rows
 * @param {string} query - SQL query string
 * @param {array} params - Query parameters
 * @returns {Promise<array>} Array of rows
 */
const queryMany = async (queryText, values = []) => {
  const result = await query(queryText, values);
  return result.rows;
};

/**
 * Execute an insert/update/delete and return affected row count
 * @param {string} query - SQL query string
 * @param {array} params - Query parameters
 * @returns {Promise<number>} Number of affected rows
 */
const execute = async (queryText, values = []) => {
  const result = await query(queryText, values);
  return result.rowCount;
};

/**
 * Start a transaction
 * @returns {Promise<PoolClient>} Database client for transaction
 */
const beginTransaction = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
};

/**
 * Commit a transaction
 * @param {PoolClient} client - Database client
 */
const commit = async (client) => {
  try {
    await client.query('COMMIT');
  } finally {
    client.release();
  }
};

/**
 * Rollback a transaction
 * @param {PoolClient} client - Database client
 */
const rollback = async (client) => {
  try {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
};

/**
 * Close the connection pool
 */
const close = async () => {
  await pool.end();
  console.log('[DB] Connection pool closed');
};

module.exports = {
  pool,
  query,
  queryOne,
  queryMany,
  execute,
  beginTransaction,
  commit,
  rollback,
  close,
};
