import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/custody_calendar',
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Create table on startup
await pool.query(`
  CREATE TABLE IF NOT EXISTS custody (
    date  DATE        PRIMARY KEY,
    avril VARCHAR(10),
    leo   VARCHAR(10)
  )
`);

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// GET /api/custody/:year  →  { "YYYY-MM-DD": { avril, leo }, … }
app.get('/api/custody/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { rows } = await pool.query(
      `SELECT to_char(date, 'YYYY-MM-DD') AS ds, avril, leo
         FROM custody
        WHERE EXTRACT(YEAR FROM date) = $1`,
      [Number(year)]
    );
    const data = {};
    for (const row of rows) {
      data[row.ds] = { avril: row.avril, leo: row.leo };
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/custody/:date  body: { avril, leo }
app.put('/api/custody/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { avril, leo } = req.body;

    if (!avril && !leo) {
      await pool.query('DELETE FROM custody WHERE date = $1', [date]);
    } else {
      await pool.query(
        `INSERT INTO custody (date, avril, leo) VALUES ($1, $2, $3)
         ON CONFLICT (date) DO UPDATE SET avril = EXCLUDED.avril, leo = EXCLUDED.leo`,
        [date, avril || null, leo || null]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Custody calendar running on port ${PORT}`));
