import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import KarnatakaEmblem from '../common/KarnatakaEmblem';
import {
  Bell,
  Search,
  ChevronDown,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  LogOut,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const {
    selectedUniversity,
    setSelectedUniversity,
    financialYear,
    setFinancialYear,
    quarter,
    setQuarter,
    notifications,
    setIsSearchOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    resetAllData,
    universities,
    currentUser,
    switchUser,
    isBackendConnected,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const userInitials = (currentUser?.full_name || 'Dr. R. Manjunath')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Karnataka Emblem & Title */}
        <div className="gov-emblem-badge">
          <KarnatakaEmblem size={38} />
          <div className="emblem-text">
            <span className="emblem-dept">Department of Higher Education</span>
            <span className="emblem-sub">Government of Karnataka</span>
          </div>
        </div>

        {/* University Switcher */}
        <div className="university-selector" title="Select University Jurisdiction">
          <Building2 size={16} style={{ color: 'var(--blue-700)' }} />
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            aria-label="Select University"
          >
            {universities.map((u) => (
              <option key={u.university_id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ color: 'var(--slate-500)' }} />
        </div>
      </div>

      <div className="header-right">
        {/* Backend Status indicator */}
        <div
          className="control-pill"
          style={{
            fontSize: '0.75rem',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            backgroundColor: isBackendConnected ? 'var(--emerald-50)' : 'var(--slate-100)',
            color: isBackendConnected ? 'var(--emerald-700)' : 'var(--slate-600)',
            border: `1px solid ${isBackendConnected ? 'var(--emerald-200)' : 'var(--slate-200)'}`,
          }}
          title={isBackendConnected ? 'Connected to Express & SQLite Server' : 'Working locally / offline fallback'}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isBackendConnected ? 'var(--emerald-600)' : 'var(--amber-500)',
            }}
          />
          <span>{isBackendConnected ? 'Live DB' : 'Local'}</span>
        </div>

        {/* Global Search Bar Button */}
        <button
          className="search-trigger"
          onClick={() => setIsSearchOpen(true)}
          title="Search anything (Press Ctrl+K)"
        >
          <Search size={15} />
          <span>Search accounts, schemes...</span>
          <span className="search-key">⌘K</span>
        </button>

        {/* Quick FY & Quarter Indicator in Header */}
        <div className="control-pill header-period-pill">
          <Calendar size={14} style={{ color: 'var(--slate-500)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--slate-700)' }}>
            FY {financialYear} · {quarter.split(' ')[0]}
          </span>
        </div>

        {/* Notification Bell with Badge */}
        <button
          className="btn btn-secondary btn-icon"
          style={{ position: 'relative' }}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          aria-label="Notifications"
          title="Audit & Validation Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: 'var(--rose-600)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '9999px',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px #fff',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-menu"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className="user-avatar">{userInitials}</div>
            <div className="user-info">
              <span className="user-name">{currentUser?.full_name || 'Dr. R. Manjunath'}</span>
              <span className="user-role">{currentUser?.role || 'Finance Officer'}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--slate-400)' }} />
          </div>

          {/* Profile Dropdown & Role Switcher */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '260px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 50,
              }}
              onMouseLeave={() => setIsProfileMenuOpen(false)}
            >
              <div
                style={{
                  padding: '0.65rem 0.75rem',
                  borderBottom: '1px solid var(--slate-100)',
                  marginBottom: '0.35rem',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-900)' }}>
                  {currentUser?.full_name}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                  {currentUser?.email}
                </div>
                <div style={{ marginTop: '0.35rem' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                    <ShieldCheck size={11} /> Role: {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* RBAC Role Switcher */}
              <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', color: 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                Switch RBAC Role (Test Login)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.5rem' }}>
                {[
                  'Finance Officer',
                  'Super Admin',
                  'University Admin',
                  'Validator',
                  'Read-Only Auditor',
                ].map((role) => (
                  <button
                    key={role}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: currentUser?.role === role ? 'var(--blue-50)' : 'transparent',
                      color: currentUser?.role === role ? 'var(--blue-700)' : 'var(--slate-700)',
                      fontWeight: currentUser?.role === role ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      switchUser(role);
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <span>{role}</span>
                    {currentUser?.role === role && <span style={{ fontSize: '0.7rem' }}>✓ Active</span>}
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.35rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', fontSize: '0.8rem' }}
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    resetAllData();
                  }}
                >
                  <RotateCcw size={14} /> Reset Demo Data
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', fontSize: '0.8rem', color: 'var(--rose-600)' }}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <LogOut size={14} /> Exit Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
