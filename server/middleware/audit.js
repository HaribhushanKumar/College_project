import db from '../config/database.js';

export function logAudit({
  userId = null,
  userName = 'System',
  role = 'System',
  action,
  entityType = null,
  entityId = null,
  details = null,
  ipAddress = '127.0.0.1',
}) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    const stmt = db.prepare(`
      INSERT INTO audit_logs (
        user_id, user_name, role, action, entity_type, entity_id, details, ip_address, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(userId, userName, role, action, entityType, entityId, detailsStr, ipAddress);
  } catch (err) {
    console.error('Audit log recording error:', err);
  }
}

// Express helper middleware to automatically log request actions
export function auditAction(actionName, entityTypeExtractor = () => null) {
  return (req, res, next) => {
    // Intercept response finish
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAudit({
          userId: req.user?.user_id || 'ANONYMOUS',
          userName: req.user?.full_name || req.user?.username || 'Anonymous',
          role: req.user?.role || 'Guest',
          action: actionName,
          entityType: entityTypeExtractor(req),
          entityId: req.params.id || req.body?.id || req.body?.app_id || req.body?.account_id || null,
          details: { method: req.method, path: req.originalUrl, query: req.query },
          ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
        });
      }
    });
    next();
  };
}
