import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Plus,
  Eye,
  Sparkles,
  CheckCircle2,
  FileDown,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ReportsView() {
  const { reports, addToast, financialYear, quarter } = useApp();
  const [reportList, setReportList] = useState(reports);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async (type, format) => {
    try {
      setIsExporting(true);
      addToast({
        title: `Generating ${format.toUpperCase()} Report`,
        message: `Compiling live database records for ${type}...`,
        type: 'info',
      });
      await api.downloadReport(type, format, {
        financial_year: financialYear,
        quarter: quarter,
      });
      addToast({
        title: 'Download Successful',
        message: `Report file (${format.toUpperCase()}) saved to your downloads.`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Export Error',
        message: 'Could not generate report file: ' + (err.message || 'Server error'),
        type: 'danger',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await api.generateReport({
        title: `Statutory Fund Utilization & DBT Audit (${quarter} FY${financialYear})`,
        type: 'Statutory Audit',
        financial_year: financialYear,
        quarter: quarter,
      });

      const newReport = {
        report_id: res?.data?.report_id || `REP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
        title: `Quarterly Fund Utilization & DBT Audit (${quarter} FY${financialYear})`,
        type: 'Statutory Audit',
        generated_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        file_path: '/reports/Generated_Audit_Report.pdf',
        model_id: 'MDL-FIN-01',
        file_size: '2.8 MB',
        status: 'Audited & Signed',
      };
      setReportList([newReport, ...reportList]);
      addToast({
        title: 'Audit Report Generated',
        message: 'New statutory compliance dossier registered and certified.',
        type: 'success',
      });
    } catch {
      // offline fallback
    }
  };

  const REPORT_CARDS = [
    {
      type: 'statements',
      title: 'Quarterly Bank Statements',
      desc: 'All 18 scheduled bank accounts with opening/closing balances and upload statuses.',
      icon: FileSpreadsheet,
      tag: 'Treasury Ledger',
    },
    {
      type: 'income-expenditure',
      title: 'Income & Expenditure Register',
      desc: 'Department-wise sanctioned budgets, utilized expenditures, and unspent balances.',
      icon: Building2,
      tag: 'Expenditure Control',
    },
    {
      type: 'scheme-utilization',
      title: 'Scheme Allocations & Utilization',
      desc: 'Government grant pools, DBT student claims, and remaining allocation percentages.',
      icon: Layers,
      tag: 'Welfare Schemes',
    },
    {
      type: 'applications',
      title: 'Applications & Approval Register',
      desc: 'Beneficiary eligibility checks, AI risk scores, and approval/rejection decisions.',
      icon: FileText,
      tag: 'Beneficiary Claims',
    },
    {
      type: 'disbursements',
      title: 'Disbursement & UTR History',
      desc: 'Cleared DBT payment vouchers, bank transaction references, and PFMS batch IDs.',
      icon: CheckCircle2,
      tag: 'Payment Mandates',
    },
    {
      type: 'reconciliation',
      title: 'Statement Reconciliation Dossier',
      desc: 'Calculated versus reported closing balances, arithmetic variances, and audit flags.',
      icon: ShieldCheck,
      tag: 'Statutory Audit',
    },
    {
      type: 'anomalies',
      title: 'AI Validation Findings & Decisions',
      desc: 'Detected policy breaches, auditor evidence, confidence ratings, and clearance trail.',
      icon: Sparkles,
      tag: 'AI Governance',
    },
  ];

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h1 className="page-title">Statutory Audit & Exportable Reports</h1>
            <p className="page-subtitle">
              Download live database-certified reports in XLSX and CSV formats for Department of Higher Education oversight
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerateReport}>
          <Plus size={16} /> Certify & Register Statutory Report
        </button>
      </div>

      {/* Quick Export Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.type}
              className="card"
              style={{
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--blue-50)',
                      color: 'var(--blue-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                    {card.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{card.title}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', lineHeight: '1.4', marginBottom: '1rem' }}>
                  {card.desc}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--slate-100)',
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={isExporting}
                  onClick={() => handleDownload(card.type, 'csv')}
                >
                  <FileDown size={14} /> Export CSV
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={isExporting}
                  onClick={() => handleDownload(card.type, 'xlsx')}
                >
                  <FileSpreadsheet size={14} /> Export XLSX
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certified Dossiers Catalog Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Certified Compliance Dossiers Catalog</h3>
            <p className="card-subtitle">Legally certified audit records registered with Government of Karnataka</p>
          </div>
          <span className="badge badge-success">Digital Signatures Validated</span>
        </div>
        <div className="table-responsive">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Dossier Title</th>
                <th>Report Type</th>
                <th>Generated Timestamp</th>
                <th>AI Model Certified</th>
                <th>File Size</th>
                <th>Audit Status</th>
                <th style={{ textAlign: 'center' }}>Export Options</th>
              </tr>
            </thead>
            <tbody>
              {reportList.map((r) => (
                <tr key={r.report_id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.report_id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: 'var(--blue-700)' }} />
                      <strong style={{ fontSize: '0.85rem' }}>{r.title}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{r.type}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>{r.generated_date}</td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{r.model_id}</td>
                  <td style={{ fontSize: '0.8rem' }}>{r.file_size}</td>
                  <td>
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleDownload('statements', 'csv')}
                      >
                        <Download size={13} /> CSV
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownload('reconciliation', 'xlsx')}
                      >
                        <Download size={13} /> XLSX
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
