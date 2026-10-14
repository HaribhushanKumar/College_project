import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  Landmark,
  Award,
  GraduationCap,
  FileCheck2,
  Building,
  ArrowRight
} from 'lucide-react';

export default function GlobalSearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    bankAccounts,
    schemes,
    students,
    applications,
    departments,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Listen for keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingBanks = q
    ? bankAccounts.filter(
        (b) =>
          b.bank_name.toLowerCase().includes(q) ||
          b.account_number.includes(q) ||
          b.account_type.toLowerCase().includes(q)
      )
    : [];

  const matchingSchemes = q
    ? schemes.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q)
      )
    : [];

  const matchingStudents = q
    ? students.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.enrollment_no.toLowerCase().includes(q)
      )
    : [];

  const matchingApps = q
    ? applications.filter(
        (a) =>
          a.app_id.toLowerCase().includes(q) ||
          a.student_name.toLowerCase().includes(q) ||
          a.scheme_name.toLowerCase().includes(q)
      )
    : [];

  const matchingDepts = q
    ? departments.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchingBanks.length +
    matchingSchemes.length +
    matchingStudents.length +
    matchingApps.length +
    matchingDepts.length;

  const handleSelect = (tab) => {
    setActiveTab(tab);
    setIsSearchOpen(false);
    setQuery('');
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsSearchOpen(false)}
      style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
    >
      <div
        className="modal-dialog lg"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--slate-200)',
            backgroundColor: '#fff',
          }}
        >
          <Search size={20} style={{ color: 'var(--slate-400)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search bank accounts, students, applications, schemes, departments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--slate-900)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate-400)',
              }}
            >
              <X size={16} />
            </button>
          )}
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.2rem 0.4rem',
              backgroundColor: 'var(--slate-100)',
              borderRadius: '4px',
              border: '1px solid var(--slate-200)',
              color: 'var(--slate-500)',
              fontWeight: 600,
            }}
          >
            ESC to close
          </span>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem' }}>
          {!query ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--slate-400)' }}>
              <p style={{ fontSize: '0.875rem' }}>Type a keyword to search across university databases.</p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  className="badge badge-neutral"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setQuery('State Bank')}
                >
                  SBI
                </span>
                <span
                  className="badge badge-neutral"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setQuery('Scholarship')}
                >
                  Scholarship
                </span>
                <span
                  className="badge badge-neutral"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setQuery('Computer Science')}
                >
                  Computer Science
                </span>
                <span
                  className="badge badge-neutral"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setQuery('Kavya')}
                >
                  Kavya
                </span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>
              No matches found for "{query}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Banks */}
              {matchingBanks.length > 0 && (
                <div>
                  <div className="nav-section-title" style={{ padding: '0 0.25rem 0.35rem 0.25rem' }}>
                    Bank Accounts ({matchingBanks.length})
                  </div>
                  {matchingBanks.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelect('upload-statements')}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Landmark size={16} style={{ color: 'var(--blue-700)' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{b.bank_name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '0.5rem' }}>
                            {b.account_number} ({b.account_type})
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Applications */}
              {matchingApps.length > 0 && (
                <div>
                  <div className="nav-section-title" style={{ padding: '0 0.25rem 0.35rem 0.25rem' }}>
                    Applications ({matchingApps.length})
                  </div>
                  {matchingApps.map((a) => (
                    <div
                      key={a.app_id}
                      onClick={() => handleSelect('applications')}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileCheck2 size={16} style={{ color: 'var(--emerald-600)' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{a.app_id}</strong> - {a.student_name}
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>
                            {a.scheme_name} · ₹{a.amount_requested.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Schemes */}
              {matchingSchemes.length > 0 && (
                <div>
                  <div className="nav-section-title" style={{ padding: '0 0.25rem 0.35rem 0.25rem' }}>
                    Schemes ({matchingSchemes.length})
                  </div>
                  {matchingSchemes.map((s) => (
                    <div
                      key={s.scheme_id}
                      onClick={() => handleSelect('schemes')}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Award size={16} style={{ color: 'var(--amber-600)' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{s.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>
                            Max: ₹{s.max_amount.toLocaleString('en-IN')} · {s.code}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Students */}
              {matchingStudents.length > 0 && (
                <div>
                  <div className="nav-section-title" style={{ padding: '0 0.25rem 0.35rem 0.25rem' }}>
                    Students ({matchingStudents.length})
                  </div>
                  {matchingStudents.map((st) => (
                    <div
                      key={st.student_id}
                      onClick={() => handleSelect('students')}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <GraduationCap size={16} style={{ color: 'var(--blue-600)' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{st.name}</strong> ({st.enrollment_no})
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>
                            {st.category} · {st.phone}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
