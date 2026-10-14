import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import statementRoutes from './routes/statement.routes.js';
import applicationRoutes from './routes/application.routes.js';
import bankAccountRoutes from './routes/bankAccount.routes.js';
import aiValidationRoutes from './routes/aiValidation.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportRoutes from './routes/report.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import supabaseRoutes from './routes/supabase.routes.js';
import { createEntityRouter } from './routes/entity.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      system: 'University Fund Management & AI Validation System',
      department: 'Department of Higher Education, Government of Karnataka',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/statements', statementRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/bank-accounts', bankAccountRoutes);
  app.use('/api/ai', aiValidationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/audit-logs', auditLogRoutes);
  app.use('/api/supabase', supabaseRoutes);

  // Relational Entity Routes
  app.use('/api/universities', createEntityRouter('universities', 'university_id'));
  app.use('/api/departments', createEntityRouter('departments', 'dept_id'));
  app.use('/api/faculty', createEntityRouter('faculty', 'faculty_id'));
  app.use('/api/students', createEntityRouter('students', 'student_id'));
  app.use('/api/courses', createEntityRouter('courses', 'course_id'));
  app.use('/api/registrations', createEntityRouter('registrations', 'reg_id'));
  app.use('/api/schemes', createEntityRouter('schemes', 'scheme_id'));
  app.use('/api/disbursements', createEntityRouter('disbursements', 'disbursement_id'));

  // 404 handler for API routes
  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `API endpoint '${req.originalUrl}' not found.` });
  });

  // Centralized Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error occurred.',
    });
  });

  return app;
}

export default createApp();
