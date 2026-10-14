import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let icon = <Info size={18} style={{ color: '#60a5fa' }} />;
        if (toast.type === 'success') {
          icon = <CheckCircle2 size={18} style={{ color: '#34d399' }} />;
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={18} style={{ color: '#fbbf24' }} />;
        } else if (toast.type === 'danger' || toast.type === 'error') {
          icon = <AlertCircle size={18} style={{ color: '#f87171' }} />;
        }

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <div style={{ flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#fff' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '2px' }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
