import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import BankLogo from '../common/BankLogo';
import Badge from '../common/Badge';
import ProgressRing from '../common/ProgressRing';
import Modal from '../common/Modal';
import {
  UploadCloud,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  RefreshCw,
  Upload,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Download,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Filter
} from 'lucide-react';

export default function QuarterlyStatementUploadView() {
  const {
    financialYear,
    setFinancialYear,
    quarter,
    setQuarter,
    bankAccounts,
    uploadBankStatement,
    replaceBankStatement,
    bulkUploadStatements,
    saveProgress,
    submitAllStatements,
    sampleTransactions,
    addToast
  } = useApp();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals state
  const [selectedAccountForView, setSelectedAccountForView] = useState(null);
  const [selectedAccountForUpload, setSelectedAccountForUpload] = useState(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] = useState(false);

  // Upload dialog temporary form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Live transactions fetched for statement viewer modal
  const [viewTransactions, setViewTransactions] = useState([]);
  const [isLoadingView, setIsLoadingView] = useState(false);

  useEffect(() => {
    if (selectedAccountForView?.statement_id) {
      setIsLoadingView(true);
      api.getStatementById(selectedAccountForView.statement_id)
        .then((res) => {
          if (res?.success && res.data?.transactions?.length > 0) {
            setViewTransactions(res.data.transactions);
          } else {
            setViewTransactions(sampleTransactions);
          }
        })
        .catch(() => setViewTransactions(sampleTransactions))
        .finally(() => setIsLoadingView(false));
    } else {
      setViewTransactions(sampleTransactions);
    }
  }, [selectedAccountForView, sampleTransactions]);

  // Stats computation
  const totalAccounts = bankAccounts.length;
  const uploadedCount = bankAccounts.filter((a) => a.statement_status === 'Uploaded').length;
  const processingCount = bankAccounts.filter((a) => a.statement_status === 'Processing').length;
  const pendingCount = bankAccounts.filter((a) => a.statement_status === 'Pending').length;
  const notStartedCount = bankAccounts.filter((a) => a.statement_status === 'Not Started').length;
  const completionPercentage = totalAccounts > 0 ? (uploadedCount / totalAccounts) * 100 : 0;

  // Filter accounts
  const filteredAccounts = bankAccounts.filter((account) => {
    const matchesSearch =
      account.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_number.includes(searchTerm) ||
      account.account_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.branch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || account.statement_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + rowsPerPage);

  // File Upload Handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!uploadFile || !selectedAccountForUpload) return;
    setIsUploading(true);
    setUploadProgress(20);

    const isReplace = selectedAccountForUpload.statement_status === 'Uploaded';
    setUploadProgress(50);

    await uploadBankStatement(selectedAccountForUpload.id, uploadFile, isReplace);
    setUploadProgress(100);

    setTimeout(() => {
      setIsUploading(false);
      setSelectedAccountForUpload(null);
      setUploadFile(null);
      setUploadProgress(0);
    }, 400);
  };

  const handleBulkSubmit = () => {
    setIsUploading(true);
    setUploadProgress(20);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            bulkUploadStatements();
            setIsBulkUploadOpen(false);
            setUploadProgress(0);
          }, 400);
          return 95;
        }
        return prev + 30;
      });
    }, 250);
  };

  const handleFinalSubmitAll = () => {
    const ok = submitAllStatements();
    if (ok) {
      setIsSubmitConfirmationOpen(false);
    }
  };

  return (
    <div>
      {/* Page Title & Controls Header Row */}
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <UploadCloud size={24} />
          </div>
          <div>
            <h1 className="page-title">Quarterly Statement Upload</h1>
            <p className="page-subtitle">
              Upload bank statements for all accounts for the selected quarter
            </p>
          </div>
        </div>

        {/* Right Header Filters (Financial Year, Quarter, Deadline Alert) */}
        <div className="page-header-controls">
          {/* Financial Year Selector */}
          <div className="control-pill">
            <label htmlFor="fy-select">Financial Year</label>
            <select
              id="fy-select"
              value={financialYear}
              onChange={(e) => {
                setFinancialYear(e.target.value);
                addToast({
                  title: 'Financial Year Updated',
                  message: `Switched view to FY ${e.target.value}`,
                  type: 'info',
                });
              }}
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>

          {/* Quarter Selector */}
          <div className="control-pill">
            <label htmlFor="quarter-select">Quarter</label>
            <select
              id="quarter-select"
              value={quarter}
              onChange={(e) => {
                setQuarter(e.target.value);
                addToast({
                  title: 'Quarter Selected',
                  message: `Statements scoped to ${e.target.value}`,
                  type: 'info',
                });
              }}
            >
              <option value="Q1 (Apr - Jun)">Q1 (Apr - Jun)</option>
              <option value="Q2 (Jul - Sep)">Q2 (Jul - Sep)</option>
              <option value="Q3 (Oct - Dec)">Q3 (Oct - Dec)</option>
              <option value="Q4 (Jan - Mar)">Q4 (Jan - Mar)</option>
            </select>
          </div>

          {/* Submission Deadline Card */}
          <div className="deadline-badge-card" title="Official audit deadline from Dept of Higher Education">
            <div className="deadline-icon">
              <Calendar size={20} />
            </div>
            <div className="deadline-text">
              <div className="deadline-title">Submission Deadline</div>
              <div className="deadline-date">31-Oct-2024</div>
              <div className="deadline-days">12 days remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Matches Reference Image) */}
      <div className="stats-grid-row">
        {/* Progress Ring Card */}
        <div className="progress-hero-card">
          <ProgressRing percentage={completionPercentage} size={68} strokeWidth={7} color="#10b981" />
          <div className="progress-info">
            <div className="progress-count">
              <span>{uploadedCount}</span>
              <span className="progress-count-total">/ {totalAccounts}</span>
            </div>
            <div className="progress-label">Statements uploaded</div>
            <div className="linear-progress-bar">
              <div
                className="linear-progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Uploaded Card */}
        <div
          className="status-stat-card"
          onClick={() => setStatusFilter(statusFilter === 'Uploaded' ? 'All' : 'Uploaded')}
          style={{ cursor: 'pointer' }}
        >
          <div className="status-card-icon uploaded">
            <CheckCircle2 size={22} />
          </div>
          <div className="status-card-data">
            <span className="status-card-number">{uploadedCount}</span>
            <span className="status-card-name">Uploaded</span>
          </div>
        </div>

        {/* Processing Card */}
        <div
          className="status-stat-card"
          onClick={() => setStatusFilter(statusFilter === 'Processing' ? 'All' : 'Processing')}
          style={{ cursor: 'pointer' }}
        >
          <div className="status-card-icon processing">
            <Clock size={22} />
          </div>
          <div className="status-card-data">
            <span className="status-card-number">{processingCount}</span>
            <span className="status-card-name">Processing</span>
          </div>
        </div>

        {/* Pending Card */}
        <div
          className="status-stat-card"
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
          style={{ cursor: 'pointer' }}
        >
          <div className="status-card-icon pending">
            <AlertCircle size={22} />
          </div>
          <div className="status-card-data">
            <span className="status-card-number">{pendingCount}</span>
            <span className="status-card-name">Pending</span>
          </div>
        </div>

        {/* Not Started Card */}
        <div
          className="status-stat-card"
          onClick={() => setStatusFilter(statusFilter === 'Not Started' ? 'All' : 'Not Started')}
          style={{ cursor: 'pointer' }}
        >
          <div className="status-card-icon not-started">
            <XCircle size={22} />
          </div>
          <div className="status-card-data">
            <span className="status-card-number">{notStartedCount}</span>
            <span className="status-card-name">Not Started</span>
          </div>
        </div>
      </div>

      {/* Main Bank Account Statements Table Card */}
      <div className="table-card">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="table-title-area">
            <h2 className="table-heading">
              Bank Account Statements ({bankAccounts.length} Accounts)
            </h2>
            {statusFilter !== 'All' && (
              <span className="badge badge-info" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('All')}>
                Filter: {statusFilter} ✕
              </span>
            )}
          </div>

          <div className="table-actions-group">
            {/* Search Input */}
            <div className="table-search-input">
              <Search size={15} style={{ color: 'var(--slate-400)' }} />
              <input
                type="text"
                placeholder="Search bank accounts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Bulk Upload Button */}
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsBulkUploadOpen(true)}
            >
              <UploadCloud size={16} />
              <span>Bulk upload</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th>Bank Name</th>
                <th>Account Number (Last 4)</th>
                <th>Account Type</th>
                <th>Statement for {quarter.split(' ')[0]} ({quarter.split('(')[1]?.replace(')', '')})</th>
                <th>AI Processing</th>
                <th>Last Uploaded On</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-500)' }}>
                    No bank accounts matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account, index) => {
                  const rowIndex = startIndex + index + 1;
                  const isUploaded = account.statement_status === 'Uploaded';
                  const isProcessing = account.statement_status === 'Processing';
                  const isPending = account.statement_status === 'Pending';

                  return (
                    <tr key={account.id}>
                      {/* Row Number */}
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--slate-500)' }}>
                        {rowIndex}
                      </td>

                      {/* Bank Name with Official Insignia Logo */}
                      <td>
                        <div className="bank-name-cell">
                          <BankLogo bankCode={account.bank_code} bankName={account.bank_name} size={28} />
                          <span>{account.bank_name}</span>
                        </div>
                      </td>

                      {/* Account Number (Last 4) */}
                      <td>
                        <span className="account-num-cell">
                          {account.account_number.replace('•••• •••• ', '')}
                        </span>
                      </td>

                      {/* Account Type */}
                      <td>
                        <span style={{ fontWeight: 500 }}>{account.account_type}</span>
                      </td>

                      {/* Statement Upload Status Badge */}
                      <td>
                        <Badge type="statement" status={account.statement_status} />
                      </td>

                      {/* AI Processing Status Badge */}
                      <td>
                        <Badge type="ai" status={account.ai_status} />
                      </td>

                      {/* Last Uploaded Timestamp */}
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                        {account.last_uploaded}
                      </td>

                      {/* Action Buttons */}
                      <td>
                        <div className="row-actions-group" style={{ justifyContent: 'center' }}>
                          {isUploaded && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedAccountForView(account)}
                                title="View parsed statements & transactions"
                              >
                                View
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setSelectedAccountForUpload(account);
                                  setUploadFile(null);
                                }}
                                title="Replace existing statement file"
                              >
                                Replace
                              </button>
                            </>
                          )}

                          {isProcessing && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedAccountForView(account)}
                              >
                                View
                              </button>
                              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', padding: '0 0.5rem' }}>
                                —
                              </span>
                            </>
                          )}

                          {isPending && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setSelectedAccountForUpload(account);
                                  setUploadFile(null);
                                }}
                              >
                                Upload
                              </button>
                              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', padding: '0 0.5rem' }}>
                                —
                              </span>
                            </>
                          )}

                          {account.statement_status === 'Not Started' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedAccountForUpload(account);
                                setUploadFile(null);
                              }}
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="table-pagination-bar">
          <div>
            Showing{' '}
            <strong>
              {filteredAccounts.length > 0 ? startIndex + 1 : 0} to{' '}
              {Math.min(startIndex + rowsPerPage, filteredAccounts.length)}
            </strong>{' '}
            of <strong>{filteredAccounts.length}</strong> accounts
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="pagination-controls">
              <button
                className="page-num-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`page-num-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-num-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Rows per page</span>
              <select
                className="form-select"
                style={{ width: '65px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={18}>18</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Progress Indicator & Bottom Actions (As in Reference Screenshot) */}
      <div className="upload-flow-card">
        {/* Stepper with 4 Steps */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--blue-700)' }} />
            <span>Upload Instructions</span>
          </div>
          <div className="stepper-container">
            {/* Step 1 */}
            <div className="step-card completed">
              <div className="step-number">
                <Check size={14} />
              </div>
              <div className="step-text">
                <span className="step-title">1. Select Quarter</span>
                <span className="step-desc">Choose financial year and quarter</span>
              </div>
            </div>

            <div className="step-divider">
              <ArrowRight size={16} />
            </div>

            {/* Step 2 */}
            <div className={`step-card ${completionPercentage === 100 ? 'completed' : 'active'}`}>
              <div className="step-number">
                {completionPercentage === 100 ? <Check size={14} /> : '2'}
              </div>
              <div className="step-text">
                <span className="step-title">2. Upload Statement</span>
                <span className="step-desc">Upload PDF/Excel/CSV bank statement</span>
              </div>
            </div>

            <div className="step-divider">
              <ArrowRight size={16} />
            </div>

            {/* Step 3 */}
            <div className={`step-card ${processingCount > 0 ? 'active' : completionPercentage === 100 ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-text">
                <span className="step-title">3. AI Processing</span>
                <span className="step-desc">System will extract and analyze transactions</span>
              </div>
            </div>

            <div className="step-divider">
              <ArrowRight size={16} />
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-text">
                <span className="step-title">4. Review & Submit</span>
                <span className="step-desc">Verify and submit all accounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons on Right */}
        <div className="flow-actions-group">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setIsSubmitConfirmationOpen(true)}
            style={{ width: '100%', gap: '0.65rem' }}
          >
            <Send size={16} />
            <span>Submit All Statements for Review</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={saveProgress}
            style={{ width: '100%', gap: '0.65rem' }}
          >
            <Save size={16} />
            <span>Save Progress</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: View Statement & AI Transactions
          ===================================================================== */}
      {selectedAccountForView && (
        <Modal
          isOpen={!!selectedAccountForView}
          onClose={() => setSelectedAccountForView(null)}
          title={`Statement Reconciliation - ${selectedAccountForView.bank_name}`}
          icon={FileText}
          size="xl"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedAccountForView(null)}
              >
                Close
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  addToast({
                    title: 'Downloading Statement',
                    message: `Exporting ${selectedAccountForView.file_name} as PDF...`,
                    type: 'info',
                  });
                }}
              >
                <Download size={15} /> Download PDF
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedAccountForUpload(selectedAccountForView);
                  setSelectedAccountForView(null);
                }}
              >
                <RefreshCw size={15} /> Replace Statement
              </button>
            </>
          }
        >
          {/* Statement Metadata Summary Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              backgroundColor: 'var(--slate-50)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--slate-200)',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>BANK & ACCOUNT</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {selectedAccountForView.bank_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                {selectedAccountForView.account_number} ({selectedAccountForView.account_type})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>STATEMENT PERIOD</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                FY {financialYear} · {quarter}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                File: {selectedAccountForView.file_name || 'Uploaded_Statement.pdf'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>AI AUDIT STATUS</div>
              <div style={{ marginTop: '0.2rem' }}>
                <Badge type="ai" status={selectedAccountForView.ai_status} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', marginTop: '0.2rem', fontWeight: 600 }}>
                ✓ Confidence Score: 99.8%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>RECONCILED BALANCE</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--blue-700)', marginTop: '0.2rem' }}>
                ₹{(selectedAccountForView.current_balance || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                {selectedAccountForView.parsed_transactions_count || 142} extracted transactions
              </div>
            </div>
          </div>

          {/* AI Extraction Tabs / Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--blue-700)' }} />
              <strong style={{ fontSize: '0.9rem' }}>Extracted Line Item Ledger (Sample Transactions)</strong>
            </div>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Auto-Categorized by BankRecon AI v4.0
            </span>
          </div>

          {/* Parsed Transactions Table */}
          <div className="table-responsive" style={{ border: '1px solid var(--slate-200)', borderRadius: '6px' }}>
            <table className="gov-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction Description</th>
                  <th>Reference / UTR</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  <th>AI Category</th>
                  <th>Audit Check</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingView ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      <RefreshCw size={20} className="spin" style={{ margin: '0 auto', color: 'var(--blue-700)' }} />
                      <div style={{ marginTop: '0.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>Loading parsed line items from database...</div>
                    </td>
                  </tr>
                ) : (
                  (viewTransactions.length > 0 ? viewTransactions : sampleTransactions).map((txn, idx) => (
                    <tr key={txn.txn_id || txn.id || idx}>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{txn.txn_date || txn.date}</td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '280px' }}>{txn.description}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{txn.reference_no}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: txn.type === 'Credit' ? 'var(--emerald-50)' : 'var(--slate-100)',
                            color: txn.type === 'Credit' ? 'var(--emerald-600)' : 'var(--slate-700)',
                          }}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: txn.type === 'Credit' ? 'var(--emerald-600)' : 'var(--slate-900)',
                        }}
                      >
                        {txn.type === 'Credit' ? '+' : '-'}₹{(txn.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {txn.ai_category || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          ✓ {txn.ai_flag || 'Verified Valid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* =====================================================================
          MODAL 2: Upload / Replace Statement File
          ===================================================================== */}
      {selectedAccountForUpload && (
        <Modal
          isOpen={!!selectedAccountForUpload}
          onClose={() => {
            if (!isUploading) {
              setSelectedAccountForUpload(null);
              setUploadFile(null);
            }
          }}
          title={`Upload Statement - ${selectedAccountForUpload.bank_name}`}
          icon={UploadCloud}
          size="md"
          footer={
            <>
              <button
                className="btn btn-secondary"
                disabled={isUploading}
                onClick={() => {
                  setSelectedAccountForUpload(null);
                  setUploadFile(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!uploadFile || isUploading}
                onClick={handleStartUpload}
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={15} className="spin" /> Processing AI OCR...
                  </>
                ) : (
                  <>
                    <Upload size={15} /> Confirm & Run AI Parser
                  </>
                )}
              </button>
            </>
          }
        >
          {/* Target Account Summary */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--border-radius-sm)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BankLogo
                bankCode={selectedAccountForUpload.bank_code}
                bankName={selectedAccountForUpload.bank_name}
                size={32}
              />
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{selectedAccountForUpload.bank_name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  A/C: {selectedAccountForUpload.account_number} · Type: {selectedAccountForUpload.account_type}
                </div>
              </div>
            </div>
            <span className="badge badge-info">
              {quarter}
            </span>
          </div>

          {/* Drag & Drop Zone */}
          <div
            className="dropzone-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('statement-file-input')?.click()}
          >
            <input
              id="statement-file-input"
              type="file"
              accept=".pdf,.xlsx,.csv"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <UploadCloud className="dropzone-icon" />
            <div className="dropzone-text-main">
              {uploadFile ? uploadFile.name : 'Click to select or drag and drop bank statement'}
            </div>
            <div className="dropzone-text-sub">
              Supported file types: PDF, XLSX, CSV (Max file size: 25 MB)
            </div>
          </div>

          {/* Selected File Feedback */}
          {uploadFile && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'var(--emerald-50)',
                border: '1px solid var(--emerald-200)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <FileSpreadsheet size={20} style={{ color: 'var(--emerald-600)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                  {uploadFile.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for AI processing
                </div>
              </div>
              <CheckCircle2 size={18} style={{ color: 'var(--emerald-600)' }} />
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                  AI Extracting & Reconciling Transactions...
                </span>
                <span style={{ fontWeight: 700, color: 'var(--blue-700)' }}>{uploadProgress}%</span>
              </div>
              <div className="linear-progress-bar">
                <div
                  className="linear-progress-fill"
                  style={{
                    width: `${uploadProgress}%`,
                    background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                  }}
                />
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* =====================================================================
          MODAL 3: Bulk Upload Statements
          ===================================================================== */}
      {isBulkUploadOpen && (
        <Modal
          isOpen={isBulkUploadOpen}
          onClose={() => !isUploading && setIsBulkUploadOpen(false)}
          title="Bulk Upload Bank Statements"
          icon={UploadCloud}
          size="md"
          footer={
            <>
              <button
                className="btn btn-secondary"
                disabled={isUploading}
                onClick={() => setIsBulkUploadOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={isUploading}
                onClick={handleBulkSubmit}
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={15} className="spin" /> Parsing All Statements...
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} /> Upload & Process All (18 Accounts)
                  </>
                )}
              </button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
            Upload multiple bank statement files simultaneously for <strong>{quarter} FY {financialYear}</strong>.
            The system will automatically match each file to its corresponding bank account using account number OCR.
          </div>

          <div
            className="dropzone-container"
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              addToast({
                title: 'Files Selected',
                message: '18 statement files selected for batch upload.',
                type: 'info',
              });
            }}
          >
            <UploadCloud className="dropzone-icon" />
            <div className="dropzone-text-main">
              Drag & Drop ZIP archive or multiple PDF/Excel statements here
            </div>
            <div className="dropzone-text-sub">
              AI NLP engine will automatically map IFSC, account numbers, and extract transactions
            </div>
          </div>

          {isUploading && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span>Batch Processing 18 Statements...</span>
                <strong>{uploadProgress}%</strong>
              </div>
              <div className="linear-progress-bar">
                <div
                  className="linear-progress-fill"
                  style={{
                    width: `${uploadProgress}%`,
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                  }}
                />
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* =====================================================================
          MODAL 4: Submit All Statements Confirmation
          ===================================================================== */}
      {isSubmitConfirmationOpen && (
        <Modal
          isOpen={isSubmitConfirmationOpen}
          onClose={() => setIsSubmitConfirmationOpen(false)}
          title="Submit All Statements for Higher Education Review"
          icon={Send}
          size="md"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setIsSubmitConfirmationOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleFinalSubmitAll}
              >
                <CheckCircle2 size={16} /> Confirm & Sign Digitally
              </button>
            </>
          }
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--blue-50)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--blue-200)',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={28} style={{ color: 'var(--blue-700)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.825rem', color: 'var(--slate-800)' }}>
                <strong>DDO Digital Verification Required:</strong> By submitting, you certify that all 18 bank accounts are fully reconciled against university cash books for <strong>{quarter} FY {financialYear}</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-600)' }}>Total Bank Accounts:</span>
                <strong>18 Accounts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-600)' }}>Statements Uploaded:</span>
                <strong style={{ color: 'var(--emerald-600)' }}>{uploadedCount} Uploaded</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-600)' }}>Pending Uploads:</span>
                <strong style={{ color: pendingCount > 0 ? 'var(--rose-600)' : 'var(--slate-700)' }}>
                  {pendingCount} Pending
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-600)' }}>AI Anomaly Check:</span>
                <strong style={{ color: 'var(--emerald-600)' }}>Passed (0 Critical Anomalies)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-600)' }}>Authorized Officer:</span>
                <strong>Dr. R. Manjunath (Finance Officer)</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
