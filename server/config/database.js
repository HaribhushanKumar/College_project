import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'university_fund_mgmt.db');

export function createDatabaseConnection(customPath = null) {
  const dbFile = customPath || DB_PATH;
  const db = new Database(dbFile);

  // Enable WAL mode for high concurrency & Foreign Keys for strict relational integrity
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

// Singleton connection for application
const db = createDatabaseConnection();

export default db;
