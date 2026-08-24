import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new Database(path.join(__dirname, 'fleet.db'));
app.use(cors());
app.use(express.json());

db.exec(`CREATE TABLE IF NOT EXISTS trucks (id TEXT PRIMARY KEY, name TEXT, driver TEXT, status TEXT, lat REAL, lng REAL, eta TEXT, job TEXT, fuel INTEGER, color TEXT)`);
const seed = [
  ['HT-204', 'Atlas', 'Maya Chen', 'En route', 42.765, -71.468, '08 min', 'Flatbed recovery', 72, '#e87536'],
  ['HT-118', 'Bolt', 'James Okafor', 'Available', 42.772, -71.461, '--', 'Awaiting dispatch', 91, '#3bb39b'],
  ['HT-307', 'Cedar', 'Sofia Alvarez', 'On scene', 42.758, -71.475, 'On site', 'Battery jump', 58, '#7c78ed'],
  ['HT-091', 'Dune', 'Noah Williams', 'Returning', 42.781, -71.452, '19 min', 'Vehicle transport', 44, '#e6ad3c'],
  ['HT-412', 'Ember', 'Priya Shah', 'Available', 42.749, -71.484, '--', 'Awaiting dispatch', 84, '#ef698b']
];
if (db.prepare('SELECT COUNT(*) AS count FROM trucks').get().count === 0) {
  const insert = db.prepare('INSERT INTO trucks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  db.transaction(() => seed.forEach((truck) => insert.run(...truck)))();
}
const legacyNewYorkFleet = db.prepare('SELECT COUNT(*) AS count FROM trucks WHERE lat BETWEEN 40 AND 41 AND lng < -72').get().count;
if (legacyNewYorkFleet > 0) {
  const updateLocation = db.prepare('UPDATE trucks SET lat = ?, lng = ? WHERE id = ?');
  db.transaction(() => seed.forEach((truck) => updateLocation.run(truck[4], truck[5], truck[0])))();
}

const getTrucks = db.prepare('SELECT * FROM trucks ORDER BY id');
app.get('/api/trucks', (_req, res) => res.json(getTrucks.all()));
app.get('/api/analytics', (_req, res) => res.json({ completed: 34, avgResponse: 11.4, utilization: 78, satisfaction: 4.8 }));
app.patch('/api/trucks/:id', (req, res) => {
  const truck = req.params.id;
  const { status } = req.body;
  db.prepare('UPDATE trucks SET status = ? WHERE id = ?').run(status, truck);
  res.json(db.prepare('SELECT * FROM trucks WHERE id = ?').get(truck));
});

setInterval(() => {
  const trucks = getTrucks.all();
  const update = db.prepare('UPDATE trucks SET lat = ?, lng = ? WHERE id = ?');
  db.transaction(() => trucks.filter((truck) => truck.status === 'En route' || truck.status === 'Returning').forEach((truck) => {
    const drift = () => (Math.random() - 0.5) * 0.0018;
    update.run(truck.lat + drift(), truck.lng + drift(), truck.id);
  }))();
}, 5000);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Fleet API listening on http://localhost:${port}`));
