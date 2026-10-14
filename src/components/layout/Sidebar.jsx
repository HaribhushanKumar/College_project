import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  UploadCloud,
  Sparkles,
  Building,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  Award,
  FileCheck2,
  Landmark,
  CreditCard,
  PieChart,
  Receipt,
  ArrowRightLeft,
  Coins,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    bankAccounts,
    applications,
    anomalies
  } = useApp();

  const pendingStatements = bankAccounts.filter((a) => a.statement_status !== 'Uploaded').length;
  const flaggedCount = applications.filter((a) => a.ai_validation_status === 'Flagged').length;

  const navSections = [
    {
      title: 'Core Operations',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'upload-statements',
          label: 'Upload Statements',
          icon: UploadCloud,
          badge: pendingStatements > 0 ? `${pendingStatements} Pending` : null,
          badgeType: 'alert',
        },
        {
          id: 'ai-validation',
          label: 'AI Validation',
          icon: Sparkles,
          badge: flaggedCount > 0 ? `${flaggedCount} Flags` : null,
          badgeType: 'alert',
        },
      ],
    },
    {
      title: 'Financial & Accounts',
      items: [
        {
          id: 'bank-accounts',
          label: 'Bank Accounts',
          icon: Landmark,
        },
        {
          id: 'disbursements',
          label: 'Disbursements',
          icon: CreditCard,
        },
        {
          id: 'financial-analysis',
          label: 'Financial Analysis',
          icon: PieChart,
        },
        {
          id: 'income-expenditure',
          label: 'Income & Expenditure',
          icon: Receipt,
        },
        {
          id: 'fund-flow',
          label: 'Fund Flow',
          icon: ArrowRightLeft,
        },
        {
          id: 'budget-grants',
          label: 'Budget & Grants',
          icon: Coins,
        },
      ],
    },
    {
      title: 'University Entities',
      items: [
        {
          id: 'universities',
          label: 'Universities',
          icon: Building2,
        },
        {
          id: 'departments',
          label: 'Departments',
          icon: Building,
        },
        {
          id: 'faculty',
          label: 'Faculty',
          icon: Users,
        },
        {
          id: 'students',
          label: 'Students',
          icon: GraduationCap,
        },
        {
          id: 'courses',
          label: 'Courses',
          icon: BookOpen,
        },
        {
          id: 'registrations',
          label: 'Registrations',
          icon: ClipboardList,
        },
        {
          id: 'schemes',
          label: 'Schemes',
          icon: Award,
        },
        {
          id: 'applications',
          label: 'Applications',
          icon: FileCheck2,
          badge: applications.length.toString(),
        },
      ],
    },
    {
      title: 'Governance & Settings',
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: FileSpreadsheet,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
        },
        {
          id: 'help-support',
          label: 'Help & Support',
          icon: HelpCircle,
        },
      ],
    },
  ];

  return (
    <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isSidebarCollapsed && (
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">UFM & AI Validation</span>
              <span className="sidebar-brand-subtitle">Govt of Karnataka</span>
            </div>
          </div>
        )}

        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="sidebar-content">
        {navSections.map((sec, idx) => (
          <div key={idx} className="nav-section">
            {!isSidebarCollapsed && (
              <div className="nav-section-title">{sec.title}</div>
            )}
            <ul className="nav-list">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="nav-icon" />
                      {!isSidebarCollapsed && (
                        <>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {item.badge && (
                            <span
                              className={`nav-badge ${
                                item.badgeType === 'alert' ? 'alert' : ''
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      {!isSidebarCollapsed && (
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-500)',
                boxShadow: '0 0 6px var(--emerald-500)',
              }}
            />
            <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)' }}>
              AI Auditor Engine: <strong style={{ color: '#fff' }}>v3.2 Online</strong>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
