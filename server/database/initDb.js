import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { seedDatabase } from './seeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  // Execute schema tables
  db.exec(schemaSql);

  // Check if users already seeded
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedDatabase();
  }
}

// Auto-run if executed directly via node initDb.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase();
  console.log('Database initialization complete.');
  process.exit(0);
}
