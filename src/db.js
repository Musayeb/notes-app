const { Pool } = require('pg');

// Connection settings come from the standard PG* environment variables
// (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE), read by node-postgres.
function createRepo(pool = new Pool()) {
  return {
    async migrate() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
    },
    async list() {
      const { rows } = await pool.query(
        'SELECT id, text, created_at FROM notes ORDER BY id DESC LIMIT 100',
      );
      return rows;
    },
    async create(text) {
      const { rows } = await pool.query(
        'INSERT INTO notes (text) VALUES ($1) RETURNING id, text, created_at',
        [text],
      );
      return rows[0];
    },
    async ping() {
      await pool.query('SELECT 1');
    },
    end() {
      return pool.end();
    },
  };
}

module.exports = { createRepo };
