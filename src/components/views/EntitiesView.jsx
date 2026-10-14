import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../common/Badge';
import BankLogo from '../common/BankLogo';
import Modal from '../common/Modal';
import {
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  Building2,
  Building,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Award,
  FileCheck2,
  Landmark,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function EntitiesView({ entityType }) {
  const {
    universities,
    departments,
    faculty,
    students,
    courses,
    registrations,
    schemes,
    applications,
    bankAccounts,
    disbursements,
    addEntity,
    updateEntity,
    deleteEntity,
    addToast,
    financialYear,
    quarter
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Entity config mapping
  const getEntityConfig = () => {
    switch (entityType) {
      case 'universities':
        return {
          title: 'Universities Directorate',
          subtitle: 'State Public, Technical, and Autonomous Higher Education Institutions in Karnataka',
          icon: Building2,
          idField: 'university_id',
          data: universities,
          columns: [
            { key: 'university_id', label: 'Univ Code' },
            { key: 'name', label: 'University Name' },
            { key: 'type', label: 'Institution Type' },
            { key: 'location', label: 'Campus Location' },
            { key: 'vice_chancellor', label: 'Vice Chancellor' },
            { key: 'allocated_funds', label: 'Allocated Budget', format: (v) => `₹${(v / 10000000).toFixed(1)} Cr` },
          ],
          fields: [
            { name: 'university_id', label: 'University Code', placeholder: 'UNIV-05', required: true },
            { name: 'name', label: 'University Name', placeholder: 'Kuvempu University', required: true },
            { name: 'type', label: 'Type', type: 'select', options: ['State Public University', 'State Technological University', 'Deemed University'] },
            { name: 'location', label: 'Location', placeholder: 'Jnana Sahyadri, Shivamogga' },
            { name: 'vice_chancellor', label: 'Vice Chancellor', placeholder: 'Prof. B. P. Veerabhadrappa' },
            { name: 'email', label: 'Official Email', placeholder: 'registrar@kuvempu.ac.in' },
            { name: 'allocated_funds', label: 'Allocated Budget (₹)', type: 'number', placeholder: '1500000000' },
          ]
        };

      case 'departments':
        return {
          title: 'Academic Departments',
          subtitle: 'Faculties, budget allocations, research laboratories, and student enrolment',
          icon: Building,
          idField: 'dept_id',
          data: departments,
          columns: [
            { key: 'dept_id', label: 'Dept ID' },
            { key: 'name', label: 'Department Name' },
            { key: 'head_name', label: 'Head of Department (HOD)' },
            { key: 'faculty_count', label: 'Faculty' },
            { key: 'student_count', label: 'Students' },
            { key: 'budget_allocated', label: 'Budget (₹)', format: (v) => `₹${(v / 100000).toFixed(0)}L` },
          ],
          fields: [
            { name: 'dept_id', label: 'Dept Code', placeholder: 'DEPT-CIVIL', required: true },
            { name: 'name', label: 'Department Name', placeholder: 'Civil & Environmental Engineering', required: true },
            { name: 'head_name', label: 'HOD Name', placeholder: 'Dr. Ramesh Kumar' },
            { name: 'faculty_count', label: 'Faculty Count', type: 'number', placeholder: '15' },
            { name: 'student_count', label: 'Student Count', type: 'number', placeholder: '320' },
            { name: 'budget_allocated', label: 'Budget Allocated (₹)', type: 'number', placeholder: '30000000' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Department research focus...' },
          ]
        };

      case 'faculty':
        return {
          title: 'Faculty Registry',
          subtitle: 'Professors, researchers, scheme validators, and academic mentors',
          icon: Users,
          idField: 'faculty_id',
          data: faculty,
          columns: [
            { key: 'faculty_id', label: 'Faculty ID' },
            { key: 'name', label: 'Name' },
            { key: 'designation', label: 'Designation' },
            { key: 'department_id', label: 'Department' },
            { key: 'specialization', label: 'Specialization' },
            { key: 'email', label: 'Email' },
          ],
          fields: [
            { name: 'faculty_id', label: 'Faculty ID', placeholder: 'FAC-107', required: true },
            { name: 'name', label: 'Full Name', placeholder: 'Dr. Rajeshwari Sharma', required: true },
            { name: 'designation', label: 'Designation', type: 'select', options: ['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor'] },
            { name: 'department_id', label: 'Department', type: 'select', options: departments.map((d) => d.dept_id) },
            { name: 'specialization', label: 'Specialization', placeholder: 'Data Science & High Performance Computing' },
            { name: 'email', label: 'Email', placeholder: 'rajeshwari.sharma@bcu.ac.in' },
            { name: 'phone', label: 'Phone', placeholder: '+91 98450 12345' },
          ]
        };

      case 'students':
        return {
          title: 'Student Database',
          subtitle: 'Enrolled students, category eligibility, bank linkage, and attendance tracking',
          icon: GraduationCap,
          idField: 'student_id',
          data: students,
          columns: [
            { key: 'enrollment_no', label: 'Enrollment No' },
            { key: 'name', label: 'Student Name' },
            { key: 'category', label: 'Category' },
            { key: 'annual_family_income', label: 'Family Income', format: (v) => `₹${v.toLocaleString('en-IN')}` },
            { key: 'attendance_rate', label: 'Attendance', format: (v) => `${v}%` },
            { key: 'bank_account', label: 'Bank Account' },
          ],
          fields: [
            { name: 'student_id', label: 'Student ID', placeholder: 'STU-2024-007', required: true },
            { name: 'name', label: 'Full Name', placeholder: 'Varun Prakash', required: true },
            { name: 'enrollment_no', label: 'Enrollment Number', placeholder: 'BCU2024CS150', required: true },
            { name: 'department_id', label: 'Department', type: 'select', options: departments.map((d) => d.dept_id) },
            { name: 'category', label: 'Category', type: 'select', options: ['OBC-2A', 'OBC-3A', 'SC', 'ST', 'Minority', 'General-EWS', 'General'] },
            { name: 'annual_family_income', label: 'Annual Income (₹)', type: 'number', placeholder: '120000' },
            { name: 'bank_account', label: 'Bank Account', placeholder: '•••• •••• 5512' },
            { name: 'attendance_rate', label: 'Attendance Rate (%)', type: 'number', placeholder: '92.5' },
          ]
        };

      case 'courses':
        return {
          title: 'Course Catalog',
          subtitle: 'Degree programs, postgraduate specializations, credit structures, and intake capacity',
          icon: BookOpen,
          idField: 'course_id',
          data: courses,
          columns: [
            { key: 'course_id', label: 'Course Code' },
            { key: 'title', label: 'Program Title' },
            { key: 'credits', label: 'Credits' },
            { key: 'duration', label: 'Duration' },
            { key: 'department_id', label: 'Department' },
            { key: 'intake_capacity', label: 'Intake' },
          ],
          fields: [
            { name: 'course_id', label: 'Course ID', placeholder: 'CRS-CS103', required: true },
            { name: 'title', label: 'Course Title', placeholder: 'M.Tech in Cybersecurity', required: true },
            { name: 'credits', label: 'Total Credits', type: 'number', placeholder: '72' },
            { name: 'duration', label: 'Duration', placeholder: '4 Semesters (2 Years)' },
            { name: 'department_id', label: 'Department', type: 'select', options: departments.map((d) => d.dept_id) },
            { name: 'annual_fee', label: 'Annual Tuition (₹)', type: 'number', placeholder: '40000' },
            { name: 'intake_capacity', label: 'Intake Capacity', type: 'number', placeholder: '60' },
          ]
        };

      case 'registrations':
        return {
          title: 'Student Course Registrations',
          subtitle: 'Active course enrollments, semester registrations, and academic progression',
          icon: ClipboardList,
          idField: 'reg_id',
          data: registrations,
          columns: [
            { key: 'reg_id', label: 'Reg ID' },
            { key: 'student_id', label: 'Student ID' },
            { key: 'course_id', label: 'Course ID' },
            { key: 'sem', label: 'Semester' },
            { key: 'academic_year', label: 'Academic Year' },
            { key: 'status', label: 'Status', isBadge: true },
          ],
          fields: [
            { name: 'reg_id', label: 'Registration ID', placeholder: 'REG-2024-07', required: true },
            { name: 'student_id', label: 'Student ID', type: 'select', options: students.map((s) => s.student_id) },
            { name: 'course_id', label: 'Course ID', type: 'select', options: courses.map((c) => c.course_id) },
            { name: 'sem', label: 'Semester', type: 'select', options: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'] },
            { name: 'academic_year', label: 'Academic Year', placeholder: '2024-25' },
            { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Completed', 'Dropped'] },
          ]
        };

      case 'schemes':
        return {
          title: 'Scholarship & Grant Schemes',
          subtitle: 'Government welfare schemes, eligibility bounds, budget ceilings, and sponsor departments',
          icon: Award,
          idField: 'scheme_id',
          data: schemes,
          columns: [
            { key: 'code', label: 'Scheme Code' },
            { key: 'name', label: 'Scheme Name' },
            { key: 'max_amount', label: 'Max Benefit', format: (v) => `₹${v.toLocaleString('en-IN')}` },
            { key: 'total_grant_pool', label: 'Total Pool', format: (v) => `₹${(v / 10000000).toFixed(1)} Cr` },
            { key: 'funding_agency', label: 'Funding Agency' },
          ],
          fields: [
            { name: 'scheme_id', label: 'Scheme ID', placeholder: 'SCH-NEW-06', required: true },
            { name: 'name', label: 'Scheme Title', placeholder: 'Chief Minister Merit Fellowship', required: true },
            { name: 'code', label: 'Code', placeholder: 'GOK-CMMF' },
            { name: 'max_amount', label: 'Max Amount (₹)', type: 'number', placeholder: '50000' },
            { name: 'total_grant_pool', label: 'Total Grant Pool (₹)', type: 'number', placeholder: '50000000' },
            { name: 'funding_agency', label: 'Funding Agency', placeholder: 'Higher Education Department' },
            { name: 'eligibility_criteria', label: 'Eligibility Criteria', type: 'textarea', placeholder: 'CGPA > 8.5 and family income < ₹3L' },
          ]
        };

      case 'applications':
        return {
          title: 'Beneficiary Applications',
          subtitle: 'Individual student welfare and research fellowship applications under evaluation',
          icon: FileCheck2,
          idField: 'app_id',
          data: applications,
          columns: [
            { key: 'app_id', label: 'Application ID' },
            { key: 'student_name', label: 'Applicant' },
            { key: 'scheme_name', label: 'Scheme' },
            { key: 'amount_requested', label: 'Amount (₹)', format: (v) => `₹${v.toLocaleString('en-IN')}` },
            { key: 'ai_validation_status', label: 'AI Validation', isBadge: true, badgeType: 'ai' },
            { key: 'status', label: 'Status', isBadge: true },
          ],
          fields: [
            { name: 'app_id', label: 'Application ID', placeholder: 'APP-2024-0897', required: true },
            { name: 'student_name', label: 'Student Name', placeholder: 'Kavya Ramesh Patil', required: true },
            { name: 'student_id', label: 'Student ID', type: 'select', options: students.map((s) => s.student_id) },
            { name: 'scheme_name', label: 'Scheme', type: 'select', options: schemes.map((s) => s.name) },
            { name: 'amount_requested', label: 'Amount Requested (₹)', type: 'number', placeholder: '25000' },
            { name: 'status', label: 'Application Status', type: 'select', options: ['Pending', 'AI Validated', 'Under Review', 'Approved', 'Rejected'] },
            { name: 'remarks', label: 'Audit Remarks', type: 'textarea', placeholder: 'Nadakacheri certificate verified...' },
          ]
        };

      case 'bank-accounts':
        return {
          title: 'University Bank Accounts',
          subtitle: 'Treasury, grant escrow, examination, and salary bank accounts',
          icon: Landmark,
          idField: 'id',
          data: bankAccounts,
          columns: [
            { key: 'bank_name', label: 'Bank Name' },
            { key: 'account_number', label: 'Account Number' },
            { key: 'account_type', label: 'Account Purpose' },
            { key: 'branch', label: 'Branch' },
            { key: 'current_balance', label: 'Balance (₹)', format: (v) => `₹${(v / 100000).toFixed(1)}L` },
            { key: 'statement_status', label: 'Q2 Statement', isBadge: true, badgeType: 'statement' },
          ],
          fields: [
            { name: 'bank_name', label: 'Bank Name', placeholder: 'Canara Bank', required: true },
            { name: 'bank_code', label: 'Bank Code', placeholder: 'CANARA' },
            { name: 'account_number', label: 'Masked Account Number', placeholder: '•••• •••• 9988', required: true },
            { name: 'account_type', label: 'Account Type', type: 'select', options: ['General', 'Salary', 'Grant', 'Project', 'Student Fee', 'Research', 'Infrastructure', 'Endowments'] },
            { name: 'branch', label: 'Branch Name', placeholder: 'University Campus Branch' },
            { name: 'ifsc', label: 'IFSC Code', placeholder: 'CNRB0001234' },
            { name: 'current_balance', label: 'Opening Balance (₹)', type: 'number', placeholder: '25000000' },
          ]
        };

      case 'disbursements':
        return {
          title: 'Direct Benefit Transfer (DBT) & PFMS Disbursements',
          subtitle: 'Direct bank account transfers, UTR tracking, and PFMS clearance vouchers',
          icon: CreditCard,
          idField: 'disbursement_id',
          data: disbursements,
          columns: [
            { key: 'disbursement_id', label: 'Disbursement ID' },
            { key: 'student_name', label: 'Beneficiary' },
            { key: 'amount', label: 'Amount (₹)', format: (v) => `₹${v.toLocaleString('en-IN')}` },
            { key: 'mode', label: 'Payment Gateway' },
            { key: 'utr_number', label: 'Bank UTR Reference' },
            { key: 'status', label: 'Status', isBadge: true },
          ],
          fields: [
            { name: 'disbursement_id', label: 'Disbursement ID', placeholder: 'DISB-2024-505', required: true },
            { name: 'student_name', label: 'Beneficiary Student', placeholder: 'Kavya Patil', required: true },
            { name: 'amount', label: 'Amount (₹)', type: 'number', placeholder: '18000', required: true },
            { name: 'mode', label: 'Disbursement Channel', type: 'select', options: ['DBT - Aadhaar Payment Bridge (APB)', 'PFMS - Direct Beneficiary', 'RTGS Institutional Escrow'] },
            { name: 'utr_number', label: 'UTR Number', placeholder: 'SBIN824009819999' },
            { name: 'status', label: 'Status', type: 'select', options: ['Completed', 'Queued', 'Pending Approval'] },
          ]
        };

      default:
        return {
          title: 'Entity Management',
          subtitle: 'Data directory',
          icon: Building,
          idField: 'id',
          data: [],
          columns: [],
          fields: []
        };
    }
  };

  const config = getEntityConfig();
  const Icon = config.icon;

  // Search filter
  const filteredData = config.data.filter((item) => {
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Form submit handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateEntity(entityType, config.idField, editingItem[config.idField], {
        ...editingItem,
        ...formData,
      });
      setEditingItem(null);
    } else {
      addEntity(entityType, formData);
      setIsAddModalOpen(false);
    }
    setFormData({});
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = config.columns.map((c) => c.label).join(',');
    const rows = filteredData
      .map((item) =>
        config.columns
          .map((c) => {
            const val = item[c.key];
            return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
          })
          .join(',')
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${entityType}_export_${financialYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'Export Generated',
      message: `${filteredData.length} records exported to CSV.`,
      type: 'info',
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <div className="page-title-icon">
            <Icon size={24} />
          </div>
          <div>
            <h1 className="page-title">{config.title}</h1>
            <p className="page-subtitle">{config.subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({});
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} /> Add New {config.title.split(' ')[0]}
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="table-title-area">
            <h2 className="table-heading">
              All Records ({filteredData.length})
            </h2>
          </div>

          <div className="table-actions-group">
            <div className="table-search-input">
              <Search size={15} style={{ color: 'var(--slate-400)' }} />
              <input
                type="text"
                placeholder={`Search in ${config.title}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                {config.columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.columns.length + 2}
                    style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}
                  >
                    No records found matching search query.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const rowIndex = startIndex + index + 1;
                  return (
                    <tr key={item[config.idField] || index}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--slate-400)' }}>
                        {rowIndex}
                      </td>

                      {config.columns.map((col) => {
                        const val = item[col.key];

                        if (col.isBadge) {
                          return (
                            <td key={col.key}>
                              <Badge type={col.badgeType || 'default'} status={val} />
                            </td>
                          );
                        }

                        return (
                          <td key={col.key} style={{ fontWeight: col.key.includes('id') || col.key.includes('code') ? 600 : 400 }}>
                            {col.format ? col.format(val) : val}
                          </td>
                        );
                      })}

                      {/* Row Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="row-actions-group" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: '28px', height: '28px' }}
                            title="View details"
                            onClick={() => setViewingItem(item)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: '28px', height: '28px' }}
                            title="Edit record"
                            onClick={() => {
                              setEditingItem(item);
                              setFormData({ ...item });
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: '28px', height: '28px', color: 'var(--rose-600)' }}
                            title="Delete record"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete this record?`)) {
                                deleteEntity(entityType, config.idField, item[config.idField]);
                              }
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="table-pagination-bar">
          <div>
            Showing <strong>{filteredData.length > 0 ? startIndex + 1 : 0}</strong> to{' '}
            <strong>{Math.min(startIndex + rowsPerPage, filteredData.length)}</strong> of{' '}
            <strong>{filteredData.length}</strong> entries
          </div>

          <div className="pagination-controls">
            <button
              className="page-num-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ADD / EDIT MODAL
          ===================================================================== */}
      {(isAddModalOpen || editingItem) && (
        <Modal
          isOpen={isAddModalOpen || !!editingItem}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
            setFormData({});
          }}
          title={editingItem ? `Edit ${config.title.split(' ')[0]}` : `Add New ${config.title.split(' ')[0]}`}
          icon={Icon}
          size="md"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                  setFormData({});
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleFormSubmit}>
                {editingItem ? 'Save Changes' : 'Create Record'}
              </button>
            </>
          }
        >
          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {config.fields.map((field) => (
                <div key={field.name} className="form-group" style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
                  <label className="form-label">
                    {field.label} {field.required && <span style={{ color: 'var(--rose-600)' }}>*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      className="form-select"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                    >
                      <option value="">Select {field.label}...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className="form-input"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                        })
                      }
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </form>
        </Modal>
      )}

      {/* =====================================================================
          VIEW DETAILS MODAL
          ===================================================================== */}
      {viewingItem && (
        <Modal
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(null)}
          title={`Record Details - ${viewingItem[config.idField] || viewingItem.name}`}
          icon={Icon}
          size="md"
          footer={
            <button className="btn btn-secondary" onClick={() => setViewingItem(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {Object.entries(viewingItem).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: '6px',
                  border: '1px solid var(--slate-200)',
                }}
              >
                <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {key.replace(/_/g, ' ')}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.2rem', color: 'var(--slate-900)' }}>
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
