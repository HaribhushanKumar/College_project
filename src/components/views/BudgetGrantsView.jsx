import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, FileCheck, Download, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function BudgetGrantsView() {
  const { selectedUniversity, financialYear, addToast } = useApp();

  const grants = [
    {
      grant_id: 'GNT-RUSA-01',
      agency: 'Rashtriya Uchchatar Shiksha Abhiyan (RUSA)',
      title: 'Component 4 - Infrastructure Grants to State Universities',
      sanctioned_amount: 200000000,
      released_amount: 150000000,
      utilized_amount: 142000000,
      uc_status: 'Submitted & Certified',
      sanction_date: '2023-11-15',
    },
    {
      grant_id: 'GNT-UGC-02',
      agency: 'University Grants Commission (UGC)',
      title: 'General Development Assistance Scheme (XII Plan)',
      sanctioned_amount: 120000000,
      released_amount: 100000000,
      utilized_amount: 88000000,
      uc_status: 'Submitted & Certified',
      sanction_date: '2024-02-10',
    },
    {
      grant_id: 'GNT-DST-03',
      agency: 'Department of Science & Technology (DST-FIST)',
      title: 'Fund for Improvement of S&T Infrastructure (Physics & CSE)',
      sanctioned_amount: 65000000,
      released_amount: 65000000,
      utilized_amount: 58500000,
      uc_status: 'Audit in Progress',
      sanction_date: '2024-05-22',
    },
    {
      grant_id: 'GNT-GOK-04',
      agency: 'Govt of Karnataka - Dept of Higher Education',
      title: 'State University Modernization Special Grant',
      sanctioned_amount: 450000000,
      released_amount: 380000000,
      utilized_amount: 350000000,
      uc_status: 'Submitted & Certified',
      sanction_date: '2024-06-18',
    },
    {
      grant_id: 'GNT-CSR-05',
      agency: 'Infosys Foundation CSR Research Grant',
      title: 'Artificial Intelligence & Healthcare Informatics Laboratory',
      sanctioned_amount: 35000000,
      released_amount: 35000000,
      utilized_amount: 28000000,
      uc_status: 'Interim UC Due',
      sanction_date: '2024-07-30',
    },
  ];

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <Coins size={24} />
          </div>
          <div>
            <h1 className="page-title">Budget Sanctions & Grants Management</h1>
            <p className="page-subtitle">
              Central/State institutional grants, releases, and GFR-12A Utilization Certificates
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            addToast({
              title: 'New Grant Sanction Added',
              message: 'Grant entry form saved to registry.',
              type: 'success',
            });
          }}
        >
          <Plus size={16} /> Register New Grant Sanction
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Sanctioned Grants Registry</h3>
          <span className="badge badge-info">{grants.length} Active Schemes</span>
        </div>
        <div className="table-responsive">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Sanction ID</th>
                <th>Sponsoring Agency</th>
                <th>Scheme Title</th>
                <th>Sanctioned (₹)</th>
                <th>Released (₹)</th>
                <th>Utilized (₹)</th>
                <th>Utilization Certificate (UC)</th>
                <th style={{ textAlign: 'center' }}>UC Form</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((g) => (
                <tr key={g.grant_id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{g.grant_id}</td>
                  <td>
                    <strong>{g.agency}</strong>
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '0.8rem' }}>{g.title}</td>
                  <td style={{ fontWeight: 600 }}>₹{(g.sanctioned_amount / 100000).toFixed(0)}L</td>
                  <td style={{ fontWeight: 600, color: 'var(--blue-700)' }}>
                    ₹{(g.released_amount / 100000).toFixed(0)}L
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                    ₹{(g.utilized_amount / 100000).toFixed(0)}L
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: g.uc_status.includes('Submitted') ? 'var(--emerald-50)' : 'var(--amber-50)',
                        color: g.uc_status.includes('Submitted') ? 'var(--emerald-600)' : 'var(--amber-600)',
                      }}
                    >
                      {g.uc_status.includes('Submitted') ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {g.uc_status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        addToast({
                          title: 'Downloading GFR-12A UC',
                          message: `Generated official Utilization Certificate for ${g.grant_id}.`,
                          type: 'info',
                        });
                      }}
                    >
                      <Download size={13} /> GFR-12A
                    </button>
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
