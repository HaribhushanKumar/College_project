import React from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, ArrowUpCircle, ArrowDownCircle, DollarSign, Download } from 'lucide-react';

export default function IncomeExpenditureView() {
  const { selectedUniversity, financialYear, quarter, addToast } = useApp();

  const receipts = [
    { title: 'Karnataka State Government Block Grant', code: 'REC-GOK-01', amount: 840000000, category: 'State Budgetary Support' },
    { title: 'Academic Tuition & Admission Fees', code: 'REC-FEE-02', amount: 185000000, category: 'Internal Revenue' },
    { title: 'Research Grants (DST, DBT, SERB, VGST)', code: 'REC-RES-03', amount: 62000000, category: 'Sponsored Research' },
    { title: 'Examination & Certification Receipts', code: 'REC-EXAM-04', amount: 48000000, category: 'Exam Cell' },
    { title: 'Bank Interest & Auto-Sweep Deposits', code: 'REC-INT-05', amount: 14500000, category: 'Financial Earnings' },
    { title: 'Endowment Donations & Alumni Fund', code: 'REC-END-06', amount: 9500000, category: 'Donations' },
  ];

  const payments = [
    { title: 'Academic Faculty & Staff Salaries', code: 'PAY-SAL-01', amount: 512000000, category: 'Revenue Expenditure' },
    { title: 'Student Scholarships & Direct Aid (DBT)', code: 'PAY-SCH-02', amount: 245000000, category: 'Welfare Direct Aid' },
    { title: 'Procurement of Laboratory Instruments', code: 'PAY-LAB-03', amount: 98000000, category: 'Capital Expenditure' },
    { title: 'Campus Power, Water & IT Internet Leased Lines', code: 'PAY-UTIL-04', amount: 42000000, category: 'Operations' },
    { title: 'Civil Works & Building Maintenance', code: 'PAY-CIV-05', amount: 38000000, category: 'Campus Works' },
    { title: 'Library Books & Electronic Subscriptions', code: 'PAY-LIB-06', amount: 18000000, category: 'Academic Resources' },
  ];

  const totalReceipts = receipts.reduce((acc, c) => acc + c.amount, 0);
  const totalPayments = payments.reduce((acc, c) => acc + c.amount, 0);
  const netSurplus = totalReceipts - totalPayments;

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="page-title">Income & Expenditure Statement</h1>
            <p className="page-subtitle">
              Audited ledger comparing operational receipts against institutional payments for {selectedUniversity}
            </p>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            addToast({
              title: 'Statement Exported',
              message: 'Audited Income & Expenditure ledger downloaded in Excel format.',
              type: 'info',
            });
          }}
        >
          <Download size={15} /> Export Ledger
        </button>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--emerald-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontSize: '0.8rem', fontWeight: 700 }}>
            <ArrowUpCircle size={18} /> TOTAL RECEIPTS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
            ₹{(totalReceipts / 10000000).toFixed(2)} Cr
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--rose-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose-600)', fontSize: '0.8rem', fontWeight: 700 }}>
            <ArrowDownCircle size={18} /> TOTAL PAYMENTS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
            ₹{(totalPayments / 10000000).toFixed(2)} Cr
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--blue-600)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue-700)' }}>
            NET OPERATING SURPLUS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--emerald-600)' }}>
            +₹{(netSurplus / 10000000).toFixed(2)} Cr
          </div>
        </div>
      </div>

      {/* Two Column Grid: Receipts vs Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem' }}>
        {/* Receipts Column */}
        <div className="card">
          <div className="card-header" style={{ backgroundColor: 'var(--emerald-50)' }}>
            <h3 className="card-title" style={{ color: 'var(--emerald-800)' }}>
              Revenue Receipts (Inflows)
            </h3>
            <span className="badge badge-success">₹{(totalReceipts / 10000000).toFixed(2)} Cr</span>
          </div>
          <div className="table-responsive">
            <table className="gov-data-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Classification</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{r.code}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{r.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--emerald-600)' }}>
                      ₹{(r.amount / 100000).toFixed(0)}L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Column */}
        <div className="card">
          <div className="card-header" style={{ backgroundColor: 'var(--rose-50)' }}>
            <h3 className="card-title" style={{ color: 'var(--rose-800)' }}>
              Expenditure Payments (Outflows)
            </h3>
            <span className="badge badge-danger">₹{(totalPayments / 10000000).toFixed(2)} Cr</span>
          </div>
          <div className="table-responsive">
            <table className="gov-data-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Classification</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{p.code}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{p.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--slate-900)' }}>
                      ₹{(p.amount / 100000).toFixed(0)}L
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
