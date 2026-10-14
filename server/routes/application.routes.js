import express from 'express';
import db from '../config/database.js';
import { optionalAuth, authenticateToken, requireRole } from '../middleware/auth.js';
import { AiValidationEngine } from '../services/aiValidationService.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/applications
router.get('/', (req, res) => {
  const { status, scheme_id, student_id } = req.query;

  let query = `
    SELECT 
      a.*,
      s.name as student_name,
      s.enrollment_no,
      s.category as student_category,
      s.annual_family_income,
      s.attendance_rate,
      s.bank_account,
      s.bank_ifsc,
      sc.name as scheme_name,
      sc.code as scheme_code,
      sc.max_amount as scheme_max_amount,
      v.name as validator_name
    FROM applications a
    JOIN students s ON a.student_id = s.student_id
    JOIN schemes sc ON a.scheme_id = sc.scheme_id
    LEFT JOIN validators v ON a.validator_id = v.validator_id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }
  if (scheme_id) {
    query += ' AND a.scheme_id = ?';
    params.push(scheme_id);
  }
  if (student_id) {
    query += ' AND a.student_id = ?';
    params.push(student_id);
  }

  query += ' ORDER BY a.created_at DESC';

  const rows = db.prepare(query).all(...params);

  // Parse JSON flags safely
  const formatted = rows.map((r) => {
    let flags = [];
    try {
      flags = r.ai_flags ? JSON.parse(r.ai_flags) : [];
    } catch {
      flags = [];
    }
    return {
      ...r,
      ai_flags: flags,
    };
  });

  return res.json({ success: true, data: formatted });
});

// GET /api/applications/:id
router.get('/:id', (req, res) => {
  const app = db.prepare(`
    SELECT 
      a.*,
      s.name as student_name,
      s.enrollment_no,
      s.category as student_category,
      s.annual_family_income,
      s.attendance_rate,
      s.bank_account,
      s.bank_ifsc,
      sc.name as scheme_name,
      sc.code as scheme_code,
      sc.max_amount as scheme_max_amount,
      v.name as validator_name
    FROM applications a
    JOIN students s ON a.student_id = s.student_id
    JOIN schemes sc ON a.scheme_id = sc.scheme_id
    LEFT JOIN validators v ON a.validator_id = v.validator_id
    WHERE a.app_id = ?
  `).get(req.params.id);

  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  let flags = [];
  try {
    flags = app.ai_flags ? JSON.parse(app.ai_flags) : [];
  } catch {
    flags = [];
  }

  return res.json({
    success: true,
    data: {
      ...app,
      ai_flags: flags,
    },
  });
});

// POST /api/applications (Create new application)
router.post('/', optionalAuth, (req, res) => {
  const { student_id, scheme_id, amount_requested, application_date, remarks } = req.body;

  if (!student_id || !scheme_id || !amount_requested) {
    return res.status(400).json({ success: false, message: 'student_id, scheme_id, and amount_requested are required.' });
  }

  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(student_id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const scheme = db.prepare('SELECT * FROM schemes WHERE scheme_id = ?').get(scheme_id);
  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found.' });
  }

  const appId = `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
  const dateStr = application_date || new Date().toISOString().split('T')[0];

  // Run AI Validation check
  const valResult = AiValidationEngine.validateApplication({
    application: { amount_requested: parseFloat(amount_requested) },
    student,
    scheme,
  });

  const stmt = db.prepare(`
    INSERT INTO applications (
      app_id, student_id, scheme_id, application_date, amount_requested, status, ai_validation_status, ai_risk_score, ai_flags, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    stmt.run(
      appId,
      student_id,
      scheme_id,
      dateStr,
      parseFloat(amount_requested),
      'Submitted',
      valResult.validationStatus,
      valResult.riskScore,
      JSON.stringify(valResult.flags),
      remarks || valResult.recommendation
    );
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate Application: An application for this student and scheme on this date already exists.',
      });
    }
    throw err;
  }

  logAudit({
    action: 'CREATE_APPLICATION',
    entityType: 'Application',
    entityId: appId,
    details: { student_id, scheme_id, amount_requested },
    ipAddress: req.ip,
  });

  return res.status(201).json({
    success: true,
    message: 'Application submitted successfully with automated AI eligibility scoring.',
    data: {
      app_id: appId,
      ai_validation_status: valResult.validationStatus,
      ai_risk_score: valResult.riskScore,
      flags: valResult.flags,
    },
  });
});

// POST /api/applications/:id/validate (Run automated AI checks)
router.post('/:id/validate', (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(app.student_id);
  const scheme = db.prepare('SELECT * FROM schemes WHERE scheme_id = ?').get(app.scheme_id);

  const valResult = AiValidationEngine.validateApplication({
    application: app,
    student,
    scheme,
  });

  db.prepare(`
    UPDATE applications
    SET ai_validation_status = ?, ai_risk_score = ?, ai_flags = ?, remarks = ?
    WHERE app_id = ?
  `).run(
    valResult.validationStatus,
    valResult.riskScore,
    JSON.stringify(valResult.flags),
    valResult.recommendation,
    app.app_id
  );

  return res.json({
    success: true,
    data: {
      app_id: app.app_id,
      ai_validation_status: valResult.validationStatus,
      ai_risk_score: valResult.riskScore,
      flags: valResult.flags,
    },
  });
});

// POST /api/applications/:id/approve (Auditor / Validator approval)
router.post('/:id/approve', optionalAuth, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

  db.prepare(`
    UPDATE applications
    SET status = 'Approved', ai_validation_status = 'Verified', verified_date = datetime('now')
    WHERE app_id = ?
  `).run(app.app_id);

  logAudit({
    action: 'APPLICATION_APPROVED',
    entityType: 'Application',
    entityId: app.app_id,
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    message: `Application ${app.app_id} approved for DBT payment clearance.`,
  });
});

// POST /api/applications/:id/reject
router.post('/:id/reject', optionalAuth, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

  const reason = req.body.reason || 'Failed statutory eligibility guidelines.';
  db.prepare(`
    UPDATE applications
    SET status = 'Rejected', ai_validation_status = 'Rejected by AI', remarks = ?
    WHERE app_id = ?
  `).run(reason, app.app_id);

  logAudit({
    action: 'APPLICATION_REJECTED',
    entityType: 'Application',
    entityId: app.app_id,
    details: { reason },
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    message: `Application ${app.app_id} marked as rejected.`,
  });
});

// POST /api/applications/:id/request-correction (Request applicant correction)
router.post('/:id/request-correction', optionalAuth, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

  const notes = req.body.notes || req.body.reason;
  if (!notes) {
    return res.status(400).json({ success: false, message: 'Mandatory correction instructions must be provided to the applicant.' });
  }

  const reviewerName = req.user?.full_name || 'Dr. R. Manjunath (Finance Officer)';

  db.prepare(`
    UPDATE applications
    SET status = 'Requires Correction', remarks = ?
    WHERE app_id = ?
  `).run(`[Correction Requested by ${reviewerName}]: ${notes}`, app.app_id);

  logAudit({
    action: 'APPLICATION_CORRECTION_REQUESTED',
    entityType: 'Application',
    entityId: app.app_id,
    details: { notes, reviewer: reviewerName },
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    message: `Application ${app.app_id} status updated to 'Requires Correction'.`,
    data: { app_id: app.app_id, status: 'Requires Correction', remarks: notes },
  });
});

// POST /api/applications/:id/disburse (Initiate DBT / PFMS transfer)
router.post('/:id/disburse', optionalAuth, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE app_id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

  if (app.status !== 'Approved') {
    return res.status(400).json({ success: false, message: 'Cannot disburse an application that is not in Approved status.' });
  }

  const existingDisb = db.prepare('SELECT * FROM disbursements WHERE application_id = ?').get(app.app_id);
  if (existingDisb) {
    return res.status(409).json({ success: false, message: `Disbursement record ${existingDisb.disbursement_id} already exists for this application.` });
  }

  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(app.student_id);
  const disbId = `DISB-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
  const utr = `SBIN${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900) + 100}`;

  const disbTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO disbursements (
        disbursement_id, application_id, amount, date, mode, status, utr_number, bank_account, pfms_batch_id, reconciliation_status
      ) VALUES (?, ?, ?, date('now'), ?, 'Completed', ?, ?, ?, 'Reconciled')
    `).run(
      disbId,
      app.app_id,
      app.amount_requested,
      req.body.mode || 'DBT - Aadhaar Payment Bridge (APB)',
      utr,
      student.bank_account || '•••• •••• 4421 (SBI)',
      `PFMS-GOK-${new Date().getFullYear()}-${Math.floor(Math.random() * 800) + 100}`
    );

    // Update application to Disbursed
    db.prepare("UPDATE applications SET status = 'Disbursed' WHERE app_id = ?").run(app.app_id);

    // Update scheme disbursed_so_far
    db.prepare("UPDATE schemes SET disbursed_so_far = disbursed_so_far + ? WHERE scheme_id = ?").run(app.amount_requested, app.scheme_id);
  });

  disbTx();

  logAudit({
    action: 'DISBURSEMENT_COMPLETED',
    entityType: 'Disbursement',
    entityId: disbId,
    details: { amount: app.amount_requested, utr },
    ipAddress: req.ip,
  });

  return res.status(201).json({
    success: true,
    message: `Disbursement voucher ${disbId} generated and DBT funds cleared via UTR ${utr}.`,
    data: { disbursement_id: disbId, utr_number: utr },
  });
});

export default router;
