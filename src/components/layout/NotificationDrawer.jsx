import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCheck, Bell, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function NotificationDrawer() {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    setNotifications,
    setActiveTab
  } = useApp();

  if (!isNotificationOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={18} style={{ color: 'var(--rose-600)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--amber-600)' }} />;
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--emerald-600)' }} />;
      default:
        return <Info size={18} style={{ color: 'var(--blue-600)' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 110,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={() => setIsNotificationOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--slate-50)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Bell size={18} style={{ color: 'var(--blue-700)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Notifications & Alerts</h3>
          </div>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setIsNotificationOpen(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Toolbar */}
        <div
          style={{
            padding: '0.65rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--slate-100)',
            backgroundColor: '#fff',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            {notifications.filter((n) => !n.read).length} Unread Alerts
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--blue-700)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
            <button
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate-400)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Drawer List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
              <Bell size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, color: 'var(--slate-600)' }}>No notifications</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>All systems and reconciliations are clear.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid',
                    borderColor: item.read ? 'var(--slate-200)' : 'var(--blue-200)',
                    backgroundColor: item.read ? 'var(--white)' : 'var(--blue-50)',
                    display: 'flex',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => {
                    if (item.title.includes('Statement')) {
                      setActiveTab('upload-statements');
                    } else if (item.title.includes('Anomaly')) {
                      setActiveTab('ai-validation');
                    }
                    setIsNotificationOpen(false);
                  }}
                >
                  <div style={{ marginTop: '0.15rem' }}>{getIcon(item.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: item.read ? 600 : 700,
                        color: 'var(--slate-900)',
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: '0.35rem' }}>
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
