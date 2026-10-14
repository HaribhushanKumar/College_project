import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileText, Sparkles, AlertCircle } from 'lucide-react';

export default function Badge({ status, type = 'default', text, size = 'md' }) {
  const normalized = (status || text || '').toLowerCase();

  // Statement Status badge
  if (type === 'statement') {
    if (normalized === 'uploaded') {
      return (
        <span className="badge badge-success" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <FileText size={13} strokeWidth={2.4} />
          {text || 'Uploaded'}
        </span>
      );
    }
    if (normalized === 'processing') {
      return (
        <span className="badge badge-warning" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <Clock size={13} strokeWidth={2.4} />
          {text || 'Processing'}
        </span>
      );
    }
    if (normalized === 'pending') {
      return (
        <span className="badge badge-danger" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <AlertCircle size={13} strokeWidth={2.4} />
          {text || 'Pending'}
        </span>
      );
    }
    return (
      <span className="badge badge-neutral" style={{ gap: '0.4rem' }}>
        <span className="badge-dot" />
        {text || 'Not Started'}
      </span>
    );
  }

  // AI Processing badge
  if (type === 'ai') {
    if (normalized === 'completed') {
      return (
        <span className="badge badge-success" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <CheckCircle2 size={13} strokeWidth={2.5} />
          Completed
        </span>
      );
    }
    if (normalized === 'in progress' || normalized === 'processing') {
      return (
        <span className="badge badge-warning" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <Clock size={13} strokeWidth={2.4} />
          In Progress
        </span>
      );
    }
    if (normalized === 'flagged') {
      return (
        <span className="badge badge-danger" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <AlertTriangle size={13} strokeWidth={2.4} />
          Flagged
        </span>
      );
    }
    if (normalized === 'verified') {
      return (
        <span className="badge badge-success" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <Sparkles size={13} strokeWidth={2.4} />
          AI Verified
        </span>
      );
    }
    return (
      <span style={{ color: 'var(--slate-400)', fontSize: '0.85rem', fontWeight: 600 }}>
        —
      </span>
    );
  }

  // General Status badge
  if (normalized.includes('approved') || normalized.includes('completed') || normalized.includes('active')) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={12} />
        {text || status}
      </span>
    );
  }
  if (normalized.includes('progress') || normalized.includes('review') || normalized.includes('queued')) {
    return (
      <span className="badge badge-warning">
        <Clock size={12} />
        {text || status}
      </span>
    );
  }
  if (normalized.includes('reject') || normalized.includes('danger') || normalized.includes('fail') || normalized.includes('dropped')) {
    return (
      <span className="badge badge-danger">
        <XCircle size={12} />
        {text || status}
      </span>
    );
  }
  if (normalized.includes('validated') || normalized.includes('verified')) {
    return (
      <span className="badge badge-info">
        <Sparkles size={12} />
        {text || status}
      </span>
    );
  }

  return (
    <span className="badge badge-neutral">
      <span className="badge-dot" />
      {text || status}
    </span>
  );
}
