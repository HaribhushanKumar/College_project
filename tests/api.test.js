import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import app from '../server/app.js';
import db from '../server/config/database.js';
import { initializeDatabase } from '../server/database/initDb.js';
import {
  FileSchemaValidator,
  TransactionExtractor,
  ArithmeticReconciliationService,
  DuplicateDetectionService,
  ValidationPipeline,
} from '../server/services/aiValidationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('University Fund Management & AI Validation System - End-to-End Test Suite', () => {
  let authToken = null;
  let testUser = null;

  before(() => {
    // Reset test database to pristine seed state
    db.prepare('DELETE FROM statement_transactions').run();
    db.prepare('DELETE FROM bank_statements').run();
    db.prepare('DELETE FROM disbursements').run();
    db.prepare('DELETE FROM applications').run();
    db.prepare('DELETE FROM registrations').run();
    db.prepare('DELETE FROM students').run();
    db.prepare('DELETE FROM courses').run();
    db.prepare('DELETE FROM faculty').run();
    db.prepare('DELETE FROM departments').run();
    db.prepare('DELETE FROM bank_accounts').run();
    db.prepare('DELETE FROM schemes').run();
    db.prepare('DELETE FROM validators').run();
    db.prepare('DELETE FROM ai_models').run();
    db.prepare('DELETE FROM ai_anomalies').run();
    db.prepare('DELETE FROM reports').run();
    db.prepare('DELETE FROM audit_logs').run();
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM universities').run();

    initializeDatabase();
  });

  // 1. Healthcheck Test
  test('GET /api/health should return system status UP', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'UP');
    assert.ok(res.body.department.includes('Karnataka'));
  });

  // 2. Authentication Tests
  describe('Authentication & RBAC', () => {
    test('POST /api/auth/login should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'manjunath', password: 'WrongPassword' });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test('POST /api/auth/login should succeed for Finance Officer and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'manjunath', password: 'Password@123' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.role, 'Finance Officer');

      authToken = res.body.token;
      testUser = res.body.user;
    });

    test('GET /api/auth/me should return authenticated user details with token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.username, 'manjunath');
    });
  });

  // 3. Bank Accounts & Statements
  describe('Bank Accounts & Quarterly Statements', () => {
    test('GET /api/bank-accounts should return all 18 scheduled bank accounts', async () => {
      const res = await request(app).get('/api/bank-accounts');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 18);
      // Check masked number
      assert.ok(res.body.data[0].account_number.startsWith('••••'));
    });

    test('GET /api/statements/summary should compute upload percentage and status counts', async () => {
      const res = await request(app)
        .get('/api/statements/summary')
        .query({ financial_year: '2024-25', quarter: 'Q2 (Jul - Sep)' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.totalAccounts, 18);
      assert.strictEqual(res.body.data.uploadedCount, 16);
      assert.strictEqual(res.body.data.processingCount, 1);
      assert.strictEqual(res.body.data.pendingCount, 1);
      assert.strictEqual(res.body.data.completionPercentage, 89);
    });

    test('GET /api/statements should return statements table matching screenshot state', async () => {
      const res = await request(app)
        .get('/api/statements')
        .query({ financial_year: '2024-25', quarter: 'Q2 (Jul - Sep)' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 18);

      // Verify Account #7 (Axis Bank) is Pending
      const axis = res.body.data.find((a) => a.id === 7);
      assert.ok(axis);
      assert.strictEqual(axis.statement_status, 'Pending');

      // Verify Account #1 (SBI) is Uploaded
      const sbi = res.body.data.find((a) => a.id === 1);
      assert.ok(sbi);
      assert.strictEqual(sbi.statement_status, 'Uploaded');
      assert.strictEqual(sbi.ai_status, 'Completed');
    });

    test('GET /api/statements/:id should return statement with parsed transactions', async () => {
      const res = await request(app).get('/api/statements/1');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.bank_name, 'State Bank of India');
      assert.ok(Array.isArray(res.body.data.transactions));
      assert.ok(res.body.data.transactions.length > 0);
    });
  });

  // 4. Statement Upload & AI Parser
  describe('Bank Statement File Upload & Extraction', () => {
    test('POST /api/statements/upload should upload, extract transactions, and run AI validation', async () => {
      // Create a temporary test CSV statement
      const tempCsvPath = path.join(__dirname, 'test_statement.csv');
      const csvContent = `Date,Description,Reference No,Debit,Credit,Balance
2024-09-01,GOVT GRANT DEPOSIT,GOK-CR-101,,5000000,5000000
2024-09-05,SCHOLARSHIP DBT BATCH,DBT-DR-201,150000,,4850000
2024-09-10,LAB EQUIPMENT PURCHASE,PO-LAB-301,350000,,4500000`;
      fs.writeFileSync(tempCsvPath, csvContent, 'utf-8');

      const res = await request(app)
        .post('/api/statements/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('account_id', '7') // Upload for Axis Bank (which was Pending)
        .field('financial_year', '2024-25')
        .field('quarter', 'Q2 (Jul - Sep)')
        .field('is_replace', 'true')
        .attach('statement_file', tempCsvPath);

      // Clean up temp file
      if (fs.existsSync(tempCsvPath)) fs.unlinkSync(tempCsvPath);

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.parsedTransactionsCount, 3);
      assert.ok(res.body.data.aiStatus === 'Completed' || res.body.data.aiStatus === 'In Progress');

      // Verify that Axis Bank status in DB is now Uploaded!
      const updatedSummary = await request(app)
        .get('/api/statements/summary')
        .query({ financial_year: '2024-25', quarter: 'Q2 (Jul - Sep)' });

      assert.strictEqual(updatedSummary.body.data.uploadedCount, 17);
      assert.strictEqual(updatedSummary.body.data.pendingCount, 0);
    });
  });

  // 5. AI Validation & Anomaly Engine
  describe('AI Validation Engine', () => {
    test('GET /api/ai/models should list active production AI models', async () => {
      const res = await request(app).get('/api/ai/models');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 3);
      const names = res.body.data.map((m) => m.name);
      assert.ok(names.some((n) => n.includes('FinShield')));
      assert.ok(names.some((n) => n.includes('ScholarCheck')));
      assert.ok(names.some((n) => n.includes('BankRecon')));
    });

    test('GET /api/ai/anomalies should list detected policy anomalies', async () => {
      const res = await request(app).get('/api/ai/anomalies');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 3);
    });

    test('POST /api/ai/anomalies/:id/resolve should mark anomaly resolved with auditor notes', async () => {
      const res = await request(app)
        .post('/api/ai/anomalies/ANOM-04/resolve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Medical certificate provided for marginal attendance deficit.' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    test('POST /api/ai/batch-audit should execute audit pipeline', async () => {
      const res = await request(app)
        .post('/api/ai/batch-audit')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.auditedApplications > 0);
    });
  });

  // 6. Application & Disbursement Management
  describe('Beneficiary Application & Disbursement Workflow', () => {
    test('GET /api/applications should return applications with student and scheme joins', async () => {
      const res = await request(app).get('/api/applications');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 6);
      assert.ok(res.body.data[0].student_name);
      assert.ok(res.body.data[0].scheme_name);
    });

    test('POST /api/applications should create new application and calculate AI risk score', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          student_id: 'STU-2024-001',
          scheme_id: 'SCH-PMS-01',
          amount_requested: 25000,
          application_date: `2024-11-${String(Math.floor(Math.random() * 25) + 1).padStart(2, '0')}`,
          remarks: 'Test Application',
        });

      assert.strictEqual(res.status, 201);
      assert.ok(res.body.data.app_id);
      assert.ok(typeof res.body.data.ai_risk_score === 'number');
    });

    test('POST /api/applications/:id/approve should approve application', async () => {
      const res = await request(app)
        .post('/api/applications/APP-2024-0895/approve')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    test('POST /api/applications/:id/disburse should generate DBT disbursement voucher', async () => {
      const res = await request(app)
        .post('/api/applications/APP-2024-0895/disburse')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ mode: 'DBT - Aadhaar Payment Bridge (APB)' });

      assert.strictEqual(res.status, 201);
      assert.ok(res.body.data.disbursement_id);
      assert.ok(res.body.data.utr_number);
    });
  });

  // 7. Analytics & Reports
  describe('Analytics & Statutory Reports', () => {
    test('GET /api/analytics/dashboard should return complete KPIs and chart feeds', async () => {
      const res = await request(app).get('/api/analytics/dashboard');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.kpis.totalAllocatedFunds > 0);
      assert.ok(Array.isArray(res.body.data.departments));
      assert.ok(Array.isArray(res.body.data.schemes));
    });

    test('GET /api/reports should return statutory dossiers', async () => {
      const res = await request(app).get('/api/reports');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 4);
    });
  });

  // 8. Relational Entities CRUD
  describe('Relational Master Entities (ER Model)', () => {
    test('GET /api/universities returns university records', async () => {
      const res = await request(app).get('/api/universities');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 4);
    });

    test('GET /api/departments returns academic departments', async () => {
      const res = await request(app).get('/api/departments');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 6);
    });

    test('GET /api/students returns enrolled students', async () => {
      const res = await request(app).get('/api/students');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 6);
    });

    test('GET /api/schemes returns welfare schemes', async () => {
      const res = await request(app).get('/api/schemes');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 5);
    });
  });

  // 9. Modular AI Validation Pipeline Services Unit Tests
  describe('Modular AI Validation Pipeline', () => {
    test('FileSchemaValidator rejects unsupported extensions and empty files', () => {
      const invalidExt = FileSchemaValidator.validateFileMetadata({
        filePath: 'test.exe',
        originalName: 'test.exe',
        size: 100,
      });
      assert.strictEqual(invalidExt.isValid, false);
      assert.ok(invalidExt.errors.some((e) => e.code === 'INVALID_FILE_EXTENSION'));

      const validPdf = FileSchemaValidator.validateFileMetadata({
        filePath: __filename,
        originalName: 'statement.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      });
      assert.strictEqual(validPdf.isValid, true);
    });

    test('TransactionExtractor normalizes currency, signs, and dates', () => {
      const normalized = TransactionExtractor.normalizeSingleTransaction({
        date: '15/08/2024',
        particulars: 'State Scholarship Grant DBT',
        credit: '₹ 25,000.50',
        reference_no: 'UTR/SBIN/881923',
      });

      assert.strictEqual(normalized.txn_date, '2024-08-15');
      assert.strictEqual(normalized.amount, 25000.5);
      assert.strictEqual(normalized.type, 'Credit');
      assert.strictEqual(normalized.reference_no, 'UTRSBIN881923');
    });

    test('ArithmeticReconciliationService flags balance mismatches deterministically', () => {
      const recon = ArithmeticReconciliationService.reconcileStatement({
        openingBalance: 100000,
        closingBalance: 150000, // True closing should be 100,000 + 40,000 - 10,000 = 130,000 (Mismatch of 20,000)
        transactions: [
          { txn_id: 'T1', type: 'Credit', amount: 40000 },
          { txn_id: 'T2', type: 'Debit', amount: 10000 },
        ],
      });

      assert.strictEqual(recon.isReconciled, false);
      assert.strictEqual(recon.calculatedClosing, 130000);
      assert.strictEqual(recon.balanceVariance, 20000);
      assert.ok(recon.findings.some((f) => f.category === 'DETERMINISTIC_ERROR'));
    });

    test('ValidationPipeline processes transactions, scores risk, and groups by severity', () => {
      const res = ValidationPipeline.processStatement({
        rawTransactions: [
          { date: '2024-08-10', description: 'Vendor IT Equipment', debit: 45000, reference_no: 'REF-001' },
          { date: '2024-08-11', description: 'Vendor IT Equipment 2', debit: 46000, reference_no: 'REF-002' },
          { date: '2024-08-12', description: 'Vendor IT Equipment 3', debit: 47000, reference_no: 'REF-003' },
        ],
        openingBalance: 500000,
        closingBalance: 362000,
      });

      assert.strictEqual(res.success, true);
      assert.ok(res.riskScore > 0);
      assert.ok(res.riskScoreFormula.includes('Risk Score ='));
      assert.ok(Array.isArray(res.findingsBySeverity.High));
      assert.ok(res.findingsBySeverity.High.some((f) => f.ruleOrModelId === 'RULE_KTPP_SPLIT_PROCUREMENT'));
    });
  });

  // 10. Statutory Report Exports (CSV and XLSX)
  describe('Statutory Report Generation & Export', () => {
    test('GET /api/reports/export?type=statements&format=csv returns downloadable CSV', async () => {
      const res = await request(app).get('/api/reports/export?type=statements&format=csv');
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers['content-type'].includes('text/csv'));
      assert.ok(res.headers['content-disposition'].includes('attachment'));
      assert.ok(res.text.includes('GOVERNMENT OF KARNATAKA'));
    });

    test('GET /api/reports/export?type=reconciliation&format=xlsx returns valid XLSX buffer', async () => {
      const res = await request(app).get('/api/reports/export?type=reconciliation&format=xlsx');
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers['content-type'].includes('spreadsheetml'));
      assert.ok(res.headers['content-disposition'].includes('.xlsx'));
      assert.ok(res.headers['content-disposition'].includes('reconciliation'));
    });
  });

  // 11. Validation Workbench Queue & Reviewer Decisions
  describe('Validation Workbench & Reviewer Decisions', () => {
    test('GET /api/ai/workbench/queue returns statements and applications queue', async () => {
      const res = await request(app).get('/api/ai/workbench/queue');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data.statementsQueue));
      assert.ok(Array.isArray(res.body.data.applicationsQueue));
      assert.ok(res.body.data.statementsQueue.length > 0);
    });

    test('POST /api/ai/statements/:id/review requires reason on reject/request-correction', async () => {
      const failRes = await request(app)
        .post('/api/ai/statements/1/review')
        .send({ action: 'Request Correction', reason: '' });
      assert.strictEqual(failRes.status, 400);

      const passRes = await request(app)
        .post('/api/ai/statements/1/review')
        .send({ action: 'Approve', reason: 'Certified clean reconciliation' });
      assert.strictEqual(passRes.status, 200);
      assert.strictEqual(passRes.body.data.upload_status, 'Uploaded');
    });

    test('POST /api/applications/:id/request-correction marks application for correction', async () => {
      const res = await request(app)
        .post('/api/applications/APP-2024-0895/request-correction')
        .send({ notes: 'Please provide certified Nadakacheri revenue income certificate.' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.status, 'Requires Correction');
    });
  });
});
