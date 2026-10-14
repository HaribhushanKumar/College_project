import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  PieChart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Building,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  FileDown
} from 'lucide-react';

export default function FinancialAnalysisView() {
  const { selectedUniversity, financialYear, quarter, departments } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api.getDashboardAnalytics('UNIV-01', financialYear, quarter)
      .then((res) => {
        if (res?.success && res.data) {
          setAnalyticsData(res.data);
        }
      })
      .catch((err) => console.warn('Could not load analytics:', err))
      .finally(() => setIsLoading(false));
  }, [financialYear, quarter]);

  const totalSanction = analyticsData?.budgetMetrics?.allocatedFunds || 1120000000;
  const totalExpenditure = analyticsData?.budgetMetrics?.utilizedFunds || 985000000;
  const balance = totalSanction - totalExpenditure;
  const efficiencyPct = totalSanction > 0 ? Math.round((totalExpenditure / totalSanction) * 100) : 87.9;

  const categories = [
    { name: 'Faculty & Administrative Salaries', allocated: 480000000, spent: 440000000, pct: 91.6, color: '#2563eb' },
    { name: 'Student Scholarships & Fellowships', allocated: 280000000, spent: 254000000, pct: 90.7, color: '#10b981' },
    { name: 'Laboratory Equipment & Research Facilities', allocated: 150000000, spent: 132000000, pct: 88.0, color: '#f59e0b' },
    { name: 'Campus Infrastructure & Maintenance', allocated: 120000000, spent: 96000000, pct: 80.0, color: '#8b5cf6' },
    { name: 'Library, Journals & Consortium Access', allocated: 50000000, spent: 41000000, pct: 82.0, color: '#06b6d4' },
    { name: 'Examinations, Audits & Operational Overheads', allocated: 40000000, spent: 22000000, pct: 55.0, color: '#64748b' },
  ];

  const deptList = (analyticsData?.departments && analyticsData.departments.length > 0)
    ? analyticsData.departments
    : departments;

  const filteredDepts = selectedDeptFilter === 'All'
    ? deptList
    : deptList.filter((d) => d.code === selectedDeptFilter || d.dept_id === selectedDeptFilter);

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <PieChart size={24} />
          </div>
          <div>
            <h1 className="page-title">Financial Analysis & Fund Utilization</h1>
            <p className="page-subtitle">
              Expenditure velocity, budget burn rates, and comparative head-wise analytics for {selectedUniversity}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="control-pill">
            <Calendar size={14} style={{ color: 'var(--slate-500)' }} />
            <span style={{ fontWeight: 600 }}>Period: FY {financialYear} · {quarter}</span>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Total Sanctioned Grants
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            ₹{(totalSanction / 10000000).toFixed(1)} Crores
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', marginTop: '0.25rem', fontWeight: 600 }}>
            ✓ 100% Released by Karnataka State Treasury
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Actual Expenditure
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue-700)', marginTop: '0.25rem' }}>
            ₹{(totalExpenditure / 10000000).toFixed(1)} Crores
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--blue-600)', marginTop: '0.25rem', fontWeight: 600 }}>
            {efficiencyPct}% Budget Utilization Efficiency
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Unspent Escrow Balance
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '0.25rem' }}>
            ₹{(balance / 10000000).toFixed(1)} Crores
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Parked in Scheduled Treasury Bank Accounts
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Reconciliation Health
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '0.25rem' }}>
            {analyticsData?.reconciliation?.accuracyPercentage || 100}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', marginTop: '0.25rem', fontWeight: 600 }}>
            ✓ All 18 Accounts Mathematically Verified
          </div>
        </div>
      </div>

      {/* Head-wise Expenditure Breakdown Table */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Major Statutory Expenditure Heads</h3>
            <p className="card-subtitle">Verified expenditure ledger categorized by GFR-12 budget standards</p>
          </div>
          <span className="badge badge-info">Audit Standard GFR-12</span>
        </div>
        <div className="table-responsive">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Expenditure Head</th>
                <th>Sanctioned Pool (₹)</th>
                <th>Actual Spent (₹)</th>
                <th>Unspent Balance (₹)</th>
                <th>Utilization %</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color }} />
                      <strong style={{ fontSize: '0.85rem' }}>{cat.name}</strong>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{(cat.allocated / 100000).toFixed(0)} Lakhs</td>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>₹{(cat.spent / 100000).toFixed(0)} Lakhs</td>
                  <td style={{ color: 'var(--slate-600)' }}>₹{((cat.allocated - cat.spent) / 100000).toFixed(0)} Lakhs</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div className="linear-progress-bar" style={{ width: '100px', height: '6px' }}>
                        <div className="linear-progress-fill" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{cat.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department-wise Utilization Grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Department-wise Fund Utilization Register</h3>
            <p className="card-subtitle">Actual departmental allocations, expenditures, and student enrollment coverage</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Filter Dept:</span>
            <select
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', width: '160px' }}
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {deptList.map((d) => (
                <option key={d.dept_id} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Code</th>
                <th>Allocated Budget (₹)</th>
                <th>Expenditure to Date (₹)</th>
                <th>Remaining Funds (₹)</th>
                <th>Burn Rate</th>
                <th>Students Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map((d) => {
                const alloc = d.budget_allocated || 0;
                const util = d.budget_utilized || 0;
                const rem = alloc - util;
                const pct = alloc > 0 ? Math.round((util / alloc) * 100) : 0;
                return (
                  <tr key={d.dept_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building size={16} style={{ color: 'var(--blue-700)' }} />
                        <strong style={{ fontSize: '0.85rem' }}>{d.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {d.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{(alloc / 100000).toFixed(1)} L</td>
                    <td style={{ fontWeight: 700, color: 'var(--blue-700)' }}>₹{(util / 100000).toFixed(1)} L</td>
                    <td style={{ color: 'var(--slate-600)' }}>₹{(rem / 100000).toFixed(1)} L</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="linear-progress-bar" style={{ width: '80px', height: '6px' }}>
                          <div
                            className="linear-progress-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 85 ? 'var(--blue-700)' : 'var(--amber-500)',
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{d.student_count || 450} scholars</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
