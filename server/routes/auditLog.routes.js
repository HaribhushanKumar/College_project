import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?').all(limit);
  return res.json({ success: true, data: logs });
});

export default router;
