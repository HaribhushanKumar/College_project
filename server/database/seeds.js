import bcrypt from 'bcryptjs';
import db from '../config/database.js';

export function seedDatabase() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Password@123', salt);

  // Use a transaction for fast & consistent seeding
  const seedTx = db.transaction(() => {
    // 1. Universities
    const insertUniv = db.prepare(`
      INSERT OR IGNORE INTO universities (
        university_id, name, short_code, location, type, email, contact_no, established, vice_chancellor, finance_officer, total_budget, allocated_funds, utilized_funds
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUniv.run('UNIV-01', 'Bengaluru City University', 'BCU', 'Central College Campus, Bengaluru, Karnataka', 'State Public University', 'finance@bcu.ac.in', '+91 80 2296 1003', 2017, 'Prof. Lingaraja Gandhi', 'Dr. R. Manjunath', 1450000000, 1120000000, 985000000);
    insertUniv.run('UNIV-02', 'Visvesvaraya Technological University', 'VTU', 'Jnana Sangama, Belagavi, Karnataka', 'State Technological University', 'finance@vtu.ac.in', '+91 831 249 8100', 1998, 'Prof. S. Vidyashankar', 'Dr. M. A. Venkatesh', 2800000000, 2350000000, 1940000000);
    insertUniv.run('UNIV-03', 'University of Mysore', 'UOM', 'Crawford Hall, Mysuru, Karnataka', 'State Public University', 'fo@uni-mysore.ac.in', '+91 821 241 9301', 1916, 'Prof. N. K. Lokanath', 'Dr. Sangeetha K.', 2100000000, 1780000000, 1620000000);
    insertUniv.run('UNIV-04', 'Karnatak University Dharwad', 'KUD', 'Pavate Nagar, Dharwad, Karnataka', 'State Public University', 'finance@kud.ac.in', '+91 836 221 5250', 1949, 'Prof. K. B. Gudasi', 'Dr. Ramesh Babu', 1650000000, 1390000000, 1210000000);

    // 2. Users (Role-based access control accounts)
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (
        user_id, username, email, password_hash, full_name, role, university_id, department_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('USR-01', 'superadmin', 'admin@highered.karnataka.gov.in', defaultPasswordHash, 'Principal Secretary (Higher Education)', 'Super Admin', null, null, 1);
    insertUser.run('USR-02', 'manjunath', 'fo.manjunath@bcu.ac.in', defaultPasswordHash, 'Dr. R. Manjunath', 'Finance Officer', 'UNIV-01', null, 1);
    insertUser.run('USR-03', 'bcu_admin', 'registrar@bcu.ac.in', defaultPasswordHash, 'Registrar BCU', 'University Admin', 'UNIV-01', null, 1);
    insertUser.run('USR-04', 'validator_shailaja', 'ar.scholarships@bcu.ac.in', defaultPasswordHash, 'Smt. Shailaja K. S.', 'Validator', 'UNIV-01', null, 1);
    insertUser.run('USR-05', 'auditor_cag', 'auditor@cag.gov.in', defaultPasswordHash, 'Sri Anand Deshmukh (CAG Auditor)', 'Read-Only Auditor', 'UNIV-01', null, 1);

    // 3. Departments
    const insertDept = db.prepare(`
      INSERT OR IGNORE INTO departments (
        dept_id, name, code, description, head_name, university_id, budget_allocated, budget_utilized, faculty_count, student_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDept.run('DEPT-CSE', 'Computer Science & Engineering', 'CSE', 'AI, ML, Cybersecurity and Systems', 'Dr. Anitha S. Murthy', 'UNIV-01', 42000000, 36500000, 24, 580);
    insertDept.run('DEPT-ECE', 'Electronics & Communication', 'ECE', 'VLSI Design, Embedded Systems and Signal Processing', 'Dr. Ravindra Kumar', 'UNIV-01', 38000000, 31200000, 20, 490);
    insertDept.run('DEPT-COMM', 'Commerce & Financial Studies', 'COMM', 'Public Finance, Auditing and Corporate Taxation', 'Dr. M. S. Ramachandra', 'UNIV-01', 28000000, 24900000, 18, 720);
    insertDept.run('DEPT-BIO', 'Biotechnology & Bioinformatics', 'BIO', 'Genomics, Molecular Diagnostics and Bioprocesses', 'Dr. Poornima Hegde', 'UNIV-01', 35000000, 30800000, 16, 310);
    insertDept.run('DEPT-PHYS', 'Physics & Material Science', 'PHYS', 'Semiconductors, Quantum Devices and Nanotech', 'Dr. K. N. Chandrashekar', 'UNIV-01', 25000000, 21400000, 14, 260);
    insertDept.run('DEPT-MECH', 'Mechanical & Automation Engineering', 'MECH', 'Robotics, Additive Manufacturing and Propulsion', 'Dr. B. V. Suresh', 'UNIV-01', 32000000, 28100000, 19, 420);

    // 4. Faculty
    const insertFac = db.prepare(`
      INSERT OR IGNORE INTO faculty (
        faculty_id, name, designation, email, phone, department_id, specialization, qualification, joining_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertFac.run('FAC-101', 'Dr. Anitha S. Murthy', 'Professor & HOD', 'anitha.murthy@bcu.ac.in', '+91 98451 22340', 'DEPT-CSE', 'Artificial Intelligence & Distributed Systems', 'Ph.D (IISc Bangalore)', '2018-06-15');
    insertFac.run('FAC-102', 'Dr. P. Venugopal Rao', 'Associate Professor', 'venu.rao@bcu.ac.in', '+91 94480 34125', 'DEPT-CSE', 'Cybersecurity & Blockchain', 'Ph.D (NIT Surathkal)', '2019-08-01');
    insertFac.run('FAC-103', 'Dr. Ravindra Kumar', 'Professor & HOD', 'ravindra.k@bcu.ac.in', '+91 98802 77190', 'DEPT-ECE', 'VLSI Design & Embedded Systems', 'Ph.D (IIT Madras)', '2018-07-10');
    insertFac.run('FAC-104', 'Dr. M. S. Ramachandra', 'Professor & Dean', 'ms.ramachandra@bcu.ac.in', '+91 97411 90812', 'DEPT-COMM', 'Public Finance & Corporate Governance', 'Ph.D (Bangalore University)', '2017-11-20');
    insertFac.run('FAC-105', 'Dr. Poornima Hegde', 'Associate Professor & HOD', 'poornima.hegde@bcu.ac.in', '+91 94812 66334', 'DEPT-BIO', 'Bio-pharmaceuticals & Genomics', 'Ph.D (Manipal Academy)', '2020-01-15');
    insertFac.run('FAC-106', 'Dr. B. V. Suresh', 'Professor & HOD', 'bv.suresh@bcu.ac.in', '+91 98440 11985', 'DEPT-MECH', 'Renewable Energy & Mechatronics', 'Ph.D (IIT Bombay)', '2018-09-01');

    // 5. Courses
    const insertCourse = db.prepare(`
      INSERT OR IGNORE INTO courses (
        course_id, title, credits, duration, department_id, annual_fee, intake_capacity
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertCourse.run('CRS-CS101', 'M.Tech in Artificial Intelligence & Machine Learning', 72, '4 Semesters (2 Years)', 'DEPT-CSE', 45000, 60);
    insertCourse.run('CRS-CS102', 'Master of Computer Applications (MCA)', 84, '4 Semesters (2 Years)', 'DEPT-CSE', 38000, 120);
    insertCourse.run('CRS-EC201', 'M.Tech in VLSI Design & Embedded Systems', 70, '4 Semesters (2 Years)', 'DEPT-ECE', 42000, 45);
    insertCourse.run('CRS-CM301', 'Master of Commerce (M.Com - Financial Analysis)', 68, '4 Semesters (2 Years)', 'DEPT-COMM', 28000, 150);
    insertCourse.run('CRS-BT401', 'M.Sc in Biotechnology & Computational Biology', 76, '4 Semesters (2 Years)', 'DEPT-BIO', 35000, 40);
    insertCourse.run('CRS-ME501', 'M.Tech in Robotics & Smart Manufacturing', 72, '4 Semesters (2 Years)', 'DEPT-MECH', 44000, 50);

    // 6. Students
    const insertStudent = db.prepare(`
      INSERT OR IGNORE INTO students (
        student_id, name, email, phone, enrollment_no, department_id, category, annual_family_income, bank_account, bank_ifsc, attendance_rate, cgpa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStudent.run('STU-2024-001', 'Kavya Ramesh Patil', 'kavya.patil@bcu.student.in', '+91 89712 44321', 'BCU2024CS089', 'DEPT-CSE', 'OBC-2A', 140000, '•••• •••• 4421', 'SBIN0040120', 94.5, 8.85);
    insertStudent.run('STU-2024-002', 'Mohammed Zeeshan', 'zeeshan.m@bcu.student.in', '+91 97412 88910', 'BCU2024CS112', 'DEPT-CSE', 'Minority', 180000, '•••• •••• 6712', 'CNRB0002140', 89.2, 8.42);
    insertStudent.run('STU-2024-003', 'Sneha Basavaraj Gowda', 'sneha.gowda@bcu.student.in', '+91 98450 67123', 'BCU2024EC045', 'DEPT-ECE', 'General-EWS', 210000, '•••• •••• 9923', 'UBIN0532109', 96.0, 9.12);
    insertStudent.run('STU-2024-004', 'Praveen Kumar Nayak', 'praveen.nayak@bcu.student.in', '+91 91480 33451', 'BCU2024CM078', 'DEPT-COMM', 'SC', 95000, '•••• •••• 1150', 'BARB0BANGAL', 91.8, 8.10);
    insertStudent.run('STU-2024-005', 'Ananya Divakar Bhat', 'ananya.bhat@bcu.student.in', '+91 88841 55219', 'BCU2024BT019', 'DEPT-BIO', 'General', 380000, '•••• •••• 7734', 'KARB0000101', 93.4, 8.78);
    insertStudent.run('STU-2024-006', 'Rohit Sharanappa Rathod', 'rohit.rathod@bcu.student.in', '+91 94498 77651', 'BCU2024ME034', 'DEPT-MECH', 'ST', 88000, '•••• •••• 3318', 'ICIC0000012', 88.0, 7.95);

    // 7. Registrations
    const insertReg = db.prepare(`
      INSERT OR IGNORE INTO registrations (
        reg_id, student_id, course_id, sem, academic_year, status, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertReg.run('REG-2024-01', 'STU-2024-001', 'CRS-CS101', 'Sem 3', '2024-25', 'Active', '2024-07-15');
    insertReg.run('REG-2024-02', 'STU-2024-002', 'CRS-CS102', 'Sem 3', '2024-25', 'Active', '2024-07-18');
    insertReg.run('REG-2024-03', 'STU-2024-003', 'CRS-EC201', 'Sem 3', '2024-25', 'Active', '2024-07-20');
    insertReg.run('REG-2024-04', 'STU-2024-004', 'CRS-CM301', 'Sem 1', '2024-25', 'Active', '2024-08-01');
    insertReg.run('REG-2024-05', 'STU-2024-005', 'CRS-BT401', 'Sem 3', '2024-25', 'Active', '2024-07-14');
    insertReg.run('REG-2024-06', 'STU-2024-006', 'CRS-ME501', 'Sem 1', '2024-25', 'Active', '2024-08-05');

    // 8. Schemes
    const insertScheme = db.prepare(`
      INSERT OR IGNORE INTO schemes (
        scheme_id, name, code, description, eligibility_criteria, max_amount, total_grant_pool, disbursed_so_far, funding_agency, min_attendance, max_income_ceiling, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertScheme.run('SCH-PMS-01', 'Post-Matric Scholarship for SC/ST Students', 'GOK-PMS', 'Centrally sponsored fee concession and maintenance stipend for SC/ST students.', 'SC/ST category with annual family income below ₹2,50,000 and minimum 75% attendance.', 50000, 120000000, 89400000, 'Govt of Karnataka & Ministry of Social Justice', 75.0, 250000, 1);
    insertScheme.run('SCH-VDS-02', 'Vidya Siri (Food & Accommodation Assistance)', 'GOK-VDS', 'Financial stipend for OBC/Minority post-matric students living outside hostels.', 'Category 1, 2A, 2B, 3A, 3B students with family income < ₹2.5L.', 18000, 65000000, 48500000, 'Backward Classes Welfare Department', 75.0, 250000, 1);
    insertScheme.run('SCH-KIRG-03', 'Karnataka Innovation & Research Fellowship (KIRG)', 'K-TECH-IRG', 'Research seed money grant awarded to PG students and research scholars in deep tech.', 'PG final year or PhD scholar with approved research proposal.', 150000, 80000000, 51200000, 'Dept of IT, BT and S&T, Govt of Karnataka', 80.0, 600000, 1);
    insertScheme.run('SCH-EWS-04', 'Economically Weaker Section Merit Fee Waiver', 'GOK-EWS-MW', 'Merit-cum-means tuition reimbursement for general category students under ₹2L income.', 'General category, family income below ₹2,00,000, CGPA >= 8.0.', 35000, 40000000, 27800000, 'Department of Collegiate & Technical Education', 80.0, 200000, 1);
    insertScheme.run('SCH-LAB-05', 'Laboratory Modernization & Equipment Grant', 'GOK-LAB-MOD', 'Institutional grant allocated to STEM departments for equipment.', 'Approved department research proposal by Finance Committee.', 5000000, 250000000, 182000000, 'RUSA & State Govt', 0.0, 0, 1);

    // 9. Validators
    const insertValidator = db.prepare(`
      INSERT OR IGNORE INTO validators (
        validator_id, name, role, email, assigned_count, verified_count, accuracy_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertValidator.run('VAL-001', 'Dr. R. Manjunath', 'Finance Officer & Lead Auditor', 'fo.manjunath@bcu.ac.in', 342, 318, '99.2%');
    insertValidator.run('VAL-002', 'Smt. Shailaja K. S.', 'Assistant Registrar (Scholarships)', 'ar.scholarships@bcu.ac.in', 410, 385, '98.7%');
    insertValidator.run('VAL-003', 'Sri C. H. Lingamurthy', 'Internal Audit Officer', 'audit.lingamurthy@bcu.ac.in', 275, 260, '99.5%');

    // 10. Applications
    const insertApp = db.prepare(`
      INSERT OR IGNORE INTO applications (
        app_id, student_id, scheme_id, application_date, amount_requested, status, ai_validation_status, ai_risk_score, ai_flags, validator_id, verified_date, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertApp.run('APP-2024-0891', 'STU-2024-001', 'SCH-VDS-02', '2024-08-12', 18000, 'Approved', 'Verified', 4, '[]', 'VAL-002', '2024-08-14', 'Income certificate verified via Karnataka Nadakacheri API. Attendance 94.5%.');
    insertApp.run('APP-2024-0892', 'STU-2024-004', 'SCH-PMS-01', '2024-08-14', 38000, 'Approved', 'Verified', 6, '[]', 'VAL-001', '2024-08-16', 'Caste & Income verified with Seva Sindhu. Bank Aadhaar-seeded.');
    insertApp.run('APP-2024-0893', 'STU-2024-003', 'SCH-EWS-04', '2024-08-20', 35000, 'Under Review', 'Flagged', 62, JSON.stringify(['Income certificate expiration date within 30 days', 'Minor address variation']), 'VAL-002', null, 'Requires re-upload of latest income verification slip.');
    insertApp.run('APP-2024-0894', 'STU-2024-002', 'SCH-KIRG-03', '2024-08-25', 120000, 'AI Validated', 'Verified', 12, '[]', 'VAL-001', '2024-08-27', 'Project supervisor endorsement verified. Research synopsis scored 88/100.');
    insertApp.run('APP-2024-0895', 'STU-2024-006', 'SCH-PMS-01', '2024-09-02', 44000, 'Submitted', 'In Progress', 22, JSON.stringify(["Bank account name has spelling variation: 'Rohit S Rathod'"]), 'VAL-003', null, 'Aadhaar fuzzy match 91%. Awaiting auditor clearance.');
    insertApp.run('APP-2024-0896', 'STU-2024-005', 'SCH-EWS-04', '2024-09-08', 35000, 'Rejected', 'Rejected by AI', 88, JSON.stringify(['Reported family income exceeds scheme ceiling of ₹2,00,000 (Calculated: ₹3,80,000)']), 'VAL-001', '2024-09-10', 'Ineligible due to family income criteria as per Department guidelines.');

    // 11. Disbursements
    const insertDisb = db.prepare(`
      INSERT OR IGNORE INTO disbursements (
        disbursement_id, application_id, amount, date, mode, status, utr_number, bank_account, pfms_batch_id, reconciliation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDisb.run('DISB-2024-501', 'APP-2024-0891', 18000, '2024-08-28', 'DBT - Aadhaar Payment Bridge (APB)', 'Completed', 'SBIN824009812401', '•••• •••• 4421 (SBI)', 'PFMS-GOK-2024-091', 'Reconciled');
    insertDisb.run('DISB-2024-502', 'APP-2024-0892', 38000, '2024-09-05', 'PFMS - Direct Beneficiary', 'Completed', 'BARB924008123991', '•••• •••• 1150 (BoB)', 'PFMS-GOK-2024-098', 'Reconciled');
    insertDisb.run('DISB-2024-503', 'APP-2024-0894', 60000, '2024-09-20', 'RTGS Institutional Escrow', 'Completed', 'CNRB724001928374', '•••• •••• 6712 (Canara Bank)', 'PFMS-GOK-2024-110', 'Reconciled');

    // 12. AI Models
    const insertAiModel = db.prepare(`
      INSERT OR IGNORE INTO ai_models (
        model_id, name, version, accuracy, description, last_trained, active_in_production, rules_applied, false_positive_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAiModel.run('MDL-FIN-01', 'FinShield Neural Auditor', 'v3.2.4', '99.1%', 'Deep anomaly detection engine analyzing bank statement line items and velocity checks.', '2024-09-15', 1, 48, '0.4%');
    insertAiModel.run('MDL-SCH-02', 'ScholarCheck Fraud & Duplicate Sentinel', 'v2.8.1', '98.6%', 'Cross-scheme identity deduplication, Nadakacheri income validation OCR, and Aadhaar biometric token hash verification.', '2024-10-02', 1, 36, '0.7%');
    insertAiModel.run('MDL-RECON-03', 'BankRecon NLP Parser & Ledger Matcher', 'v4.0.0', '99.8%', 'Multilingual OCR and tabular NLP parser extracting standard statement schemas from 40+ Indian banking formats (PDF/CSV/XLSX).', '2024-10-08', 1, 62, '0.2%');

    // 13. Bank Accounts (Matching all 18 accounts from the screenshot)
    const insertAccount = db.prepare(`
      INSERT OR IGNORE INTO bank_accounts (
        id, university_id, bank_name, bank_code, account_number, account_type, branch, ifsc, current_balance, total_debits, total_credits, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const accountsData = [
      [1, 'UNIV-01', 'State Bank of India', 'SBI', '•••• •••• 8913', 'General', 'Bengaluru Main Branch, KG Road', 'SBIN0040120', 48920500, 14230000, 32500000, 1],
      [2, 'UNIV-01', 'Canara Bank', 'CANARA', '•••• •••• 4321', 'Salary', 'Town Hall Branch, JC Road', 'CNRB0000421', 18240000, 38400000, 41000000, 1],
      [3, 'UNIV-01', 'Union Bank of India', 'UBI', '•••• •••• 7789', 'Grant', 'Gandhinagar Branch', 'UBIN0530123', 64100000, 8500000, 45000000, 1],
      [4, 'UNIV-01', 'Bank of Baroda', 'BOB', '•••• •••• 9012', 'Project', 'Malleshwaram 8th Cross', 'BARB0MALLES', 22350000, 4120000, 12000000, 1],
      [5, 'UNIV-01', 'ICICI Bank', 'ICICI', '•••• •••• 3456', 'General', 'MG Road Commercial Branch', 'ICIC0000002', 31500000, 9800000, 15400000, 1],
      [6, 'UNIV-01', 'Karnataka Bank', 'KTK', '•••• •••• 6678', 'Student Fee', 'Basavanagudi Branch', 'KARB0000050', 55400000, 1200000, 38900000, 1],
      [7, 'UNIV-01', 'Axis Bank', 'AXIS', '•••• •••• 1122', 'Research', 'Rajajinagar 1st Block', 'UTIB0000045', 14800000, 0, 0, 1],
      [8, 'UNIV-01', 'Indian Bank', 'INDIAN', '•••• •••• 3344', 'General', 'Shivajinagar Branch', 'IDIB000S012', 19700000, 4500000, 8900000, 1],
      [9, 'UNIV-01', 'Central Bank of India', 'CBI', '•••• •••• 5588', 'Infrastructure', 'Kempegowda Road', 'CBIN0280101', 82100000, 19800000, 52000000, 1],
      [10, 'UNIV-01', 'Punjab National Bank', 'PNB', '•••• •••• 8899', 'General', 'Infantry Road Branch', 'PUNB0012000', 16400000, 3100000, 6400000, 1],
      [11, 'UNIV-01', 'HDFC Bank', 'HDFC', '•••• •••• 2468', 'Endowments', 'Koramangala 5th Block', 'HDFC0000053', 39500000, 800000, 12500000, 1],
      [12, 'UNIV-01', 'Kotak Mahindra Bank', 'KOTAK', '•••• •••• 1357', 'Alumni Fund', 'Indiranagar 100ft Road', 'KKBK0000422', 12800000, 450000, 3200000, 1],
      [13, 'UNIV-01', 'IDBI Bank', 'IDBI', '•••• •••• 9876', 'Project', 'Mission Road Branch', 'IBKL0000010', 17300000, 2900000, 7800000, 1],
      [14, 'UNIV-01', 'Bank of India', 'BOI', '•••• •••• 5432', 'Exam Cell', 'Jayanagar 4th Block', 'BKID0008401', 24100000, 6400000, 14200000, 1],
      [15, 'UNIV-01', 'UCO Bank', 'UCO', '•••• •••• 6543', 'Pension Fund', 'Gandhinagar Main', 'UCBA0000021', 41200000, 18400000, 22000000, 1],
      [16, 'UNIV-01', 'Indian Overseas Bank', 'IOB', '•••• •••• 7654', 'Hostel Fee', 'Victoria Hospital Ext', 'IOBA0000145', 15900000, 4100000, 9800000, 1],
      [17, 'UNIV-01', 'IndusInd Bank', 'INDUS', '•••• •••• 8765', 'Special Grant', 'Cunningham Road', 'INDB0000008', 28400000, 3200000, 16500000, 1],
      [18, 'UNIV-01', 'Federal Bank', 'FED', '•••• •••• 9811', 'Corporate CSR', 'Richmond Town Branch', 'FDRL0001244', 11600000, 1100000, 5400000, 1],
    ];

    for (const acc of accountsData) {
      insertAccount.run(...acc);
    }

    // 14. Bank Statements (Initial statements matching screenshot state: 16 Uploaded, 1 Processing, 1 Pending)
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO bank_statements (
        id, account_id, financial_year, quarter, file_name, original_filename, file_path, file_size, file_hash, mime_type, upload_status, ai_status, parsed_transactions_count, opening_balance, closing_balance, calculated_balance, balance_mismatch, anomalies_detected, uploaded_by, uploaded_at, is_submitted_for_review
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const statementsData = [
      [1, 1, '2024-25', 'Q2 (Jul - Sep)', 'SBI_General_A8913_Q2_2024.pdf', 'SBI_General_A8913_Q2_2024.pdf', 'uploads/sbi_stmt_8913.pdf', 2936012, 'hash_sbi_8913', 'application/pdf', 'Uploaded', 'Completed', 142, 30650500, 48920500, 48920500, 0, 0, 'Dr. R. Manjunath', '12-Oct-2024, 10:24 AM', 0],
      [2, 2, '2024-25', 'Q2 (Jul - Sep)', 'Canara_Salary_A4321_Q2.xlsx', 'Canara_Salary_A4321_Q2.xlsx', 'uploads/canara_stmt_4321.xlsx', 1468006, 'hash_canara_4321', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 218, 15640000, 18240000, 18240000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 04:15 PM', 0],
      [3, 3, '2024-25', 'Q2 (Jul - Sep)', 'UnionBank_Grant_A7789_Q2.pdf', 'UnionBank_Grant_A7789_Q2.pdf', 'uploads/union_stmt_7789.pdf', 3250585, 'hash_ubi_7789', 'application/pdf', 'Uploaded', 'Completed', 84, 27600000, 64100000, 64100000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 02:30 PM', 0],
      [4, 4, '2024-25', 'Q2 (Jul - Sep)', 'BOB_Project_A9012_Q2.csv', 'BOB_Project_A9012_Q2.csv', 'uploads/bob_stmt_9012.csv', 972800, 'hash_bob_9012', 'text/csv', 'Processing', 'In Progress', 67, 14470000, 22350000, 22350000, 0, 1, 'Dr. R. Manjunath', '14-Oct-2024, 11:05 AM', 0],
      [5, 5, '2024-25', 'Q2 (Jul - Sep)', 'ICICI_General_A3456_Q2.pdf', 'ICICI_General_A3456_Q2.pdf', 'uploads/icici_stmt_3456.pdf', 1992294, 'hash_icici_3456', 'application/pdf', 'Uploaded', 'Completed', 112, 25900000, 31500000, 31500000, 0, 0, 'Dr. R. Manjunath', '09-Oct-2024, 01:20 PM', 0],
      [6, 6, '2024-25', 'Q2 (Jul - Sep)', 'KTK_StudentFee_A6678_Q2.xlsx', 'KTK_StudentFee_A6678_Q2.xlsx', 'uploads/ktk_stmt_6678.xlsx', 4299161, 'hash_ktk_6678', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 420, 17700000, 55400000, 55400000, 0, 0, 'Dr. R. Manjunath', '08-Oct-2024, 09:45 AM', 0],
      // Account 7 (Axis Bank) is Pending upload! No statement row yet.
      [8, 8, '2024-25', 'Q2 (Jul - Sep)', 'IndianBank_Gen_A3344_Q2.pdf', 'IndianBank_Gen_A3344_Q2.pdf', 'uploads/indian_stmt_3344.pdf', 2202009, 'hash_indian_3344', 'application/pdf', 'Uploaded', 'Completed', 98, 15300000, 19700000, 19700000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 03:10 PM', 0],
      [9, 9, '2024-25', 'Q2 (Jul - Sep)', 'CentralBank_Infra_A5588_Q2.pdf', 'CentralBank_Infra_A5588_Q2.pdf', 'uploads/cbi_stmt_5588.pdf', 3879731, 'hash_cbi_5588', 'application/pdf', 'Uploaded', 'Completed', 73, 49900000, 82100000, 82100000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 12:05 PM', 0],
      [10, 10, '2024-25', 'Q2 (Jul - Sep)', 'PNB_General_A8899_Q2.pdf', 'PNB_General_A8899_Q2.pdf', 'uploads/pnb_stmt_8899.pdf', 1677721, 'hash_pnb_8899', 'application/pdf', 'Uploaded', 'Completed', 65, 13100000, 16400000, 16400000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 11:50 AM', 0],
      [11, 11, '2024-25', 'Q2 (Jul - Sep)', 'HDFC_Endowment_A2468_Q2.pdf', 'HDFC_Endowment_A2468_Q2.pdf', 'uploads/hdfc_stmt_2468.pdf', 1887436, 'hash_hdfc_2468', 'application/pdf', 'Uploaded', 'Completed', 44, 27800000, 39500000, 39500000, 0, 0, 'Dr. R. Manjunath', '07-Oct-2024, 05:20 PM', 0],
      [12, 12, '2024-25', 'Q2 (Jul - Sep)', 'Kotak_Alumni_A1357_Q2.xlsx', 'Kotak_Alumni_A1357_Q2.xlsx', 'uploads/kotak_stmt_1357.xlsx', 859770, 'hash_kotak_1357', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 38, 10050000, 12800000, 12800000, 0, 0, 'Dr. R. Manjunath', '08-Oct-2024, 02:40 PM', 0],
      [13, 13, '2024-25', 'Q2 (Jul - Sep)', 'IDBI_Project_A9876_Q2.pdf', 'IDBI_Project_A9876_Q2.pdf', 'uploads/idbi_stmt_9876.pdf', 2411724, 'hash_idbi_9876', 'application/pdf', 'Uploaded', 'Completed', 53, 12400000, 17300000, 17300000, 0, 0, 'Dr. R. Manjunath', '09-Oct-2024, 11:15 AM', 0],
      [14, 14, '2024-25', 'Q2 (Jul - Sep)', 'BOI_Exam_A5432_Q2.pdf', 'BOI_Exam_A5432_Q2.pdf', 'uploads/boi_stmt_5432.pdf', 1992294, 'hash_boi_5432', 'application/pdf', 'Uploaded', 'Completed', 129, 16300000, 24100000, 24100000, 0, 0, 'Dr. R. Manjunath', '10-Oct-2024, 04:35 PM', 0],
      [15, 15, '2024-25', 'Q2 (Jul - Sep)', 'UCO_Pension_A6543_Q2.pdf', 'UCO_Pension_A6543_Q2.pdf', 'uploads/uco_stmt_6543.pdf', 2516582, 'hash_uco_6543', 'application/pdf', 'Uploaded', 'Completed', 186, 37600000, 41200000, 41200000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 09:10 AM', 0],
      [16, 16, '2024-25', 'Q2 (Jul - Sep)', 'IOB_Hostel_A7654_Q2.pdf', 'IOB_Hostel_A7654_Q2.pdf', 'uploads/iob_stmt_7654.pdf', 1572864, 'hash_iob_7654', 'application/pdf', 'Uploaded', 'Completed', 110, 10200000, 15900000, 15900000, 0, 0, 'Dr. R. Manjunath', '11-Oct-2024, 03:50 PM', 0],
      [17, 17, '2024-25', 'Q2 (Jul - Sep)', 'IndusInd_Special_A8765_Q2.pdf', 'IndusInd_Special_A8765_Q2.pdf', 'uploads/indus_stmt_8765.pdf', 2097152, 'hash_indus_8765', 'application/pdf', 'Uploaded', 'Completed', 59, 15100000, 28400000, 28400000, 0, 0, 'Dr. R. Manjunath', '12-Oct-2024, 01:10 PM', 0],
      [18, 18, '2024-25', 'Q2 (Jul - Sep)', 'Federal_CSR_A9811_Q2.xlsx', 'Federal_CSR_A9811_Q2.xlsx', 'uploads/fed_stmt_9811.xlsx', 1153433, 'hash_fed_9811', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Uploaded', 'Completed', 36, 7300000, 11600000, 11600000, 0, 0, 'Dr. R. Manjunath', '12-Oct-2024, 04:00 PM', 0],
    ];

    for (const stmt of statementsData) {
      insertStmt.run(...stmt);
    }

    // 15. Statement Transactions (Sample extracted lines for State Bank of India account #1)
    const insertTxn = db.prepare(`
      INSERT OR IGNORE INTO statement_transactions (
        statement_id, account_id, txn_id, txn_date, description, reference_no, type, amount, balance, ai_category, ai_flag, confidence, is_reconciled, reconciled_with_type, reconciled_with_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const txns = [
      [1, 1, 'TXN-9021', '2024-09-28', 'RTGS-NEFT CR: GOVT OF KARNATAKA SCHOLARSHIP FUND', 'GOK-DBT-9281726', 'Credit', 15000000, 48920500, 'Government Grant', 'Verified', '99.8%', 1, 'Grant', 'SCH-PMS-01'],
      [1, 1, 'TXN-9020', '2024-09-25', 'DIRECT DEBIT: BULK DBT SCHOLARSHIP DISBURSEMENT BATCH #44', 'BCU-DBT-DISB-44', 'Debit', 2450000, 33920500, 'Direct Benefit Transfer', 'Verified', '99.6%', 1, 'Disbursement', 'DISB-2024-501'],
      [1, 1, 'TXN-9019', '2024-09-21', 'CHQ CLG: KSTDC BUS CHARGES FOR STUDENT FIELD EXCURSION', 'CHQ-0021489', 'Debit', 185000, 36370500, 'Student Welfare', 'Verified', '98.9%', 0, null, null],
      [1, 1, 'TXN-9018', '2024-09-18', 'INTEREST CREDIT: AUTO-SWEEP MOD LIQUIDITY INTEREST', 'INT-Q2-AUTO', 'Credit', 324500, 36555500, 'Bank Interest', 'Verified', '100%', 0, null, null],
      [1, 1, 'TXN-9017', '2024-09-15', 'NEFT DR: LABTRONICS COMPUTING EQUIPMENT PO #8821', 'CMS-NEFT-88219', 'Debit', 3450000, 36231000, 'Equipment & Infra', 'Verified', '99.2%', 0, null, null],
      [1, 1, 'TXN-9016', '2024-09-10', 'REFUND / ADJUSTMENT: CANCELLED ADMISSION FEE RETURN', 'REV-ADM-004', 'Debit', 45000, 39681000, 'Student Refund', 'Verified', '99.4%', 0, null, null],
    ];

    for (const t of txns) {
      insertTxn.run(...t);
    }

    // 16. Reports
    const insertReport = db.prepare(`
      INSERT OR IGNORE INTO reports (
        report_id, title, type, university_id, financial_year, quarter, generated_date, file_path, model_id, file_size, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run('REP-2024-Q1-RECON', 'Consolidated Bank Reconciliation Statement (Q1 FY24-25)', 'Reconciliation', 'UNIV-01', '2024-25', 'Q1 (Apr - Jun)', '2024-07-25 16:40', '/reports/Q1_Bank_Recon_2024_25.pdf', 'MDL-RECON-03', '3.4 MB', 'Audited & Signed');
    insertReport.run('REP-2024-SCHEME-AUDIT', 'AI Anomaly Audit for Post-Matric & Vidya Siri Schemes', 'AI Audit', 'UNIV-01', '2024-25', 'Q2 (Jul - Sep)', '2024-09-30 11:15', '/reports/AI_Scheme_Audit_Sep2024.pdf', 'MDL-SCH-02', '1.8 MB', 'Published to Dept');
    insertReport.run('REP-2024-UC-RUSA', 'RUSA Infrastructure Grant Utilization Certificate (Form GFR-12A)', 'Utilization Certificate', 'UNIV-01', '2024-25', 'Q2 (Jul - Sep)', '2024-10-05 14:20', '/reports/RUSA_UC_Oct2024.pdf', 'MDL-FIN-01', '2.1 MB', 'Submitted to Ministry');
    insertReport.run('REP-2024-Q2-DRAFT', 'Interim Quarterly Fund Utilization & Disbursement Tracker (Q2 FY24-25)', 'Financial Analysis', 'UNIV-01', '2024-25', 'Q2 (Jul - Sep)', '2024-10-14 09:30', '/reports/Interim_Q2_Fund_Util_2024.pdf', 'MDL-FIN-01', '4.2 MB', 'Draft (Auto-generated)');

    // 17. AI Anomalies
    const insertAnomaly = db.prepare(`
      INSERT OR IGNORE INTO ai_anomalies (
        anomaly_code, type, severity, entity_type, entity_id, title, details, confidence, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAnomaly.run('ANOM-01', 'Income Ceiling Breach', 'High', 'Application', 'APP-2024-0896', 'Excess Income for EWS Waiver', 'Nadakacheri income certificate reports ₹3,80,000, surpassing the EWS threshold of ₹2,00,000.', 0.99, 'Resolved');
    insertAnomaly.run('ANOM-02', 'Duplicate Bank Account Registration', 'Medium', 'Student', 'STU-2024-002', 'Concurrent Portal Registrations', 'Account •••• 6712 registered simultaneously in two state scholarship portals (SSP & Vidyasiri).', 0.92, 'Auditor Reviewed');
    insertAnomaly.run('ANOM-03', 'Unreconciled Bank Debit Velocity', 'High', 'Bank Statement', '4', 'Potential Split Procurement', 'Three consecutive debits under ₹50,000 within 4 hours flagged as potential split procurement.', 0.88, 'Under Review');
    insertAnomaly.run('ANOM-04', 'Attendance Threshold Gap', 'Low', 'Application', 'APP-2024-0895', 'Marginal Attendance Deficit', 'Attendance in 2 modules marginally at 74.8% (Minimum standard rule: 75.0%).', 0.94, 'Open');

    // 18. Audit Logs
    const insertLog = db.prepare(`
      INSERT INTO audit_logs (
        user_id, user_name, role, action, entity_type, entity_id, details, ip_address, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    insertLog.run('USR-02', 'Dr. R. Manjunath', 'Finance Officer', 'SYSTEM_INITIALIZATION', 'Database', 'ALL', 'Initialized database schema and seeded default university administrative records', '127.0.0.1');
  });

  seedTx();
  console.log('✓ Database tables created and initial records seeded successfully.');
}
