// API Service layer connecting frontend UI to backend Express REST API

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('univ_fund_jwt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('univ_fund_jwt_token');
  },

  // Bank Statements & Quarterly Upload
  async getStatements(financialYear = '2024-25', quarter = 'Q2 (Jul - Sep)') {
    const params = new URLSearchParams({ financial_year: financialYear, quarter });
    const res = await fetch(`${API_BASE}/statements?${params}`);
    return res.json();
  },

  async getStatementSummary(financialYear = '2024-25', quarter = 'Q2 (Jul - Sep)') {
    const params = new URLSearchParams({ financial_year: financialYear, quarter });
    const res = await fetch(`${API_BASE}/statements/summary?${params}`);
    return res.json();
  },

  async getStatementById(id) {
    const res = await fetch(`${API_BASE}/statements/${id}`);
    return res.json();
  },

  async uploadStatement(formData) {
    const token = localStorage.getItem('univ_fund_jwt_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/statements/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  async bulkUpload(financialYear, quarter) {
    const res = await fetch(`${API_BASE}/statements/bulk-upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ financial_year: financialYear, quarter }),
    });
    return res.json();
  },

  async saveStatementProgress(data) {
    const res = await fetch(`${API_BASE}/statements/save-progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitAllStatements(financialYear, quarter) {
    const res = await fetch(`${API_BASE}/statements/submit-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ financial_year: financialYear, quarter }),
    });
    return res.json();
  },

  // Dashboard Analytics
  async getDashboardAnalytics(universityId = 'UNIV-01', financialYear = '2024-25', quarter = 'Q2 (Jul - Sep)') {
    const params = new URLSearchParams({ university_id: universityId, financial_year: financialYear, quarter });
    const res = await fetch(`${API_BASE}/analytics/dashboard?${params}`);
    return res.json();
  },

  async getFinancialAnalysis(universityId = 'UNIV-01') {
    const res = await fetch(`${API_BASE}/analytics/financial-analysis?university_id=${universityId}`);
    return res.json();
  },

  // AI Validation & Anomalies
  async getAiModels() {
    const res = await fetch(`${API_BASE}/ai/models`);
    return res.json();
  },

  async getAiAnomalies(severity, status) {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/ai/anomalies?${params}`);
    return res.json();
  },

  async resolveAnomaly(id, notes) {
    const res = await fetch(`${API_BASE}/ai/anomalies/${id}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    return res.json();
  },

  async runBatchAudit() {
    const res = await fetch(`${API_BASE}/ai/batch-audit`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getWorkbenchQueue(financialYear = '2024-25', quarter = 'Q2 (Jul - Sep)') {
    const params = new URLSearchParams({ financial_year: financialYear, quarter });
    const res = await fetch(`${API_BASE}/ai/workbench/queue?${params}`);
    return res.json();
  },

  async reviewStatement(id, action, reason) {
    const res = await fetch(`${API_BASE}/ai/statements/${id}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, reason }),
    });
    return res.json();
  },

  // Applications
  async getApplications(filters = {}) {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/applications?${params}`);
    return res.json();
  },

  async createApplication(data) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async approveApplication(id) {
    const res = await fetch(`${API_BASE}/applications/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async rejectApplication(id, reason) {
    const res = await fetch(`${API_BASE}/applications/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async requestApplicationCorrection(id, notes) {
    const res = await fetch(`${API_BASE}/applications/${id}/request-correction`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    return res.json();
  },

  async disburseApplication(id, mode) {
    const res = await fetch(`${API_BASE}/applications/${id}/disburse`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mode }),
    });
    return res.json();
  },

  // Relational Entities CRUD (Universities, Departments, Faculty, Students, Courses, Schemes, etc.)
  async getEntities(entityType) {
    const res = await fetch(`${API_BASE}/${entityType}`);
    return res.json();
  },

  async createEntity(entityType, data) {
    const res = await fetch(`${API_BASE}/${entityType}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateEntity(entityType, id, data) {
    const res = await fetch(`${API_BASE}/${entityType}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteEntity(entityType, id) {
    const res = await fetch(`${API_BASE}/${entityType}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Reports & Logs
  async getReports() {
    const res = await fetch(`${API_BASE}/reports`);
    return res.json();
  },

  async generateReport(data) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAuditLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}`);
    return res.json();
  },

  async downloadReport(type, format = 'csv', params = {}) {
    const query = new URLSearchParams({ type, format, ...params });
    const token = localStorage.getItem('univ_fund_jwt_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/reports/export?${query}`, { headers });
    if (!res.ok) throw new Error(`Report export failed with status ${res.status}`);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_report.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
