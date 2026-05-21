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
await pool.query(`ALTER TABLE custody ADD COLUMN IF NOT EXISTS note TEXT`);

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// GET /api/custody/:year  →  { "YYYY-MM-DD": { avril, leo, note? }, … }
app.get('/api/custody/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { rows } = await pool.query(
      `SELECT to_char(date, 'YYYY-MM-DD') AS ds, avril, leo, note
         FROM custody
        WHERE EXTRACT(YEAR FROM date) = $1`,
      [Number(year)]
    );
    const data = {};
    for (const row of rows) {
      const entry = { avril: row.avril, leo: row.leo };
      if (row.note) entry.note = row.note;
      data[row.ds] = entry;
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/custody/:date  body: { avril, leo, note }
app.put('/api/custody/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { avril, leo, note } = req.body;
    const noteVal = (typeof note === 'string' && note.trim()) ? note.trim() : null;

    if (!avril && !leo && !noteVal) {
      await pool.query('DELETE FROM custody WHERE date = $1', [date]);
    } else {
      await pool.query(
        `INSERT INTO custody (date, avril, leo, note) VALUES ($1, $2, $3, $4)
         ON CONFLICT (date) DO UPDATE SET avril = EXCLUDED.avril, leo = EXCLUDED.leo, note = EXCLUDED.note`,
        [date, avril || null, leo || null, noteVal]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/custody/bulk  body: { updates: [{ date, avril, leo }] }
app.post('/api/custody/bulk', async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0)
    return res.status(400).json({ error: 'updates must be a non-empty array' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const { date, avril, leo } of updates) {
      // bulk ne touche pas le champ note : on upsert avril/leo puis on supprime la
      // ligne uniquement si tout est vide, note comprise
      await client.query(
        `INSERT INTO custody (date, avril, leo) VALUES ($1, $2, $3)
         ON CONFLICT (date) DO UPDATE SET avril = EXCLUDED.avril, leo = EXCLUDED.leo`,
        [date, avril || null, leo || null]
      );
      await client.query(
        `DELETE FROM custody
          WHERE date = $1
            AND avril IS NULL
            AND leo IS NULL
            AND (note IS NULL OR note = '')`,
        [date]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true, count: updates.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Custody calendar running on port ${PORT}`));
