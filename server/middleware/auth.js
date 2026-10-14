import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'karnataka_dept_higher_education_super_secure_jwt_secret_2024';
export const JWT_EXPIRY = '24h';

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      university_id: user.university_id,
      department_id: user.department_id,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Authentication middleware to verify JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
    }

    // Verify user is active in DB
    const user = db.prepare('SELECT user_id, username, email, full_name, role, university_id, department_id, is_active FROM users WHERE user_id = ?').get(decodedUser.user_id);
    if (!user || !user.is_active) {
      return res.status(403).json({ success: false, message: 'User account is deactivated or not found.' });
    }

    req.user = user;
    next();
  });
}

// Optional Auth (for public or hybrid endpoints)
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decodedUser = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT user_id, username, email, full_name, role, university_id, department_id, is_active FROM users WHERE user_id = ?').get(decodedUser.user_id);
      if (user && user.is_active) {
        req.user = user;
      }
    } catch {
      // Ignore token verification errors in optionalAuth
    }
  }
  next();
}

// Role-Based Access Control (RBAC) middleware
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Super Admin has access to all routes
    if (req.user.role === 'Super Admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' lacks permission for this operation. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

// Scope validation (e.g., University Admin or Finance Officer can only access their university records)
export function checkUniversityScope(req, res, next) {
  if (!req.user) return next();

  if (req.user.role === 'Super Admin') {
    return next();
  }

  const requestedUnivId = req.params.university_id || req.body.university_id || req.query.university_id;
  if (requestedUnivId && req.user.university_id && req.user.university_id !== requestedUnivId) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have administrative access to university jurisdiction '${requestedUnivId}'.`,
    });
  }

  next();
}
