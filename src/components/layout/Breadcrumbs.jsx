import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const { activeTab, setActiveTab, selectedUniversity } = useApp();

  const tabLabels = {
    'dashboard': 'Executive Dashboard',
    'upload-statements': 'Quarterly Statement Upload',
    'ai-validation': 'AI Validation & Anomaly Detection',
    'bank-accounts': 'Bank Accounts Master',
    'disbursements': 'DBT & PFMS Disbursements',
    'financial-analysis': 'Financial Analysis & Analytics',
    'income-expenditure': 'Income & Expenditure Ledger',
    'fund-flow': 'Fund Flow Statement',
    'budget-grants': 'Budget Sanctions & Grants',
    'universities': 'Universities Directorate',
    'departments': 'Academic Departments',
    'faculty': 'Faculty Registry',
    'students': 'Student Database',
    'courses': 'Course Catalog',
    'registrations': 'Student Registrations',
    'schemes': 'Scholarship & Grant Schemes',
    'applications': 'Beneficiary Applications',
    'reports': 'Audit & Compliance Reports',
    'settings': 'System Configuration',
    'help-support': 'Helpdesk & Guidelines',
  };

  const currentLabel = tabLabels[activeTab] || 'Section';

  return (
    <nav className="breadcrumb-bar" aria-label="Breadcrumb">
      <div className="breadcrumb-item" onClick={() => setActiveTab('dashboard')}>
        <Home size={14} />
        <span>Higher Education</span>
      </div>
      <ChevronRight size={13} className="breadcrumb-separator" />
      <div className="breadcrumb-item">
        <span>{selectedUniversity}</span>
      </div>
      <ChevronRight size={13} className="breadcrumb-separator" />
      <div className="breadcrumb-item active">
        <span>{currentLabel}</span>
      </div>
    </nav>
  );
}
