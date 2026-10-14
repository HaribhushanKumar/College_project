import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import BankLogo from '../common/BankLogo';
import Badge from '../common/Badge';
import {
  TrendingUp,
  Users,
  Award,
  CreditCard,
  FileCheck2,
  AlertTriangle,
  UploadCloud,
  Sparkles,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Landmark,
  Eye
} from 'lucide-react';

export default function DashboardView() {
  const {
    selectedUniversity,
    financialYear,
    quarter,
    applications,
    disbursements,
    bankAccounts,
    departments,
    schemes,
    setActiveTab,
    addToast
  } = useApp();

  const [filterPeriod, setFilterPeriod] = useState('Quarterly');

  // Computed metrics
  const totalAllocated = 1120000000; // 112 Cr
  const totalUtilized = 985000000; // 98.5 Cr
  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'Approved').length;
  const pendingApps = applications.filter((a) => a.status === 'Pending' || a.status === 'Under Review' || a.status === 'AI Validated').length;
  const rejectedApps = applications.filter((a) => a.status === 'Rejected').length;
  const totalDisbursed = disbursements
    .filter((d) => d.status === 'Completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingStatements = bankAccounts.filter((a) => a.statement_status !== 'Uploaded').length;

  return (
    <div>
      {/* Welcome & University Overview Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
          color: '#fff',
          padding: '1.75rem 2rem',
          borderRadius: 'var(--border-radius-lg)',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--emerald-500)' }} />
            Academic & Financial Audit Active · FY {financialYear} {quarter}
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            {selectedUniversity}
          </h1>
          <p style={{ color: 'var(--slate-300)', fontSize: '0.875rem', lineHeight: '1.4' }}>
            Central administrative portal for scholarship allocations, DBT direct beneficiary transfers, quarterly bank statement audit, and machine learning fraud validation.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '1.15rem 1.4rem',
            borderRadius: 'var(--border-radius-md)',
            display: 'flex',
            gap: '1.75rem',
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fund Utilization
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
              87.9%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
              ↑ 4.2% vs Q1 FY24
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Reconciled
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
              {18 - pendingStatements}/18
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--blue-200)', fontWeight: 600 }}>
              Bank Accounts Audited
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards Row (6 Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Card 1: Total Funds */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Total Sanctioned Funds
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--blue-50)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            ₹112.0 Cr
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            ₹98.5 Cr Utilized (87.9%)
          </div>
        </div>

        {/* Card 2: Applications */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Total Applications
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck2 size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {totalApps} <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 500 }}>Active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Across 5 Welfare Schemes
          </div>
        </div>

        {/* Card 3: Pending AI Validations */}
        <div
          className="card"
          style={{ padding: '1.15rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('ai-validation')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Pending Validations
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--amber-50)', color: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-600)' }}>
            {pendingApps}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--amber-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            Requires Auditor Review →
          </div>
        </div>

        {/* Card 4: Approved Applications */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Approved Grants
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
            {approvedApps}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Ready for DBT release
          </div>
        </div>

        {/* Card 5: Disbursements */}
        <div
          className="card"
          style={{ padding: '1.15rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('disbursements')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Disbursed (DBT/PFMS)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--blue-50)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            ₹{(totalDisbursed / 1000).toFixed(0)}k
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            100% Success Rate
          </div>
        </div>

        {/* Card 6: Flagged / Rejected */}
        <div
          className="card"
          style={{ padding: '1.15rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('ai-validation')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Rejected / Anomalies
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--rose-50)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose-600)' }}>
            {rejectedApps}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--rose-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            Income ceiling breach
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Sparkles size={18} style={{ color: 'var(--blue-700)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
            Quick Actions:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('upload-statements')}
          >
            <UploadCloud size={14} /> Upload Statements
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('applications')}
          >
            <FileCheck2 size={14} /> Review Applications
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('ai-validation')}
          >
            <Sparkles size={14} /> Validate Applications
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('reports')}
          >
            <Download size={14} /> Generate Reports
          </button>
        </div>
      </div>

      {/* Financial Analytics Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Chart 1: Department-wise Fund Allocation & Utilization */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Department Fund Allocation vs Utilization</h3>
              <p className="card-subtitle">Values in Lakhs (₹) for Academic Year 2024-25</p>
            </div>
            <span className="badge badge-info">Active Sanctions</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {departments.map((dept) => {
                const allocLakhs = (dept.budget_allocated / 100000).toFixed(0);
                const utilLakhs = (dept.budget_utilized / 100000).toFixed(0);
                const pct = Math.round((dept.budget_utilized / dept.budget_allocated) * 100);

                return (
                  <div key={dept.dept_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                        {dept.name} ({dept.code})
                      </span>
                      <span style={{ color: 'var(--slate-600)' }}>
                        <strong>₹{utilLakhs}L</strong> / ₹{allocLakhs}L ({pct}%)
                      </span>
                    </div>
                    <div className="linear-progress-bar" style={{ height: '8px' }}>
                      <div
                        className="linear-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct > 85 ? 'linear-gradient(90deg, #2563eb, #1e40af)' : 'linear-gradient(90deg, #10b981, #059669)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
            <span>Total Sanctions: 6 Academic Departments</span>
            <span style={{ fontWeight: 600, color: 'var(--blue-700)', cursor: 'pointer' }} onClick={() => setActiveTab('departments')}>
              Manage Departments →
            </span>
          </div>
        </div>

        {/* Chart 2: Scheme Disbursements & AI Confidence Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Scheme Grant Pools & Utilization</h3>
              <p className="card-subtitle">Post-Matric, Vidya Siri, KIRG, EWS, Lab Grants</p>
            </div>
            <span className="badge badge-success">Govt Sponsored</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {schemes.map((scheme) => {
                const poolCr = (scheme.total_grant_pool / 10000000).toFixed(1);
                const disbursedCr = (scheme.disbursed_so_far / 10000000).toFixed(1);
                const pct = Math.round((scheme.disbursed_so_far / scheme.total_grant_pool) * 100);

                return (
                  <div key={scheme.scheme_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-800)' }} title={scheme.description}>
                        {scheme.name}
                      </span>
                      <span style={{ color: 'var(--slate-600)' }}>
                        <strong>₹{disbursedCr} Cr</strong> / ₹{poolCr} Cr ({pct}%)
                      </span>
                    </div>
                    <div className="linear-progress-bar" style={{ height: '8px' }}>
                      <div
                        className="linear-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #059669, #10b981)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
            <span>All disbursements tracked via APB / DBT Bridge</span>
            <span style={{ fontWeight: 600, color: 'var(--blue-700)', cursor: 'pointer' }} onClick={() => setActiveTab('schemes')}>
              View Scheme Master →
            </span>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Applications & Recent Bank Statements */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Applications Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Beneficiary Applications</h3>
              <p className="card-subtitle">AI risk scoring & Nadakacheri verification status</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('applications')}>
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table className="gov-data-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Student Name</th>
                  <th>Amount</th>
                  <th>AI Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.app_id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{app.app_id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.student_name}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>{app.scheme_name}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{app.amount_requested.toLocaleString('en-IN')}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: app.ai_risk_score > 50 ? 'var(--rose-50)' : app.ai_risk_score > 20 ? 'var(--amber-50)' : 'var(--emerald-50)',
                          color: app.ai_risk_score > 50 ? 'var(--rose-600)' : app.ai_risk_score > 20 ? 'var(--amber-600)' : 'var(--emerald-600)',
                        }}
                      >
                        {app.ai_risk_score}/100 Risk
                      </span>
                    </td>
                    <td>
                      <Badge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank Reconciliation Overview Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Quarterly Bank Reconciliation Feeds</h3>
              <p className="card-subtitle">Active accounts under {selectedUniversity}</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('upload-statements')}>
              All 18 Accounts
            </button>
          </div>
          <div className="table-responsive">
            <table className="gov-data-table">
              <thead>
                <tr>
                  <th>Bank</th>
                  <th>Account Type</th>
                  <th>Balance</th>
                  <th>Q2 Statement</th>
                  <th>AI Parser</th>
                </tr>
              </thead>
              <tbody>
                {bankAccounts.slice(0, 5).map((bank) => (
                  <tr key={bank.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BankLogo bankCode={bank.bank_code} bankName={bank.bank_name} size={24} />
                        <div>
                          <strong style={{ fontSize: '0.8rem' }}>{bank.bank_name}</strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                            {bank.account_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{bank.account_type}</td>
                    <td style={{ fontWeight: 700 }}>₹{(bank.current_balance / 100000).toFixed(1)}L</td>
                    <td>
                      <Badge type="statement" status={bank.statement_status} />
                    </td>
                    <td>
                      <Badge type="ai" status={bank.ai_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
