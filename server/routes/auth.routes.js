import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const aliases = {
    financeofficer: 'manjunath',
    univadmin: 'bcu_admin',
    validator: 'validator_shailaja',
    auditor: 'auditor_cag',
  };
  const lookup = aliases[username.toLowerCase()] || username;
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(lookup, username);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    logAudit({
      userId: user.user_id,
      userName: user.full_name,
      role: user.role,
      action: 'LOGIN_FAILED',
      entityType: 'User',
      entityId: user.user_id,
      details: { reason: 'Incorrect password' },
      ipAddress: req.ip,
    });
    return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
  }

  // Update last login
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE user_id = ?").run(user.user_id);

  const token = generateToken(user);

  logAudit({
    userId: user.user_id,
    userName: user.full_name,
    role: user.role,
    action: 'LOGIN_SUCCESS',
    entityType: 'User',
    entityId: user.user_id,
    details: { role: user.role, university_id: user.university_id },
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      university_id: user.university_id,
      department_id: user.department_id,
    },
  });
});

// GET /api/auth/me (Returns authenticated user)
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  logAudit({
    userId: req.user.user_id,
    userName: req.user.full_name,
    role: req.user.role,
    action: 'LOGOUT',
    entityType: 'User',
    entityId: req.user.user_id,
    ipAddress: req.ip,
  });

  return res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
