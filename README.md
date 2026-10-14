# University Fund Management & AI Validation System
**Department of Higher Education, Government of Karnataka**

An enterprise-grade, end-to-end financial administration, bank statement reconciliation, and AI-assisted audit system for state public universities (Bengaluru City University jurisdiction reference).

---

## Architecture Overview

```
                                      ┌────────────────────────────────────────────────────────┐
                                      │       Frontend (React 19 + Vite + Lucide Icons)        │
                                      │  - Karnataka Enterprise Design System                  │
                                      │  - Quarterly Statement Upload (Recreates Screenshot)   │
                                      │  - AI Validation Workbench & Queue Stage Tracker       │
                                      │  - Financial Analysis & Head-wise Utilization          │
                                      │  - Downloadable Statutory Reports (CSV & XLSX)         │
                                      │  - Relational Master Entities Data Grid                │
                                      └───────────────────────────┬────────────────────────────┘
                                                                  │ REST HTTP / JWT Bearer
                                                                  ▼
                                      ┌────────────────────────────────────────────────────────┐
                                      │           Backend REST API (Node.js & Express)         │
                                      │  - JWT Authentication & RBAC Scope Validation          │
                                      │  - Multer Ingestion Pipeline & SHA-256 Hashing         │
                                      │  - Modular Validation Pipeline:                        │
                                      │    * FileSchemaValidator                               │
                                      │    * TransactionExtractor & Normalizer                 │
                                      │    * ArithmeticReconciliationService                   │
                                      │    * DuplicateDetectionService                         │
                                      │    * RuleAnomalyDetector (KTPP Act, Eligibility)       │
                                      │    * MlAnomalyScorer (Statistical Z-Score Sentinel)    │
                                      │  - Dynamic Report Export Engine (CSV & Excel)          │
                                      │  - Immutable Audit Trail Logger                        │
                                      └───────────────────────────┬────────────────────────────┘
                                                                  │ SQLite WAL Mode
                                                                  ▼
                                      ┌────────────────────────────────────────────────────────┐
                                      │             Relational Database (SQLite)               │
                                      │  - 18 Normalized Schema Tables                         │
                                      │  - Uniqueness & Idempotency Constraints                │
                                      │  - DBT Disbursements & Performance Indexes             │
                                      └────────────────────────────────────────────────────────┘
```

---

## 1. Modular AI Validation Pipeline

The system incorporates a 7-stage decoupled validation architecture:

1. **File & Schema Validation (`FileSchemaValidator`)**:
   - Enforces supported extensions (`.pdf`, `.xlsx`, `.xls`, `.csv`), MIME types, and 25 MB size limits.
   - Detects missing mandatory financial header columns (Date, Description, Debit/Credit).
2. **Transaction Extraction & Normalization (`TransactionExtractor`)**:
   - Converts regional dates (`DD/MM/YYYY`, `DD-MMM-YYYY`, etc.) to standard ISO `YYYY-MM-DD`.
   - Strips currency markers (`₹`, `$`, `,`, `CR`, `DR`) and standardizes transaction direction.
   - Sanitizes UTR and reference strings.
3. **Financial Arithmetic & Balance Reconciliation (`ArithmeticReconciliationService`)**:
   - Deterministic verification: `Opening Balance + Total Credits - Total Debits = Closing Balance`.
   - Flags arithmetic mismatches as `DETERMINISTIC_ERROR` and checks running balance continuity.
4. **Duplicate Detection (`DuplicateDetectionService`)**:
   - Identifies identical transaction references / UTRs intra-statement and cross-statement across historical ledgers.
   - Detects fuzzy date-amount collisions (`Date ± 1 day` + `Exact Amount`).
5. **Rule-Based Anomaly Detection (`RuleAnomalyDetector`)**:
   - **KTPP Act Split Procurement Sentinel**: Flags clustered debits between ₹40,000 and ₹49,999 structured to circumvent the statutory ₹50,000 e-tender threshold.
   - **Round Sum Outliers**: Flags un-narrated large cash/cheque withdrawals exceeding ₹5,00,000.
   - **Unauthorized Overdrafts**: Flags negative balances on non-overdraft public treasury accounts.
   - **Student Eligibility Sentinel**: Flags income breaches against Nadakacheri revenue ceilings and biometric attendance below 75%.
6. **ML & Statistical Outlier Scoring (`MlAnomalyScorer`)**:
   - Evaluates expenditure distributions and flags transactions exceeding 3.0 standard deviations from the mean ($Z > +3.0\sigma$).
   - Documented statistical and rule-based fallback when external ML weights/endpoints are unconfigured.
7. **Validation Pipeline Orchestrator (`ValidationPipeline`)**:
   - Combines deterministic errors, potential anomalies, and reviewer decisions.
   - Computes a documented Risk Score ($0 - 100$) with transparent formula breakdowns.

---

## 2. Interactive Financial Analytics

Analytics are dynamically calculated from verified source database records:
- **Sanctioned Budget, Allocated Funds, Utilized Funds, Remaining Balance**: Sourced from universities and departmental ledgers.
- **Applications Breakdown**: Counts and amounts grouped by `Approved`, `Pending`, `Rejected`, and `Requires Correction`.
- **Scheme-wise Fund Distribution**: Actual grant pools, disbursed amounts, and utilization percentages across welfare schemes.
- **Department-wise Fund Utilization**: Sanctioned pools vs burn rates across academic departments.
- **University-wise Comparison**: Multi-university state benchmarking (BCU, VTU, UOM, KUD).
- **Quarterly Inflow/Outflow**: Aggregated from parsed transaction ledgers.
- **Reconciliation Health**: Percentage of statements with 0 arithmetic variance.

---

## 3. Validation Workbench & Decision Center

Accessible via the **AI Validation** view:
- **Tabbed Review Queues**:
  - Bank Statements Validation Queue (18 scheduled accounts).
  - Beneficiary Applications Queue.
  - Flagged Policy Anomalies.
- **Stage Progress Tracker**: `1. Ingestion` → `2. Schema Validation` → `3. Arithmetic Ledger` → `4. Outlier Scan` → `5. Reviewer Decision`.
- **Side-by-Side Inspector**: Compare declared account metadata against extracted line-item ledgers.
- **Reviewer Decision Actions**:
  - `Approve`: Clears record for DBT disbursement / audit sign-off.
  - `Reject`: Requires mandatory reason recorded in immutable audit trail.
  - `Request Correction`: Returns record to applicant/DDO with mandatory feedback instructions.

---

## 4. Downloadable Statutory Reports

Directly exports live certified records in both **CSV** and **XLSX** formats from `/api/reports/export`:
1. **Quarterly Bank Statements** (`?type=statements&format=csv|xlsx`)
2. **Income & Expenditure Register** (`?type=income-expenditure&format=csv|xlsx`)
3. **Scheme Allocations & Utilization** (`?type=scheme-utilization&format=csv|xlsx`)
4. **Beneficiary Applications & Approvals** (`?type=applications&format=csv|xlsx`)
5. **Direct Benefit Transfer (DBT) History** (`?type=disbursements&format=csv|xlsx`)
6. **Statement Reconciliation Dossier** (`?type=reconciliation&format=csv|xlsx`)
7. **AI Validation Findings & Decision Log** (`?type=anomalies&format=csv|xlsx`)

---

## 5. Default RBAC Credentials

| Role | Username | Password | User Name | Jurisdiction / Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Finance Officer** | `financeofficer` / `manjunath` | `Password@123` | Dr. R. Manjunath | Bengaluru City University |
| **Super Admin** | `superadmin` | `Password@123` | Dr. Suresh Kumar (IAS) | Dept of Higher Education, Karnataka |
| **University Admin** | `univadmin` / `bcu_admin` | `Password@123` | Registrar BCU | Bengaluru City University |
| **Validator** | `validator` / `validator_shailaja` | `Password@123` | Smt. Shailaja K. S. | BCU Scholarship Cell |
| **Read-Only Auditor** | `auditor` / `auditor_cag` | `Password@123` | Sri Anand Deshmukh | CAG Audit Cell |

*Tip: Use the Profile menu in the top right of the dashboard to switch roles in 1 click.*

---

## 6. Installation & Execution

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Re-seed database with pristine demonstration data (Optional)
npm run seed

# 3. Start Backend API Server (Port 5000)
npm run server

# 4. Start Frontend Application (Port 5173)
npm run dev

# 5. Run Comprehensive Test Suite (32 tests across 11 suites)
npm test

# 6. Production Build
npm run build
```

---

## 7. Environment Variables (`.env.example`)

Copy `.env.example` to `.env` if custom parameters are required:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=karnataka_higher_education_fund_mgmt_jwt_secret_key_2024
DATABASE_PATH=./data/university_fund_mgmt.db
MAX_UPLOAD_SIZE_MB=25
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Test Results & Limitations

- **Automated Test Results**: **32 passing tests (0 failures)** across 11 suites:
  - System Healthcheck
  - Authentication & RBAC JWT Verification
  - Bank Accounts & Statement Listing
  - Multipart Upload, Parsing, and SHA-256 Duplicate Check
  - AI Validation Engine & Anomaly Resolution
  - Beneficiary Applications & DBT Disbursements
  - Analytics & Statutory Reports
  - Master Relational Entities CRUD (ER Model)
  - Modular AI Validation Pipeline (FileSchemaValidator, TransactionExtractor, ArithmeticReconciliationService, ValidationPipeline)
  - Statutory Report Exports (CSV & XLSX Download)
  - Validation Workbench Queue & Reviewer Decisions
- **Production Build**: Verified with Vite 8.3 (`npm run build` completes in 1.33s with 0 errors).
- **Known Limitations & Real Credentials**:
  - Live bank payment gateway integrations (SBI e-Pay / PFMS API) require authorized government credentials. The current system safely simulates cleared UTR vouchers with unique transaction references.
  - External neural inference models (e.g. cloud-hosted LLMs) can be attached via `AI_MODEL_ENDPOINT`. In their absence, the system uses the deterministic heuristic & statistical Z-Score sentinels.
