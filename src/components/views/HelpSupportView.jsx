import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, FileText, CheckCircle2, PhoneCall, Mail, MessageSquare, Send } from 'lucide-react';

export default function HelpSupportView() {
  const { addToast } = useApp();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    addToast({
      title: 'Support Ticket Raised',
      message: `Ticket #${Math.floor(Math.random() * 9000) + 1000} registered with Higher Education Helpdesk.`,
      type: 'success',
    });
    setTicketSubject('');
    setTicketMessage('');
  };

  const faqs = [
    {
      q: 'What file formats are accepted for quarterly bank statement uploads?',
      a: 'The system natively parses digital PDF statements generated directly from bank net banking, Microsoft Excel (.xlsx), and Comma Separated (.csv) files. Scanned photo copies are passed to BankRecon OCR engine.',
    },
    {
      q: 'How does the AI model validate student scholarship eligibility?',
      a: 'The ScholarCheck model cross-verifies the student income certificate directly with Karnataka Nadakacheri API, verifies biometric Aadhaar seeding via NPCI APB bridge, and checks university attendance minimums.',
    },
    {
      q: 'What should I do if a bank statement is marked with an anomaly flag?',
      a: 'Click on the "View" button in the Bank Account Statements table to inspect flagged line items. You may either upload a corrected ledger or provide auditor explanatory notes before submitting for review.',
    },
    {
      q: 'Can multiple statements be uploaded simultaneously?',
      a: 'Yes, use the "Bulk upload" button at the top right of the Bank Account Statements table. You can drag and drop multiple PDF/Excel statements; the AI NLP engine automatically matches each file to its account number.',
    },
  ];

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <HelpCircle size={24} />
          </div>
          <div>
            <h1 className="page-title">Helpdesk, Upload Guidelines & Support</h1>
            <p className="page-subtitle">
              Standard operating procedures for quarterly reconciliation and technical assistance
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Upload Guidelines */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={18} style={{ color: 'var(--blue-700)' }} />
              <span>Bank Statement Upload Standards</span>
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Mandatory Columns:</strong>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.8rem' }}>
                    Statement must contain Date, Description/Particulars, Ref/Chq No, Debit (Withdrawal), Credit (Deposit), and Closing Balance.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Date Range:</strong>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.8rem' }}>
                    Ensure the statement encompasses the entire quarter (e.g., July 1 to September 30 for Q2).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Official Digital Signature:</strong>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.8rem' }}>
                    Statements generated directly from bank net banking portals have embedded hashes and parse faster than scanned paper receipts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Raise Support Ticket */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MessageSquare size={18} style={{ color: 'var(--blue-700)' }} />
              <span>Raise Support Ticket to Higher Education Dept</span>
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmitTicket}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Issue with Bank of Baroda Q2 Statement parsing"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Query Details</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe the discrepancy or technical error..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={15} /> Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Frequently Asked Questions</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--slate-100)' : 'none', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {f.q}
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginTop: '0.25rem', lineHeight: '1.5' }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
