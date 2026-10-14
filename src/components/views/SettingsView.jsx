import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, ShieldCheck, Sliders, Bell, Key, RotateCcw, Save } from 'lucide-react';

export default function SettingsView() {
  const { addToast, resetAllData } = useApp();

  const [aiThreshold, setAiThreshold] = useState(85);
  const [autoRejectThreshold, setAutoRejectThreshold] = useState(65);
  const [enableNadakacheri, setEnableNadakacheri] = useState(true);
  const [enableSevaSindhu, setEnableSevaSindhu] = useState(true);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    addToast({
      title: 'Configuration Saved',
      message: 'System audit and AI threshold parameters updated successfully.',
      type: 'success',
    });
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="page-title">System & AI Audit Configuration</h1>
            <p className="page-subtitle">
              Manage machine learning fraud detection thresholds, API endpoints, and DDO signatory authorities
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          {/* AI Auditing Thresholds */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Sliders size={18} style={{ color: 'var(--blue-700)' }} />
                <span>AI Risk Scoring Thresholds</span>
              </h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Confidence Threshold for Auto-Approval:
                  </label>
                  <strong style={{ color: 'var(--emerald-600)' }}>{aiThreshold}%</strong>
                </div>
                <input
                  type="range"
                  min="70"
                  max="99"
                  value={aiThreshold}
                  onChange={(e) => setAiThreshold(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                  Applications scoring above this threshold bypass manual scrutiny and queue for DBT.
                </span>
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    High-Risk Auto-Flagging Threshold:
                  </label>
                  <strong style={{ color: 'var(--rose-600)' }}>{autoRejectThreshold}/100</strong>
                </div>
                <input
                  type="range"
                  min="40"
                  max="80"
                  value={autoRejectThreshold}
                  onChange={(e) => setAutoRejectThreshold(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                  Applications with anomaly risk above this level are flagged for human auditor review.
                </span>
              </div>
            </div>
          </div>

          {/* Integration Services */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Key size={18} style={{ color: 'var(--blue-700)' }} />
                <span>Government API Connectors</span>
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enableNadakacheri}
                    onChange={(e) => setEnableNadakacheri(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Karnataka Nadakacheri Live Verification</strong>
                    <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                      Validates caste and income certificates against state revenue records in real-time.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enableSevaSindhu}
                    onChange={(e) => setEnableSevaSindhu(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Seva Sindhu Service Portal Gateway</strong>
                    <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                      Synchronizes state scholarship eligibility with citizen registration portal.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enableEmailAlerts}
                    onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Automated Audit Alert Notifications</strong>
                    <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                      Sends SMS/Email alerts to Finance Officer when statements are pending upload.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetAllData}
            style={{ color: 'var(--rose-600)' }}
          >
            <RotateCcw size={15} /> Reset All System Data to Defaults
          </button>

          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={16} /> Save Configuration Parameters
          </button>
        </div>
      </form>
    </div>
  );
}
