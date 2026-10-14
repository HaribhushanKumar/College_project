import express from 'express';
import db from '../config/database.js';
import { optionalAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// Helper to create CRUD routes for standard tables
export function createEntityRouter(tableName, idField) {
  const entityRouter = express.Router();

  // GET / (List all)
  entityRouter.get('/', (req, res) => {
    try {
      const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY created_at DESC`).all();
      return res.json({ success: true, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /:id (Get single)
  entityRouter.get('/:id', (req, res) => {
    try {
      const row = db.prepare(`SELECT * FROM ${tableName} WHERE ${idField} = ?`).get(req.params.id);
      if (!row) {
        return res.status(404).json({ success: false, message: `Record not found in ${tableName}.` });
      }
      return res.json({ success: true, data: row });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST / (Create new)
  entityRouter.post('/', optionalAuth, (req, res) => {
    try {
      const data = { ...req.body };
      const keys = Object.keys(data);
      if (keys.length === 0) {
        return res.status(400).json({ success: false, message: 'Request body cannot be empty.' });
      }

      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map((k) => (typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k]));

      const stmt = db.prepare(`INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`);
      const info = stmt.run(...values);

      const createdId = data[idField] || info.lastInsertRowid;

      logAudit({
        userId: req.user?.user_id,
        userName: req.user?.full_name || 'Admin',
        role: req.user?.role || 'Admin',
        action: `CREATE_${tableName.toUpperCase()}`,
        entityType: tableName,
        entityId: String(createdId),
        details: data,
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: `Record created in ${tableName}.`,
        data: { [idField]: createdId, ...data },
      });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ success: false, message: `Duplicate record: A record with this identifier already exists.` });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // PUT /:id (Update existing)
  entityRouter.put('/:id', optionalAuth, (req, res) => {
    try {
      const data = { ...req.body };
      delete data[idField]; // Don't update PK
      const keys = Object.keys(data);

      if (keys.length === 0) {
        return res.status(400).json({ success: false, message: 'Nothing to update.' });
      }

      const setClause = keys.map((k) => `${k} = ?`).join(', ');
      const values = keys.map((k) => (typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k]));
      values.push(req.params.id);

      const stmt = db.prepare(`UPDATE ${tableName} SET ${setClause}, updated_at = datetime('now') WHERE ${idField} = ?`);
      const info = stmt.run(...values);

      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: `Record not found in ${tableName}.` });
      }

      logAudit({
        userId: req.user?.user_id,
        userName: req.user?.full_name || 'Admin',
        role: req.user?.role || 'Admin',
        action: `UPDATE_${tableName.toUpperCase()}`,
        entityType: tableName,
        entityId: String(req.params.id),
        details: data,
        ipAddress: req.ip,
      });

      return res.json({ success: true, message: `Record in ${tableName} updated successfully.` });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /:id (Delete existing)
  entityRouter.delete('/:id', optionalAuth, (req, res) => {
    try {
      const stmt = db.prepare(`DELETE FROM ${tableName} WHERE ${idField} = ?`);
      const info = stmt.run(req.params.id);

      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: `Record not found in ${tableName}.` });
      }

      logAudit({
        userId: req.user?.user_id,
        userName: req.user?.full_name || 'Admin',
        role: req.user?.role || 'Admin',
        action: `DELETE_${tableName.toUpperCase()}`,
        entityType: tableName,
        entityId: String(req.params.id),
        ipAddress: req.ip,
      });

      return res.json({ success: true, message: `Record in ${tableName} deleted successfully.` });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  return entityRouter;
}

export default router;
