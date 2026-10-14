-- =====================================================================
-- University Fund Management & AI Validation System
-- Supabase / PostgreSQL Production Cloud Schema & Seed Script
-- Project ID: gkbrcbmwmdrsywfjinfp (college-fund-mgmt | ap-northeast-2)
-- =====================================================================

-- Step 1: Clean drop if re-running (safe order of foreign keys)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS ai_anomalies CASCADE;
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS statement_transactions CASCADE;
-- DROP TABLE IF EXISTS bank_statements CASCADE;
-- DROP TABLE IF EXISTS bank_accounts CASCADE;
-- DROP TABLE IF EXISTS disbursements CASCADE;
-- DROP TABLE IF EXISTS applications CASCADE;
-- DROP TABLE IF EXISTS validators CASCADE;
-- DROP TABLE IF EXISTS ai_models CASCADE;
-- DROP TABLE IF EXISTS schemes CASCADE;
-- DROP TABLE IF EXISTS registrations CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS faculty CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;
-- DROP TABLE IF EXISTS universities CASCADE;

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
  total_budget NUMERIC(18, 2) DEFAULT 0,
  allocated_funds NUMERIC(18, 2) DEFAULT 0,
  utilized_funds NUMERIC(18, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
  dept_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  head_name VARCHAR(255),
  university_id VARCHAR(50) NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  budget_allocated NUMERIC(18, 2) DEFAULT 0,
  budget_utilized NUMERIC(18, 2) DEFAULT 0,
  faculty_count INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users and Roles
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  university_id VARCHAR(50) REFERENCES universities(university_id) ON DELETE SET NULL,
  department_id VARCHAR(50) REFERENCES departments(dept_id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Faculty
CREATE TABLE IF NOT EXISTS faculty (
  faculty_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  department_id VARCHAR(50) NOT NULL REFERENCES departments(dept_id) ON DELETE CASCADE,
  specialization TEXT,
  qualification VARCHAR(255),
  joining_date VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Students
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  enrollment_no VARCHAR(100) NOT NULL UNIQUE,
  department_id VARCHAR(50) NOT NULL REFERENCES departments(dept_id) ON DELETE CASCADE,
  category VARCHAR(50),
  annual_family_income NUMERIC(15, 2) DEFAULT 0,
  bank_account VARCHAR(100),
  bank_ifsc VARCHAR(50),
  attendance_rate NUMERIC(5, 2) DEFAULT 0,
  cgpa NUMERIC(4, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Courses
CREATE TABLE IF NOT EXISTS courses (
  course_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL,
  duration VARCHAR(100),
  department_id VARCHAR(50) NOT NULL REFERENCES departments(dept_id) ON DELETE CASCADE,
  annual_fee NUMERIC(15, 2) DEFAULT 0,
  intake_capacity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Registrations
CREATE TABLE IF NOT EXISTS registrations (
  reg_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  sem VARCHAR(50) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  date VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_course_year_sem UNIQUE (student_id, course_id, academic_year, sem)
);

-- 8. Schemes (State & Central Scholarship/Grants)
CREATE TABLE IF NOT EXISTS schemes (
  scheme_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  eligibility_criteria TEXT,
  max_amount NUMERIC(15, 2) NOT NULL,
  total_grant_pool NUMERIC(18, 2) DEFAULT 0,
  disbursed_so_far NUMERIC(18, 2) DEFAULT 0,
  funding_agency VARCHAR(255),
  min_attendance NUMERIC(5, 2) DEFAULT 75.0,
  max_income_ceiling NUMERIC(15, 2) DEFAULT 250000,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Validators
CREATE TABLE IF NOT EXISTS validators (
  validator_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  assigned_count INTEGER DEFAULT 0,
  verified_count INTEGER DEFAULT 0,
  accuracy_rating VARCHAR(50) DEFAULT '99.0%',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Applications
CREATE TABLE IF NOT EXISTS applications (
  app_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  scheme_id VARCHAR(50) NOT NULL REFERENCES schemes(scheme_id) ON DELETE CASCADE,
  application_date VARCHAR(50) NOT NULL,
  amount_requested NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  ai_validation_status VARCHAR(50) DEFAULT 'Pending',
  ai_risk_score INTEGER DEFAULT 0,
  ai_flags TEXT DEFAULT '[]',
  validator_id VARCHAR(50) REFERENCES validators(validator_id) ON DELETE SET NULL,
  verified_date VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_scheme_date UNIQUE (student_id, scheme_id, application_date)
);

-- 11. Disbursements
CREATE TABLE IF NOT EXISTS disbursements (
  disbursement_id VARCHAR(50) PRIMARY KEY,
  application_id VARCHAR(50) NOT NULL UNIQUE REFERENCES applications(app_id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  date VARCHAR(50) NOT NULL,
  mode VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Queued',
  utr_number VARCHAR(100) UNIQUE,
  bank_account VARCHAR(100),
  pfms_batch_id VARCHAR(100),
  reconciliation_status VARCHAR(50) DEFAULT 'Unreconciled',
  statement_transaction_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Models
CREATE TABLE IF NOT EXISTS ai_models (
  model_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  accuracy VARCHAR(50) NOT NULL,
  description TEXT,
  last_trained VARCHAR(50),
  active_in_production BOOLEAN DEFAULT TRUE,
  rules_applied INTEGER DEFAULT 0,
  false_positive_rate VARCHAR(50) DEFAULT '0.5%',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Bank Accounts (18 university designated accounts)
CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  university_id VARCHAR(50) NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  bank_name VARCHAR(255) NOT NULL,
  bank_code VARCHAR(50) NOT NULL,
  account_number VARCHAR(100) NOT NULL UNIQUE,
  account_type VARCHAR(100) NOT NULL,
  branch VARCHAR(255),
  ifsc VARCHAR(50) NOT NULL,
  current_balance NUMERIC(18, 2) DEFAULT 0,
  total_debits NUMERIC(18, 2) DEFAULT 0,
  total_credits NUMERIC(18, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Bank Statements
CREATE TABLE IF NOT EXISTS bank_statements (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  financial_year VARCHAR(50) NOT NULL,
  quarter VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_hash VARCHAR(64),
  mime_type VARCHAR(100),
  upload_status VARCHAR(50) DEFAULT 'Uploaded',
  ai_status VARCHAR(50) DEFAULT 'Completed',
  parsed_transactions_count INTEGER DEFAULT 0,
  opening_balance NUMERIC(18, 2),
  closing_balance NUMERIC(18, 2),
  calculated_balance NUMERIC(18, 2),
  balance_mismatch NUMERIC(18, 2) DEFAULT 0,
  anomalies_detected INTEGER DEFAULT 0,
  uploaded_by VARCHAR(255),
  uploaded_at VARCHAR(100),
  is_submitted_for_review BOOLEAN DEFAULT FALSE,
  submitted_at VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_bank_statements_acct_fy_qtr UNIQUE (account_id, financial_year, quarter)
);

-- 15. Statement Transactions
CREATE TABLE IF NOT EXISTS statement_transactions (
  id SERIAL PRIMARY KEY,
  statement_id INTEGER NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  txn_id VARCHAR(100),
  txn_date VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  reference_no VARCHAR(100),
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(18, 2) NOT NULL,
  balance NUMERIC(18, 2),
  ai_category VARCHAR(100),
  ai_flag VARCHAR(50) DEFAULT 'Verified',
  confidence VARCHAR(50) DEFAULT '99.0%',
  is_reconciled BOOLEAN DEFAULT FALSE,
  reconciled_with_type VARCHAR(50),
  reconciled_with_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Reports
CREATE TABLE IF NOT EXISTS reports (
  report_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  university_id VARCHAR(50) REFERENCES universities(university_id) ON DELETE SET NULL,
  financial_year VARCHAR(50),
  quarter VARCHAR(50),
  generated_date VARCHAR(50) NOT NULL,
  file_path TEXT,
  model_id VARCHAR(50) REFERENCES ai_models(model_id) ON DELETE SET NULL,
  file_size VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Draft',
  metadata_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  user_name VARCHAR(255),
  role VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AI Anomalies
CREATE TABLE IF NOT EXISTS ai_anomalies (
  id SERIAL PRIMARY KEY,
  anomaly_code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  evidence_json TEXT,
  confidence NUMERIC(4, 2) DEFAULT 0.95,
  status VARCHAR(50) DEFAULT 'Open',
  resolved_by VARCHAR(255),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_dept_univ ON departments(university_id);
CREATE INDEX IF NOT EXISTS idx_faculty_dept ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_bank_stmts_acct ON bank_statements(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_stmts_fy_qtr ON bank_statements(financial_year, quarter);
CREATE INDEX IF NOT EXISTS idx_txns_stmt ON statement_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_app ON disbursements(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Enable Row Level Security (RLS) with permissive read/write policies
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validators ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE statement_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_anomalies ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for anon frontend) and full access for authenticated/service role
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public Read Access" ON %I;', tbl);
    EXECUTE format('CREATE POLICY "Public Read Access" ON %I FOR SELECT USING (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Service Role All" ON %I;', tbl);
    EXECUTE format('CREATE POLICY "Service Role All" ON %I FOR ALL USING (true);', tbl);
  END LOOP;
END $$;


-- =====================================================================
-- SEED DATA INSERTION
-- =====================================================================

-- 1. Universities
INSERT INTO universities (
  university_id, name, short_code, location, type, email, contact_no, established, vice_chancellor, finance_officer, total_budget, allocated_funds, utilized_funds
) VALUES 
('UNIV-01', 'Bengaluru City University', 'BCU', 'Central College Campus, Bengaluru, Karnataka', 'State Public University', 'finance@bcu.ac.in', '+91 80 2296 1003', 2017, 'Prof. Lingaraja Gandhi', 'Dr. R. Manjunath', 1450000000, 1120000000, 985000000),
('UNIV-02', 'Visvesvaraya Technological University', 'VTU', 'Jnana Sangama, Belagavi, Karnataka', 'State Technological University', 'finance@vtu.ac.in', '+91 831 249 8100', 1998, 'Prof. S. Vidyashankar', 'Dr. M. A. Venkatesh', 2800000000, 2350000000, 1940000000),
('UNIV-03', 'University of Mysore', 'UOM', 'Crawford Hall, Mysuru, Karnataka', 'State Public University', 'fo@uni-mysore.ac.in', '+91 821 241 9301', 1916, 'Prof. N. K. Lokanath', 'Dr. Sangeetha K.', 2100000000, 1780000000, 1620000000),
('UNIV-04', 'Karnatak University Dharwad', 'KUD', 'Pavate Nagar, Dharwad, Karnataka', 'State Public University', 'finance@kud.ac.in', '+91 836 221 5250', 1949, 'Prof. K. B. Gudasi', 'Dr. Ramesh Babu', 1650000000, 1390000000, 1210000000)
ON CONFLICT (university_id) DO NOTHING;

-- 2. Departments
INSERT INTO departments (
  dept_id, name, code, description, head_name, university_id, budget_allocated, budget_utilized, faculty_count, student_count
) VALUES
('DEPT-CSE', 'Computer Science & Engineering', 'CSE', 'AI, ML, Cybersecurity and Systems', 'Dr. Anitha S. Murthy', 'UNIV-01', 42000000, 36500000, 24, 580),
('DEPT-ECE', 'Electronics & Communication', 'ECE', 'VLSI Design, Embedded Systems and Signal Processing', 'Dr. Ravindra Kumar', 'UNIV-01', 38000000, 31200000, 20, 490),
('DEPT-COMM', 'Commerce & Financial Studies', 'COMM', 'Public Finance, Auditing and Corporate Taxation', 'Dr. M. S. Ramachandra', 'UNIV-01', 28000000, 24900000, 18, 720),
('DEPT-BIO', 'Biotechnology & Bioinformatics', 'BIO', 'Genomics, Molecular Diagnostics and Bioprocesses', 'Dr. Poornima Hegde', 'UNIV-01', 35000000, 30800000, 16, 310),
('DEPT-PHYS', 'Physics & Material Science', 'PHYS', 'Semiconductors, Quantum Devices and Nanotech', 'Dr. K. N. Chandrashekar', 'UNIV-01', 25000000, 21400000, 14, 260),
('DEPT-MECH', 'Mechanical & Automation Engineering', 'MECH', 'Robotics, Additive Manufacturing and Propulsion', 'Dr. B. V. Suresh', 'UNIV-01', 32000000, 28100000, 19, 420)
ON CONFLICT (dept_id) DO NOTHING;

-- 3. Users (Default password: Password@123)
INSERT INTO users (
  user_id, username, email, password_hash, full_name, role, university_id, department_id, is_active
) VALUES
('USR-01', 'superadmin', 'admin@highered.karnataka.gov.in', '$2a$10$wN1Q/Xw4z13F39z/iE4J..G8QG6q.zRkO1XjP0wVbJk3H3z.qVzOe', 'Principal Secretary (Higher Education)', 'Super Admin', null, null, TRUE),
('USR-02', 'manjunath', 'fo.manjunath@bcu.ac.in', '$2a$10$wN1Q/Xw4z13F39z/iE4J..G8QG6q.zRkO1XjP0wVbJk3H3z.qVzOe', 'Dr. R. Manjunath', 'Finance Officer', 'UNIV-01', null, TRUE),
('USR-03', 'bcu_admin', 'registrar@bcu.ac.in', '$2a$10$wN1Q/Xw4z13F39z/iE4J..G8QG6q.zRkO1XjP0wVbJk3H3z.qVzOe', 'Registrar BCU', 'University Admin', 'UNIV-01', null, TRUE),
('USR-04', 'validator_shailaja', 'ar.scholarships@bcu.ac.in', '$2a$10$wN1Q/Xw4z13F39z/iE4J..G8QG6q.zRkO1XjP0wVbJk3H3z.qVzOe', 'Smt. Shailaja K. S.', 'Validator', 'UNIV-01', null, TRUE),
('USR-05', 'auditor_cag', 'auditor@cag.gov.in', '$2a$10$wN1Q/Xw4z13F39z/iE4J..G8QG6q.zRkO1XjP0wVbJk3H3z.qVzOe', 'Sri Anand Deshmukh (CAG Auditor)', 'Read-Only Auditor', 'UNIV-01', null, TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Faculty
INSERT INTO faculty (
  faculty_id, name, designation, email, phone, department_id, specialization, qualification, joining_date
) VALUES
('FAC-101', 'Dr. Anitha S. Murthy', 'Professor & HOD', 'anitha.murthy@bcu.ac.in', '+91 98451 22340', 'DEPT-CSE', 'Artificial Intelligence & Distributed Systems', 'Ph.D (IISc Bangalore)', '2018-06-15'),
('FAC-102', 'Dr. P. Venugopal Rao', 'Associate Professor', 'venu.rao@bcu.ac.in', '+91 94480 34125', 'DEPT-CSE', 'Cybersecurity & Blockchain', 'Ph.D (NIT Surathkal)', '2019-08-01'),
('FAC-103', 'Dr. Ravindra Kumar', 'Professor & HOD', 'ravindra.k@bcu.ac.in', '+91 98802 77190', 'DEPT-ECE', 'VLSI Design & Embedded Systems', 'Ph.D (IIT Madras)', '2018-07-10'),
('FAC-104', 'Dr. M. S. Ramachandra', 'Professor & Dean', 'ms.ramachandra@bcu.ac.in', '+91 97411 90812', 'DEPT-COMM', 'Public Finance & Corporate Governance', 'Ph.D (Bangalore University)', '2017-11-20'),
('FAC-105', 'Dr. Poornima Hegde', 'Associate Professor & HOD', 'poornima.hegde@bcu.ac.in', '+91 94812 66334', 'DEPT-BIO', 'Bio-pharmaceuticals & Genomics', 'Ph.D (Manipal Academy)', '2020-01-15'),
('FAC-106', 'Dr. B. V. Suresh', 'Professor & HOD', 'bv.suresh@bcu.ac.in', '+91 98440 11985', 'DEPT-MECH', 'Renewable Energy & Mechatronics', 'Ph.D (IIT Bombay)', '2018-09-01')
ON CONFLICT (faculty_id) DO NOTHING;

-- 5. Courses
INSERT INTO courses (
  course_id, title, credits, duration, department_id, annual_fee, intake_capacity
) VALUES
('CRS-CS101', 'M.Tech in Artificial Intelligence & Machine Learning', 72, '4 Semesters (2 Years)', 'DEPT-CSE', 45000, 60),
('CRS-CS102', 'Master of Computer Applications (MCA)', 84, '4 Semesters (2 Years)', 'DEPT-CSE', 38000, 120),
('CRS-EC201', 'M.Tech in VLSI Design & Embedded Systems', 70, '4 Semesters (2 Years)', 'DEPT-ECE', 42000, 45),
('CRS-CM301', 'Master of Commerce (M.Com - Financial Analysis)', 68, '4 Semesters (2 Years)', 'DEPT-COMM', 28000, 150),
('CRS-BT401', 'M.Sc in Biotechnology & Computational Biology', 76, '4 Semesters (2 Years)', 'DEPT-BIO', 35000, 40),
('CRS-ME501', 'M.Tech in Robotics & Smart Manufacturing', 72, '4 Semesters (2 Years)', 'DEPT-MECH', 44000, 50)
ON CONFLICT (course_id) DO NOTHING;

-- 6. Students
INSERT INTO students (
  student_id, name, email, phone, enrollment_no, department_id, category, annual_family_income, bank_account, bank_ifsc, attendance_rate, cgpa
) VALUES
('STU-2024-001', 'Kavya Ramesh Patil', 'kavya.patil@bcu.student.in', '+91 89712 44321', 'BCU2024CS089', 'DEPT-CSE', 'OBC-2A', 140000, '•••• •••• 4421', 'SBIN0040120', 94.5, 8.85),
('STU-2024-002', 'Mohammed Zeeshan', 'zeeshan.m@bcu.student.in', '+91 97412 88910', 'BCU2024CS112', 'DEPT-CSE', 'Minority', 180000, '•••• •••• 6712', 'CNRB0002140', 89.2, 8.42),
('STU-2024-003', 'Sneha Basavaraj Gowda', 'sneha.gowda@bcu.student.in', '+91 98450 67123', 'BCU2024EC045', 'DEPT-ECE', 'General-EWS', 210000, '•••• •••• 9923', 'UBIN0532109', 96.0, 9.12),
('STU-2024-004', 'Praveen Kumar Nayak', 'praveen.nayak@bcu.student.in', '+91 91480 33451', 'BCU2024CM078', 'DEPT-COMM', 'SC', 95000, '•••• •••• 1150', 'BARB0BANGAL', 91.8, 8.10),
('STU-2024-005', 'Ananya Divakar Bhat', 'ananya.bhat@bcu.student.in', '+91 88841 55219', 'BCU2024BT019', 'DEPT-BIO', 'General', 380000, '•••• •••• 7734', 'KARB0000101', 93.4, 8.78),
('STU-2024-006', 'Rohit Sharanappa Rathod', 'rohit.rathod@bcu.student.in', '+91 94498 77651', 'BCU2024ME034', 'DEPT-MECH', 'ST', 88000, '•••• •••• 3318', 'ICIC0000012', 88.0, 7.95)
ON CONFLICT (student_id) DO NOTHING;

-- 7. Registrations
INSERT INTO registrations (
  reg_id, student_id, course_id, sem, academic_year, status, date
) VALUES
('REG-2024-01', 'STU-2024-001', 'CRS-CS101', 'Sem 3', '2024-25', 'Active', '2024-07-15'),
('REG-2024-02', 'STU-2024-002', 'CRS-CS102', 'Sem 3', '2024-25', 'Active', '2024-07-18'),
('REG-2024-03', 'STU-2024-003', 'CRS-EC201', 'Sem 3', '2024-25', 'Active', '2024-07-20'),
('REG-2024-04', 'STU-2024-004', 'CRS-CM301', 'Sem 1', '2024-25', 'Active', '2024-08-01'),
('REG-2024-05', 'STU-2024-005', 'CRS-BT401', 'Sem 3', '2024-25', 'Active', '2024-07-14'),
('REG-2024-06', 'STU-2024-006', 'CRS-ME501', 'Sem 1', '2024-25', 'Active', '2024-08-05')
ON CONFLICT (reg_id) DO NOTHING;

-- 8. Schemes
INSERT INTO schemes (
  scheme_id, name, code, description, eligibility_criteria, max_amount, total_grant_pool, disbursed_so_far, funding_agency, min_attendance, max_income_ceiling, is_active
) VALUES
('SCH-PMS-01', 'Post-Matric Scholarship for SC/ST Students', 'GOK-PMS', 'Centrally sponsored fee concession and maintenance stipend for SC/ST students.', 'SC/ST category with annual family income below ₹2,50,000 and minimum 75% attendance.', 50000, 120000000, 89400000, 'Govt of Karnataka & Ministry of Social Justice', 75.0, 250000, TRUE),
('SCH-VDS-02', 'Vidya Siri (Food & Accommodation Assistance)', 'GOK-VDS', 'Financial stipend for OBC/Minority post-matric students living outside hostels.', 'Category 1, 2A, 2B, 3A, 3B students with family income < ₹2.5L.', 18000, 65000000, 48500000, 'Backward Classes Welfare Department', 75.0, 250000, TRUE),
('SCH-KIRG-03', 'Karnataka Innovation & Research Fellowship (KIRG)', 'K-TECH-IRG', 'Research seed money grant awarded to PG students and research scholars in deep tech.', 'PG final year or PhD scholar with approved research proposal.', 150000, 80000000, 51200000, 'Dept of IT, BT and S&T, Govt of Karnataka', 80.0, 600000, TRUE),
('SCH-EWS-04', 'Economically Weaker Section Merit Fee Waiver', 'GOK-EWS-MW', 'Merit-cum-means tuition reimbursement for general category students under ₹2L income.', 'General category, family income below ₹2,00,000, CGPA >= 8.0.', 35000, 40000000, 27800000, 'Department of Collegiate & Technical Education', 80.0, 200000, TRUE),
('SCH-LAB-05', 'Laboratory Modernization & Equipment Grant', 'GOK-LAB-MOD', 'Institutional grant allocated to STEM departments for equipment.', 'Approved department research proposal by Finance Committee.', 5000000, 250000000, 182000000, 'RUSA & State Govt', 0.0, 0, TRUE)
ON CONFLICT (scheme_id) DO NOTHING;

-- 9. Validators
INSERT INTO validators (
  validator_id, name, role, email, assigned_count, verified_count, accuracy_rating
) VALUES
('VAL-001', 'Dr. R. Manjunath', 'Finance Officer & Lead Auditor', 'fo.manjunath@bcu.ac.in', 342, 318, '99.2%'),
('VAL-002', 'Smt. Shailaja K. S.', 'Assistant Registrar (Scholarships)', 'ar.scholarships@bcu.ac.in', 410, 385, '98.7%'),
('VAL-003', 'Sri C. H. Lingamurthy', 'Internal Audit Officer', 'audit.lingamurthy@bcu.ac.in', 275, 260, '99.5%')
ON CONFLICT (validator_id) DO NOTHING;

-- 10. Applications
INSERT INTO applications (
  app_id, student_id, scheme_id, application_date, amount_requested, status, ai_validation_status, ai_risk_score, ai_flags, validator_id, verified_date, remarks
) VALUES
('APP-2024-0891', 'STU-2024-001', 'SCH-VDS-02', '2024-08-12', 18000, 'Approved', 'Verified', 4, '[]', 'VAL-002', '2024-08-14', 'Income certificate verified via Karnataka Nadakacheri API. Attendance 94.5%.'),
('APP-2024-0892', 'STU-2024-004', 'SCH-PMS-01', '2024-08-14', 38000, 'Approved', 'Verified', 6, '[]', 'VAL-001', '2024-08-16', 'Caste & Income verified with Seva Sindhu. Bank Aadhaar-seeded.'),
('APP-2024-0893', 'STU-2024-003', 'SCH-EWS-04', '2024-08-20', 35000, 'Under Review', 'Flagged', 62, '["Income certificate expiration date within 30 days", "Minor address variation"]', 'VAL-002', null, 'Requires re-upload of latest income verification slip.'),
('APP-2024-0894', 'STU-2024-002', 'SCH-KIRG-03', '2024-08-25', 120000, 'AI Validated', 'Verified', 12, '[]', 'VAL-001', '2024-08-27', 'Project supervisor endorsement verified. Research synopsis scored 88/100.'),
('APP-2024-0895', 'STU-2024-006', 'SCH-PMS-01', '2024-09-02', 44000, 'Submitted', 'In Progress', 22, '["Bank account name has spelling variation: Rohit S Rathod"]', 'VAL-003', null, 'Aadhaar fuzzy match 91%. Awaiting auditor clearance.'),
('APP-2024-0896', 'STU-2024-005', 'SCH-EWS-04', '2024-09-08', 35000, 'Rejected', 'Rejected by AI', 88, '["Reported family income exceeds scheme ceiling of ₹2,00,000 (Calculated: ₹3,80,000)"]', 'VAL-001', '2024-09-10', 'Ineligible due to family income criteria as per Department guidelines.')
ON CONFLICT (app_id) DO NOTHING;

-- 11. Disbursements
INSERT INTO disbursements (
  disbursement_id, application_id, amount, date, mode, status, utr_number, bank_account, pfms_batch_id, reconciliation_status
) VALUES
('DISB-2024-501', 'APP-2024-0891', 18000, '2024-08-28', 'DBT - Aadhaar Payment Bridge (APB)', 'Completed', 'SBIN824009812401', '•••• •••• 4421 (SBI)', 'PFMS-GOK-2024-091', 'Reconciled'),
('DISB-2024-502', 'APP-2024-0892', 38000, '2024-09-05', 'PFMS - Direct Beneficiary', 'Completed', 'BARB924008123991', '•••• •••• 1150 (BoB)', 'PFMS-GOK-2024-098', 'Reconciled'),
('DISB-2024-503', 'APP-2024-0894', 60000, '2024-09-20', 'RTGS Institutional Escrow', 'Completed', 'CNRB724001928374', '•••• •••• 6712 (Canara Bank)', 'PFMS-GOK-2024-110', 'Reconciled')
ON CONFLICT (disbursement_id) DO NOTHING;

-- 12. AI Models
INSERT INTO ai_models (
  model_id, name, version, accuracy, description, last_trained, active_in_production, rules_applied, false_positive_rate
) VALUES
('MDL-FIN-01', 'FinShield Neural Auditor', 'v3.2.4', '99.1%', 'Deep anomaly detection engine analyzing bank statement line items and velocity checks.', '2024-09-15', TRUE, 48, '0.4%'),
('MDL-SCH-02', 'ScholarCheck Fraud & Duplicate Sentinel', 'v2.8.1', '98.6%', 'Cross-scheme identity deduplication, Nadakacheri income validation OCR, and Aadhaar biometric token hash verification.', '2024-10-02', TRUE, 36, '0.7%'),
('MDL-RECON-03', 'BankRecon NLP Parser & Ledger Matcher', 'v4.0.0', '99.8%', 'Multilingual OCR and tabular NLP parser extracting standard statement schemas from 40+ Indian banking formats (PDF/CSV/XLSX).', '2024-10-08', TRUE, 62, '0.2%')
ON CONFLICT (model_id) DO NOTHING;

-- 13. Bank Accounts (Matching all 18 accounts from the screenshot)
INSERT INTO bank_accounts (
  id, university_id, bank_name, bank_code, account_number, account_type, branch, ifsc, current_balance, total_debits, total_credits, is_active
) VALUES
(1, 'UNIV-01', 'State Bank of India', 'SBI', '•••• •••• 8913', 'General', 'Bengaluru Main Branch, KG Road', 'SBIN0040120', 48920500, 14230000, 32500000, TRUE),
(2, 'UNIV-01', 'Canara Bank', 'CANARA', '•••• •••• 4321', 'Salary', 'Town Hall Branch, JC Road', 'CNRB0000421', 18240000, 38400000, 41000000, TRUE),
(3, 'UNIV-01', 'Union Bank of India', 'UBI', '•••• •••• 7789', 'Grant', 'Gandhinagar Branch', 'UBIN0530123', 64100000, 8500000, 45000000, TRUE),
(4, 'UNIV-01', 'Bank of Baroda', 'BOB', '•••• •••• 9012', 'Project', 'Malleshwaram 8th Cross', 'BARB0MALLES', 22350000, 4120000, 12000000, TRUE),
(5, 'UNIV-01', 'ICICI Bank', 'ICICI', '•••• •••• 3456', 'General', 'MG Road Commercial Branch', 'ICIC0000002', 31500000, 9800000, 15400000, TRUE),
(6, 'UNIV-01', 'Karnataka Bank', 'KTK', '•••• •••• 6678', 'Student Fee', 'Basavanagudi Branch', 'KARB0000050', 55400000, 1200000, 38900000, TRUE),
(7, 'UNIV-01', 'Axis Bank', 'AXIS', '•••• •••• 1122', 'Research', 'Rajajinagar 1st Block', 'UTIB0000045', 14800000, 0, 0, TRUE),
(8, 'UNIV-01', 'Indian Bank', 'INDIAN', '•••• •••• 3344', 'General', 'Shivajinagar Branch', 'IDIB000S012', 19700000, 4500000, 8900000, TRUE),
(9, 'UNIV-01', 'Central Bank of India', 'CBI', '•••• •••• 5588', 'Infrastructure', 'Kempegowda Road', 'CBIN0280101', 82100000, 19800000, 52000000, TRUE),
(10, 'UNIV-01', 'Punjab National Bank', 'PNB', '•••• •••• 8899', 'General', 'Infantry Road Branch', 'PUNB0012000', 16400000, 3100000, 6400000, TRUE),
(11, 'UNIV-01', 'HDFC Bank', 'HDFC', '•••• •••• 2468', 'Endowments', 'Koramangala 5th Block', 'HDFC0000053', 39500000, 800000, 12500000, TRUE),
(12, 'UNIV-01', 'Kotak Mahindra Bank', 'KOTAK', '•••• •••• 1357', 'Alumni Fund', 'Indiranagar 100ft Road', 'KKBK0000422', 12800000, 450000, 3200000, TRUE),
(13, 'UNIV-01', 'IDBI Bank', 'IDBI', '•••• •••• 9876', 'Project', 'Mission Road Branch', 'IBKL0000010', 17300000, 2900000, 7800000, TRUE),
(14, 'UNIV-01', 'Bank of India', 'BOI', '•••• •••• 5432', 'Exam Cell', 'Jayanagar 4th Block', 'BKID0008401', 24100000, 6400000, 14200000, TRUE),
(15, 'UNIV-01', 'UCO Bank', 'UCO', '•••• •••• 6543', 'Pension Fund', 'Gandhinagar Main', 'UCBA0000021', 41200000, 18400000, 22000000, TRUE),
(16, 'UNIV-01', 'Indian Overseas Bank', 'IOB', '•••• •••• 7654', 'Hostel Fee', 'Victoria Hospital Ext', 'IOBA0000145', 15900000, 4100000, 9800000, TRUE),
(17, 'UNIV-01', 'IndusInd Bank', 'INDUS', '•••• •••• 8765', 'Special Grant', 'Cunningham Road', 'INDB0000008', 28400000, 3200000, 16500000, TRUE),
(18, 'UNIV-01', 'Federal Bank', 'FED', '•••• •••• 9811', 'Corporate CSR', 'Richmond Town Branch', 'FDRL0001244', 11600000, 1100000, 5400000, TRUE)
ON CONFLICT (id) DO UPDATE SET
  bank_name = EXCLUDED.bank_name,
  current_balance = EXCLUDED.current_balance;

SELECT setval('bank_accounts_id_seq', (SELECT MAX(id) FROM bank_accounts));

-- 14. Bank Statements (Initial statements matching screenshot state: 16 Uploaded, 1 Processing, 1 Pending)
INSERT INTO bank_statements (
  id, account_id, financial_year, quarter, file_name, original_filename, file_path, file_size, file_hash, mime_type, upload_status, ai_status, parsed_transactions_count, opening_balance, closing_balance, calculated_balance, balance_mismatch, anomalies_detected, uploaded_by, uploaded_at, is_submitted_for_review
) VALUES
(1, 1, '2024-25', 'Q2 (Jul - Sep)', 'SBI_General_A8913_Q2_2024.pdf', 'SBI_General_A8913_Q2_2024.pdf', 'uploads/sbi_stmt_8913.pdf', 2936012, 'hash_sbi_8913', 'application/pdf', 'Uploaded', 'Completed', 142, 30650500, 48920500, 48920500, 0, 0, 'Dr. R. Manjunath', '12-Oct-2024, 10:24 AM', FALSE),
(2, 2, '2024-25', 'Q2 (Jul - Sep)', 'Canara_Salary_A4321_Q2.xlsx', 'Canara_Salary_A4321_Q2.xlsx', 'uploads/canara_stmt_4321.xlsx', 1468006, 'hash_canara_4321', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 218, 15640000, 18240000, 18240000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 04:15 PM', FALSE),
(3, 3, '2024-25', 'Q2 (Jul - Sep)', 'UnionBank_Grant_A7789_Q2.pdf', 'UnionBank_Grant_A7789_Q2.pdf', 'uploads/union_stmt_7789.pdf', 3250585, 'hash_ubi_7789', 'application/pdf', 'Uploaded', 'Completed', 84, 27600000, 64100000, 64100000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 02:30 PM', FALSE),
(4, 4, '2024-25', 'Q2 (Jul - Sep)', 'BOB_Project_A9012_Q2.csv', 'BOB_Project_A9012_Q2.csv', 'uploads/bob_stmt_9012.csv', 972800, 'hash_bob_9012', 'text/csv', 'Processing', 'In Progress', 67, 14470000, 22350000, 22350000, 0, 1, 'Dr. R. Manjunath', '14-Oct-2024, 11:05 AM', FALSE),
(5, 5, '2024-25', 'Q2 (Jul - Sep)', 'ICICI_General_A3456_Q2.pdf', 'ICICI_General_A3456_Q2.pdf', 'uploads/icici_stmt_3456.pdf', 1992294, 'hash_icici_3456', 'application/pdf', 'Uploaded', 'Completed', 112, 25900000, 31500000, 31500000, 0, 0, 'Dr. R. Manjunath', '09-Oct-2024, 01:20 PM', FALSE),
(6, 6, '2024-25', 'Q2 (Jul - Sep)', 'KTK_StudentFee_A6678_Q2.xlsx', 'KTK_StudentFee_A6678_Q2.xlsx', 'uploads/ktk_stmt_6678.xlsx', 4299161, 'hash_ktk_6678', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 420, 17700000, 55400000, 55400000, 0, 0, 'Dr. R. Manjunath', '08-Oct-2024, 09:45 AM', FALSE),
(8, 8, '2024-25', 'Q2 (Jul - Sep)', 'IndianBank_Gen_A3344_Q2.pdf', 'IndianBank_Gen_A3344_Q2.pdf', 'uploads/indian_stmt_3344.pdf', 2202009, 'hash_indian_3344', 'application/pdf', 'Uploaded', 'Completed', 98, 15300000, 19700000, 19700000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 03:10 PM', FALSE),
(9, 9, '2024-25', 'Q2 (Jul - Sep)', 'CentralBank_Infra_A5588_Q2.pdf', 'CentralBank_Infra_A5588_Q2.pdf', 'uploads/cbi_stmt_5588.pdf', 3879731, 'hash_cbi_5588', 'application/pdf', 'Uploaded', 'Completed', 73, 49900000, 82100000, 82100000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 12:05 PM', FALSE),
(10, 10, '2024-25', 'Q2 (Jul - Sep)', 'PNB_General_A8899_Q2.pdf', 'PNB_General_A8899_Q2.pdf', 'uploads/pnb_stmt_8899.pdf', 1677721, 'hash_pnb_8899', 'application/pdf', 'Uploaded', 'Completed', 65, 13100000, 16400000, 16400000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 11:50 AM', FALSE),
(11, 11, '2024-25', 'Q2 (Jul - Sep)', 'HDFC_Endowment_A2468_Q2.pdf', 'HDFC_Endowment_A2468_Q2.pdf', 'uploads/hdfc_stmt_2468.pdf', 1887436, 'hash_hdfc_2468', 'application/pdf', 'Uploaded', 'Completed', 44, 27800000, 39500000, 39500000, 0, 0, 'Dr. R. Manjunath', '07-Oct-2024, 05:20 PM', FALSE),
(12, 12, '2024-25', 'Q2 (Jul - Sep)', 'Kotak_Alumni_A1357_Q2.xlsx', 'Kotak_Alumni_A1357_Q2.xlsx', 'uploads/kotak_stmt_1357.xlsx', 859770, 'hash_kotak_1357', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 38, 10050000, 12800000, 12800000, 0, 0, 'Dr. R. Manjunath', '08-Oct-2024, 02:40 PM', FALSE),
(13, 13, '2024-25', 'Q2 (Jul - Sep)', 'IDBI_Project_A9876_Q2.pdf', 'IDBI_Project_A9876_Q2.pdf', 'uploads/idbi_stmt_9876.pdf', 2411724, 'hash_idbi_9876', 'application/pdf', 'Uploaded', 'Completed', 53, 12400000, 17300000, 17300000, 0, 0, 'Dr. R. Manjunath', '09-Oct-2024, 11:15 AM', FALSE),
(14, 14, '2024-25', 'Q2 (Jul - Sep)', 'BOI_Exam_A5432_Q2.pdf', 'BOI_Exam_A5432_Q2.pdf', 'uploads/boi_stmt_5432.pdf', 1992294, 'hash_boi_5432', 'application/pdf', 'Uploaded', 'Completed', 129, 16300000, 24100000, 24100000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 04:35 PM', FALSE),
(15, 15, '2024-25', 'Q2 (Jul - Sep)', 'UCO_Pension_A6543_Q2.pdf', 'UCO_Pension_A6543_Q2.pdf', 'uploads/uco_stmt_6543.pdf', 2516582, 'hash_uco_6543', 'application/pdf', 'Uploaded', 'Completed', 186, 37600000, 41200000, 41200000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 09:10 AM', FALSE),
(16, 16, '2024-25', 'Q2 (Jul - Sep)', 'IOB_Hostel_A7654_Q2.pdf', 'IOB_Hostel_A7654_Q2.pdf', 'uploads/iob_stmt_7654.pdf', 1572864, 'hash_iob_7654', 'application/pdf', 'Uploaded', 'Completed', 110, 10200000, 15900000, 15900000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 03:50 PM', FALSE),
(17, 17, '2024-25', 'Q2 (Jul - Sep)', 'IndusInd_Special_A8765_Q2.pdf', 'IndusInd_Special_A8765_Q2.pdf', 'uploads/indus_stmt_8765.pdf', 2097152, 'hash_indus_8765', 'application/pdf', 'Uploaded', 'Completed', 59, 15100000, 28400000, 28400000, 0, 0, 'Dr. R. Manjunath', '12-Oct-2024, 01:10 PM', FALSE),
(18, 18, '2024-25', 'Q2 (Jul - Sep)', 'Federal_CSR_A9811_Q2.xlsx', 'Federal_CSR_A9811_Q2.xlsx', 'uploads/fed_stmt_9811.xlsx', 1153433, 'hash_fed_9811', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 36, 7300000, 11600000, 11600000, 0, 0, 'Dr. R. Manjunath', '12-Oct-2024, 04:00 PM', FALSE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('bank_statements_id_seq', (SELECT MAX(id) FROM bank_statements));

-- 15. Statement Transactions
INSERT INTO statement_transactions (
  statement_id, account_id, txn_id, txn_date, description, reference_no, type, amount, balance, ai_category, ai_flag, confidence, is_reconciled, reconciled_with_type, reconciled_with_id
) VALUES
(1, 1, 'TXN-9021', '2024-09-28', 'RTGS-NEFT CR: GOVT OF KARNATAKA SCHOLARSHIP FUND', 'GOK-DBT-9281726', 'Credit', 15000000, 48920500, 'Government Grant', 'Verified', '99.8%', TRUE, 'Grant', 'SCH-PMS-01'),
(1, 1, 'TXN-9020', '2024-09-25', 'DIRECT DEBIT: BULK DBT SCHOLARSHIP DISBURSEMENT BATCH #44', 'BCU-DBT-DISB-44', 'Debit', 2450000, 33920500, 'Direct Benefit Transfer', 'Verified', '99.6%', TRUE, 'Disbursement', 'DISB-2024-501'),
(1, 1, 'TXN-9019', '2024-09-21', 'CHQ CLG: KSTDC BUS CHARGES FOR STUDENT FIELD EXCURSION', 'CHQ-0021489', 'Debit', 185000, 36370500, 'Student Welfare', 'Verified', '98.9%', FALSE, null, null),
(1, 1, 'TXN-9018', '2024-09-18', 'INTEREST CREDIT: AUTO-SWEEP MOD LIQUIDITY INTEREST', 'INT-Q2-AUTO', 'Credit', 324500, 36555500, 'Bank Interest', 'Verified', '100%', FALSE, null, null),
(1, 1, 'TXN-9017', '2024-09-15', 'NEFT DR: LABTRONICS COMPUTING EQUIPMENT PO #8821', 'CMS-NEFT-88219', 'Debit', 3450000, 36231000, 'Equipment & Infra', 'Verified', '99.2%', FALSE, null, null),
(1, 1, 'TXN-9016', '2024-09-10', 'REFUND / ADJUSTMENT: CANCELLED ADMISSION FEE RETURN', 'REV-ADM-004', 'Debit', 45000, 39681000, 'Student Refund', 'Verified', '99.4%', FALSE, null, null);

-- 16. Reports
INSERT INTO reports (
  report_id, title, type, university_id, financial_year, quarter, generated_date, file_path, model_id, file_size, status
) VALUES
('REP-2024-Q1-RECON', 'Consolidated Bank Reconciliation Statement (Q1 FY24-25)', 'Reconciliation', 'UNIV-01', '2024-25', 'Q1 (Apr - Jun)', '2024-07-25 16:40', '/reports/Q1_Bank_Recon_2024_25.pdf', 'MDL-RECON-03', '3.4 MB', 'Audited & Signed'),
('REP-2024-SCHEME-AUDIT', 'AI Anomaly Audit for Post-Matric & Vidya Siri Schemes', 'AI Audit', 'UNIV-01', '2024-25', 'Q2 (Jul - Sep)', '2024-09-30 11:15', '/reports/AI_Scheme_Audit_Sep2024.pdf', 'MDL-SCH-02', '1.8 MB', 'Published to Dept'),
('REP-2024-UC-RUSA', 'RUSA Infrastructure Grant Utilization Certificate (Form GFR-12A)', 'Utilization Certificate', 'UNIV-01', '2024-25', 'Q2 (Jul - Sep)', '2024-10-05 14:20', '/reports/RUSA_UC_Oct2024.pdf', 'MDL-FIN-01', '2.1 MB', 'Submitted to Ministry'),
('REP-2024-Q2-DRAFT', 'Interim Quarterly Fund Utilization & Disbursement Tracker (Q2 FY24-25)', 'Financial Analysis', 'UNIV-01', '2024-25', 'Q2 (Jul - Sep)', '2024-10-14 09:30', '/reports/Interim_Q2_Fund_Util_2024.pdf', 'MDL-FIN-01', '4.2 MB', 'Draft (Auto-generated)')
ON CONFLICT (report_id) DO NOTHING;

-- 17. AI Anomalies
INSERT INTO ai_anomalies (
  anomaly_code, type, severity, entity_type, entity_id, title, details, confidence, status
) VALUES
('ANOM-01', 'Income Ceiling Breach', 'High', 'Application', 'APP-2024-0896', 'Excess Income for EWS Waiver', 'Nadakacheri income certificate reports ₹3,80,000, surpassing the EWS threshold of ₹2,00,000.', 0.99, 'Resolved'),
('ANOM-02', 'Duplicate Bank Account Registration', 'Medium', 'Student', 'STU-2024-002', 'Concurrent Portal Registrations', 'Account •••• 6712 registered simultaneously in two state scholarship portals (SSP & Vidyasiri).', 0.92, 'Auditor Reviewed'),
('ANOM-03', 'Unreconciled Bank Debit Velocity', 'High', 'Bank Statement', '4', 'Potential Split Procurement', 'Three consecutive debits under ₹50,000 within 4 hours flagged as potential split procurement.', 0.88, 'Under Review'),
('ANOM-04', 'Attendance Threshold Gap', 'Low', 'Application', 'APP-2024-0895', 'Marginal Attendance Deficit', 'Attendance in 2 modules marginally at 74.8% (Minimum standard rule: 75.0%).', 0.94, 'Open')
ON CONFLICT (anomaly_code) DO NOTHING;

-- 18. Audit Logs
INSERT INTO audit_logs (
  user_id, user_name, role, action, entity_type, entity_id, details, ip_address, timestamp
) VALUES
('USR-02', 'Dr. R. Manjunath', 'Finance Officer', 'SUPABASE_CLOUD_INITIALIZATION', 'Database', 'ALL', 'Supabase Cloud PostgreSQL database schema created and initial records seeded', '127.0.0.1', NOW());
