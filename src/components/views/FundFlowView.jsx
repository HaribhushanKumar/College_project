import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw, Landmark } from 'lucide-react';

export default function FundFlowView() {
  const { selectedUniversity, financialYear } = useApp();

  const quarters = [
    { name: 'Q1 (Apr - Jun)', inflow: 38.5, outflow: 32.1, net: 6.4 },
    { name: 'Q2 (Jul - Sep)', inflow: 45.2, outflow: 39.8, net: 5.4 },
    { name: 'Q3 (Oct - Dec - Projected)', inflow: 31.0, outflow: 28.5, net: 2.5 },
    { name: 'Q4 (Jan - Mar - Projected)', inflow: 27.3, outflow: 24.6, net: 2.7 },
  ];

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <h1 className="page-title">Fund Flow Statement</h1>
            <p className="page-subtitle">
              Macro capital & operational cash movements across university treasury escrow accounts
            </p>
          </div>
        </div>
      </div>

      {/* Quarterly Cash Flow Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {quarters.map((q, idx) => (
          <div key={idx} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
              {q.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>Inflow:</span>
              <strong style={{ color: 'var(--emerald-600)' }}>+₹{q.inflow} Cr</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.45rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>Outflow:</span>
              <strong style={{ color: 'var(--rose-600)' }}>-₹{q.outflow} Cr</strong>
            </div>
            <div style={{ paddingTop: '0.45rem', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600 }}>Net Position:</span>
              <strong style={{ color: 'var(--blue-700)' }}>+₹{q.net} Cr</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Source vs Application Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Statement of Sources & Application of Working Funds</h3>
          <span className="badge badge-info">Audited Treasury Format</span>
        </div>
        <div className="table-responsive">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Sources of Working Capital</th>
                <th style={{ width: '50%' }}>Application of Working Capital</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Operations Surplus (Excess of Income over Expenditure)</span>
                      <strong>₹12.45 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Karnataka State Special Development Capital Grants</span>
                      <strong>₹25.00 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>RUSA Infrastructure Modernization Sanction</span>
                      <strong>₹15.00 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Corporate CSR Research Endowments</span>
                      <strong>₹2.80 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '0.5rem', fontWeight: 800 }}>
                      <span>Total Sources of Funds</span>
                      <span style={{ color: 'var(--emerald-600)' }}>₹55.25 Cr</span>
                    </div>
                  </div>
                </td>
                <td style={{ verticalAlign: 'top', padding: '1.25rem', borderLeft: '1px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Purchase of Fixed Assets (High Performance Lab Servers)</span>
                      <strong>₹18.20 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Repayment of Long-term Building Loans (HUDCO)</span>
                      <strong>₹8.50 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Student Welfare Endowment Corpus Investment</span>
                      <strong>₹10.00 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Net Increase in Working Capital Liquid Balances</span>
                      <strong>₹18.55 Cr</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '0.5rem', fontWeight: 800 }}>
                      <span>Total Applications of Funds</span>
                      <span style={{ color: 'var(--blue-700)' }}>₹55.25 Cr</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
