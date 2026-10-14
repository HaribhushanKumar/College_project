-- =====================================================================
-- University Fund Management & AI Validation System
-- Normalized Relational Database Schema
-- Compatible with SQLite3 / Postgres / MySQL
-- =====================================================================

PRAGMA foreign_keys = ON;

-- 1. Universities
CREATE TABLE IF NOT EXISTS universities (
  university_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(50),
  location TEXT,
  type VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  contact_no VARCHAR(50),
  established INTEGER,
  vice_chancellor VARCHAR(255),
  finance_officer VARCHAR(255),
  total_budget REAL DEFAULT 0,
  allocated_funds REAL DEFAULT 0,
  utilized_funds REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
  dept_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  head_name VARCHAR(255),
  university_id VARCHAR(50) NOT NULL,
  budget_allocated REAL DEFAULT 0,
  budget_utilized REAL DEFAULT 0,
  faculty_count INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE CASCADE
);

-- 3. Faculty
CREATE TABLE IF NOT EXISTS faculty (
  faculty_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  department_id VARCHAR(50) NOT NULL,
  specialization TEXT,
  qualification VARCHAR(255),
  joining_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

-- 4. Students
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  enrollment_no VARCHAR(100) NOT NULL UNIQUE,
  department_id VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  annual_family_income REAL DEFAULT 0,
  bank_account VARCHAR(100),
  bank_ifsc VARCHAR(50),
  attendance_rate REAL DEFAULT 0,
  cgpa REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

-- 5. Courses
CREATE TABLE IF NOT EXISTS courses (
  course_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL,
  duration VARCHAR(100),
  department_id VARCHAR(50) NOT NULL,
  annual_fee REAL DEFAULT 0,
  intake_capacity INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

-- 6. Registrations (with unique constraint to prevent duplicate student-course-semester registration)
CREATE TABLE IF NOT EXISTS registrations (
  reg_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  sem VARCHAR(50) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  UNIQUE(student_id, course_id, academic_year, sem)
);

-- 7. Schemes (Scholarship and Grant Schemes)
CREATE TABLE IF NOT EXISTS schemes (
  scheme_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  eligibility_criteria TEXT,
  max_amount REAL NOT NULL,
  total_grant_pool REAL DEFAULT 0,
  disbursed_so_far REAL DEFAULT 0,
  funding_agency VARCHAR(255),
  min_attendance REAL DEFAULT 75.0,
  max_income_ceiling REAL DEFAULT 250000,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 8. Validators
CREATE TABLE IF NOT EXISTS validators (
  validator_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  assigned_count INTEGER DEFAULT 0,
  verified_count INTEGER DEFAULT 0,
  accuracy_rating VARCHAR(50) DEFAULT '99.0%',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 9. Applications
CREATE TABLE IF NOT EXISTS applications (
  app_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  scheme_id VARCHAR(50) NOT NULL,
  application_date TEXT NOT NULL,
  amount_requested REAL NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Under Review', 'AI Validated', 'Approved', 'Rejected', 'Requires Correction', 'Disbursed'
  ai_validation_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Verified', 'Flagged', 'Rejected by AI'
  ai_risk_score INTEGER DEFAULT 0,
  ai_flags TEXT DEFAULT '[]', -- JSON string
  validator_id VARCHAR(50),
  verified_date TEXT,
  remarks TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
  FOREIGN KEY (validator_id) REFERENCES validators(validator_id) ON DELETE SET NULL,
  UNIQUE(student_id, scheme_id, application_date)
);

-- 10. Disbursements (1-to-1 with Approved Application, idempotency on application_id)
CREATE TABLE IF NOT EXISTS disbursements (
  disbursement_id VARCHAR(50) PRIMARY KEY,
  application_id VARCHAR(50) NOT NULL UNIQUE,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  mode VARCHAR(100) NOT NULL, -- 'DBT - Aadhaar Payment Bridge (APB)', 'PFMS - Direct Beneficiary', 'RTGS Institutional Escrow'
  status VARCHAR(50) DEFAULT 'Queued', -- 'Queued', 'Pending Approval', 'Completed', 'Failed'
  utr_number VARCHAR(100) UNIQUE,
  bank_account VARCHAR(100),
  pfms_batch_id VARCHAR(100),
  reconciliation_status VARCHAR(50) DEFAULT 'Unreconciled', -- 'Reconciled', 'Unreconciled', 'Mismatch'
  statement_transaction_id VARCHAR(100),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(app_id) ON DELETE CASCADE
);

-- 11. AI Models
CREATE TABLE IF NOT EXISTS ai_models (
  model_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  accuracy VARCHAR(50) NOT NULL,
  description TEXT,
  last_trained TEXT,
  active_in_production INTEGER DEFAULT 1,
  rules_applied INTEGER DEFAULT 0,
  false_positive_rate VARCHAR(50) DEFAULT '0.5%',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 12. Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  university_id VARCHAR(50) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  bank_code VARCHAR(50) NOT NULL,
  account_number VARCHAR(100) NOT NULL UNIQUE,
  account_type VARCHAR(100) NOT NULL,
  branch VARCHAR(255),
  ifsc VARCHAR(50) NOT NULL,
  current_balance REAL DEFAULT 0,
  total_debits REAL DEFAULT 0,
  total_credits REAL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE CASCADE
);

-- 13. Bank Statements (Quarterly statements per account; UNIQUE constraint prevents duplicate upload)
CREATE TABLE IF NOT EXISTS bank_statements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  financial_year VARCHAR(50) NOT NULL,
  quarter VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_hash VARCHAR(64),
  mime_type VARCHAR(100),
  upload_status VARCHAR(50) DEFAULT 'Uploaded', -- 'Uploaded', 'Processing', 'Failed'
  ai_status VARCHAR(50) DEFAULT 'Completed', -- 'Completed', 'In Progress', 'Flagged', 'Failed'
  parsed_transactions_count INTEGER DEFAULT 0,
  opening_balance REAL,
  closing_balance REAL,
  calculated_balance REAL,
  balance_mismatch REAL DEFAULT 0,
  anomalies_detected INTEGER DEFAULT 0,
  uploaded_by VARCHAR(255),
  uploaded_at TEXT DEFAULT (datetime('now')),
  is_submitted_for_review INTEGER DEFAULT 0,
  submitted_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
  UNIQUE(account_id, financial_year, quarter)
);

-- 14. Statement Transactions (Line items parsed from bank statement)
CREATE TABLE IF NOT EXISTS statement_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  statement_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  txn_id VARCHAR(100),
  txn_date TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_no VARCHAR(100),
  type VARCHAR(20) NOT NULL, -- 'Credit', 'Debit'
  amount REAL NOT NULL,
  balance REAL,
  ai_category VARCHAR(100),
  ai_flag VARCHAR(50) DEFAULT 'Verified', -- 'Verified', 'Suspicious', 'Duplicate', 'Split Transaction'
  confidence VARCHAR(50) DEFAULT '99.0%',
  is_reconciled INTEGER DEFAULT 0,
  reconciled_with_type VARCHAR(50),
  reconciled_with_id VARCHAR(100),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (statement_id) REFERENCES bank_statements(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE
);

-- 15. Reports
CREATE TABLE IF NOT EXISTS reports (
  report_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  university_id VARCHAR(50),
  financial_year VARCHAR(50),
  quarter VARCHAR(50),
  generated_date TEXT NOT NULL,
  file_path TEXT,
  model_id VARCHAR(50),
  file_size VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Draft',
  metadata_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE SET NULL,
  FOREIGN KEY (model_id) REFERENCES ai_models(model_id) ON DELETE SET NULL
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id VARCHAR(100),
  user_name VARCHAR(255),
  role VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(50),
  timestamp TEXT DEFAULT (datetime('now'))
);

-- 17. Users and Roles
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL, -- 'Super Admin', 'University Admin', 'Finance Officer', 'Validator', 'Read-Only Auditor'
  university_id VARCHAR(50),
  department_id VARCHAR(50),
  is_active INTEGER DEFAULT 1,
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

-- 18. AI Anomalies Table (Explainable anomaly findings with severity and resolution)
CREATE TABLE IF NOT EXISTS ai_anomalies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anomaly_code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
  entity_type VARCHAR(100) NOT NULL, -- 'Application', 'Bank Statement', 'Transaction'
  entity_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  evidence_json TEXT,
  confidence REAL DEFAULT 0.95,
  status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'Under Review', 'Auditor Reviewed', 'Resolved', 'Dismissed'
  resolved_by VARCHAR(255),
  resolution_notes TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_departments_univ ON departments(university_id);
CREATE INDEX IF NOT EXISTS idx_faculty_dept ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_bank_statements_acct ON bank_statements(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_fy_qtr ON bank_statements(financial_year, quarter);
CREATE INDEX IF NOT EXISTS idx_transactions_stmt ON statement_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ref ON statement_transactions(reference_no);
CREATE INDEX IF NOT EXISTS idx_disbursements_app ON disbursements(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
