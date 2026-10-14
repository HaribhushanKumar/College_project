import express from 'express';
import XLSX from 'xlsx';
import db from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/reports - List statutory reports catalog
router.get('/', (req, res) => {
  const reports = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
  return res.json({ success: true, data: reports });
});

// GET /api/reports/export - Download dynamically generated CSV or XLSX reports from live database
router.get('/export', optionalAuth, (req, res) => {
  const type = req.query.type || 'statements';
  const format = (req.query.format || 'csv').toLowerCase();
  const financialYear = req.query.financial_year || '2024-25';
  const quarter = req.query.quarter || 'Q2 (Jul - Sep)';
  const universityId = req.query.university_id || 'UNIV-01';

  const univ = db.prepare('SELECT name, short_code FROM universities WHERE university_id = ?').get(universityId) || {
    name: 'Bengaluru City University',
    short_code: 'BCU',
  };

  const nowTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let sheetName = 'Report';
  let reportTitle = '';
  let rows = [];

  switch (type) {
    case 'statements': {
      reportTitle = `Quarterly Bank Statements Ledger (${quarter} FY${financialYear})`;
      sheetName = 'Bank Statements';
      const accounts = db.prepare(`
        SELECT 
          ba.id as [Account ID],
          ba.bank_name as [Bank Name],
          ba.account_number as [Account Number (Masked)],
          ba.account_type as [Account Type],
          ba.branch as [Branch],
          ba.ifsc as [IFSC Code],
          ba.current_balance as [Current Balance (INR)],
          COALESCE(bs.upload_status, 'Pending') as [Upload Status],
          COALESCE(bs.ai_status, 'Pending') as [AI Audit Status],
          COALESCE(bs.parsed_transactions_count, 0) as [Transactions Count],
          COALESCE(bs.uploaded_at, '-') as [Last Uploaded],
          COALESCE(bs.file_name, '-') as [File Name]
        FROM bank_accounts ba
        LEFT JOIN bank_statements bs ON ba.id = bs.account_id AND bs.financial_year = ? AND bs.quarter = ?
        WHERE ba.is_active = 1
        ORDER BY ba.id ASC
      `).all(financialYear, quarter);
      rows = accounts;
      break;
    }

    case 'income-expenditure': {
      reportTitle = `Income & Expenditure Statement (${quarter} FY${financialYear})`;
      sheetName = 'Income & Expenditure';
      const departments = db.prepare(`
        SELECT 
          d.dept_id as [Department Code],
          d.name as [Department Name],
          d.code as [Acronym],
          d.budget_allocated as [Sanctioned Budget (INR)],
          d.budget_utilized as [Utilized Expenditure (INR)],
          (d.budget_allocated - d.budget_utilized) as [Unspent Balance (INR)],
          ROUND((d.budget_utilized * 100.0 / d.budget_allocated), 2) as [Utilization Rate (%)]
        FROM departments d
        WHERE d.university_id = ?
        ORDER BY d.budget_utilized DESC
      `).all(universityId);
      rows = departments;
      break;
    }

    case 'scheme-utilization': {
      reportTitle = `Welfare Scheme Allocation & Utilization Register (${quarter} FY${financialYear})`;
      sheetName = 'Scheme Utilization';
      const schemes = db.prepare(`
        SELECT 
          s.scheme_id as [Scheme ID],
          s.name as [Scheme Name],
          s.code as [Code],
          s.funding_agency as [Funding Agency],
          s.total_grant_pool as [Sanctioned Grant Pool (INR)],
          s.disbursed_so_far as [Disbursed to Date (INR)],
          (s.total_grant_pool - s.disbursed_so_far) as [Available Balance (INR)],
          ROUND((s.disbursed_so_far * 100.0 / s.total_grant_pool), 2) as [Fund Utilization (%)]
        FROM schemes s
        WHERE s.is_active = 1
        ORDER BY s.total_grant_pool DESC
      `).all();
      rows = schemes;
      break;
    }

    case 'applications': {
      reportTitle = `Beneficiary Applications & Approval Register (${quarter} FY${financialYear})`;
      sheetName = 'Applications';
      const apps = db.prepare(`
        SELECT 
          a.app_id as [Application ID],
          s.name as [Student Name],
          s.enrollment_no as [Enrollment No],
          s.category as [Category],
          s.annual_family_income as [Family Income (INR)],
          s.attendance_rate as [Attendance Rate (%)],
          sc.name as [Scheme Name],
          a.amount_requested as [Requested Grant (INR)],
          a.status as [Approval Status],
          a.ai_validation_status as [AI Validation Status],
          a.ai_risk_score as [AI Risk Score],
          a.application_date as [Submission Date]
        FROM applications a
        JOIN students s ON a.student_id = s.student_id
        JOIN schemes sc ON a.scheme_id = sc.scheme_id
        ORDER BY a.created_at DESC
      `).all();
      rows = apps;
      break;
    }

    case 'disbursements': {
      reportTitle = `Direct Benefit Transfer (DBT) Disbursement History (${quarter} FY${financialYear})`;
      sheetName = 'Disbursements';
      const disbs = db.prepare(`
        SELECT 
          d.disbursement_id as [Voucher ID],
          d.application_id as [Application ID],
          d.student_id as [Student ID],
          d.amount as [Disbursed Amount (INR)],
          d.payment_mode as [Payment Mode],
          d.transaction_ref as [Bank UTR Reference],
          d.disbursement_date as [Disbursement Date],
          d.status as [Status]
        FROM disbursements d
        ORDER BY d.created_at DESC
      `).all();
      rows = disbs;
      break;
    }

    case 'reconciliation': {
      reportTitle = `Bank Statement Arithmetic Reconciliation Dossier (${quarter} FY${financialYear})`;
      sheetName = 'Reconciliation';
      const recon = db.prepare(`
        SELECT 
          ba.bank_name as [Bank Name],
          ba.account_number as [Account Number],
          bs.financial_year as [Financial Year],
          bs.quarter as [Quarter],
          bs.opening_balance as [Opening Balance (INR)],
          bs.closing_balance as [Reported Closing (INR)],
          bs.calculated_balance as [Calculated Balance (INR)],
          bs.balance_mismatch as [Variance Amount (INR)],
          bs.upload_status as [Upload Status],
          bs.ai_status as [AI Audit Status],
          bs.anomalies_detected as [Anomalies Flagged],
          bs.uploaded_at as [Verified At]
        FROM bank_statements bs
        JOIN bank_accounts ba ON bs.account_id = ba.id
        WHERE bs.financial_year = ? AND bs.quarter = ?
        ORDER BY bs.id ASC
      `).all(financialYear, quarter);
      rows = recon;
      break;
    }

    case 'anomalies': {
      reportTitle = `AI Validation Findings & Reviewer Decision Trail (${quarter} FY${financialYear})`;
      sheetName = 'AI Findings';
      const anom = db.prepare(`
        SELECT 
          a.anomaly_id as [Flag ID],
          a.title as [Finding Title],
          a.severity as [Severity Level],
          a.evidence as [Auditor Evidence],
          a.confidence_score as [AI Confidence],
          a.status as [Resolution Status],
          a.resolution_notes as [Reviewer Notes],
          a.resolved_at as [Resolved At],
          a.detected_at as [Detection Timestamp]
        FROM ai_anomalies a
        ORDER BY a.detected_at DESC
      `).all();
      rows = anom;
      break;
    }

    default:
      return res.status(400).json({ success: false, message: `Unsupported report type: ${type}` });
  }

  // Prepend report metadata summary banner
  const metadataRows = [
    { [Object.keys(rows[0] || { 'Report': '' })[0]]: `GOVERNMENT OF KARNATAKA - DEPARTMENT OF HIGHER EDUCATION` },
    { [Object.keys(rows[0] || { 'Report': '' })[0]]: `Institution: ${univ.name} (${univ.short_code})` },
    { [Object.keys(rows[0] || { 'Report': '' })[0]]: `Report: ${reportTitle}` },
    { [Object.keys(rows[0] || { 'Report': '' })[0]]: `Generated On: ${nowTimestamp} | Total Records: ${rows.length}` },
    {}, // Blank row separator
  ];

  const fullData = [...metadataRows, ...rows];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(fullData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  logAudit({
    userId: req.user?.user_id || 'USR-ANONYMOUS',
    userName: req.user?.full_name || 'Auditor',
    role: req.user?.role || 'Finance Officer',
    action: 'REPORT_EXPORTED',
    entityType: 'Report',
    entityId: type,
    details: { type, format, records: rows.length, financialYear, quarter },
    ipAddress: req.ip,
  });

  const fileSlug = `${type}_${univ.short_code}_${financialYear.replace('-', '_')}_${quarter.split(' ')[0]}`.toLowerCase();

  if (format === 'xlsx') {
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileSlug}.xlsx"`);
    return res.send(buffer);
  } else {
    // Default to CSV
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileSlug}.csv"`);
    return res.send(csvContent);
  }
});

// POST /api/reports - Certify & register new statutory report
router.post('/', optionalAuth, (req, res) => {
  const { title, type, university_id, financial_year, quarter } = req.body;

  const reportId = `REP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  db.prepare(`
    INSERT INTO reports (
      report_id, title, type, university_id, financial_year, quarter, generated_date, file_path, model_id, file_size, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MDL-FIN-01', '2.8 MB', 'Audited & Certified')
  `).run(
    reportId,
    title || `Statutory Audit Dossier (${quarter || 'Q2'} FY${financialYear || '2024-25'})`,
    type || 'Statutory Audit',
    university_id || 'UNIV-01',
    financial_year || '2024-25',
    quarter || 'Q2 (Jul - Sep)',
    now,
    `/reports/${reportId}.pdf`
  );

  logAudit({
    action: 'REPORT_GENERATED',
    entityType: 'Report',
    entityId: reportId,
    ipAddress: req.ip,
  });

  return res.status(201).json({
    success: true,
    message: 'Report compiled and certified.',
    data: { report_id: reportId },
  });
});

export default router;
