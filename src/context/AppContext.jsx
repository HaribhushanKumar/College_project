import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  INITIAL_UNIVERSITIES,
  INITIAL_DEPARTMENTS,
  INITIAL_FACULTY,
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_SCHEMES,
  INITIAL_VALIDATORS,
  INITIAL_APPLICATIONS,
  INITIAL_DISBURSEMENTS,
  INITIAL_AI_MODELS,
  INITIAL_REPORTS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_ANOMALIES,
  SAMPLE_TRANSACTIONS
} from '../data/mockData';

const AppContext = createContext();

const LOCAL_STORAGE_KEY = 'univ_fund_mgmt_state_v1';

export function AppProvider({ children }) {
  // Navigation & Scope
  const [activeTab, setActiveTab] = useState('upload-statements'); // Start on the requested screenshot page
  const [selectedUniversity, setSelectedUniversity] = useState('Bengaluru City University');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [quarter, setQuarter] = useState('Q2 (Jul - Sep)');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Current logged in user (Default to Finance Officer Dr. R. Manjunath matching screenshot)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
    return saved
      ? JSON.parse(saved)
      : {
          id: 3,
          username: 'financeofficer',
          full_name: 'Dr. R. Manjunath',
          role: 'Finance Officer',
          email: 'fo.manjunath@bcu.ac.in',
          university_id: 'UNIV-01',
          university_name: 'Bengaluru City University',
        };
  });

  // Entities State
  const [universities, setUniversities] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_universities`);
    return saved ? JSON.parse(saved) : INITIAL_UNIVERSITIES;
  });

  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_departments`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [faculty, setFaculty] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_faculty`);
    return saved ? JSON.parse(saved) : INITIAL_FACULTY;
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_courses`);
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_registrations`);
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [schemes, setSchemes] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_schemes`);
    return saved ? JSON.parse(saved) : INITIAL_SCHEMES;
  });

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_applications`);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [validators, setValidators] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_validators`);
    return saved ? JSON.parse(saved) : INITIAL_VALIDATORS;
  });

  const [disbursements, setDisbursements] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_disbursements`);
    return saved ? JSON.parse(saved) : INITIAL_DISBURSEMENTS;
  });

  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_bank_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [aiModels, setAiModels] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ai_models`);
    return saved ? JSON.parse(saved) : INITIAL_AI_MODELS;
  });

  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reports`);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [anomalies, setAnomalies] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_anomalies`);
    return saved ? JSON.parse(saved) : INITIAL_ANOMALIES;
  });

  const [statementSummary, setStatementSummary] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'nt-1',
      title: 'Quarterly Statement Pending',
      message: 'Axis Bank (•••• 1122) Research Account statement for Q2 is pending upload.',
      time: '15 mins ago',
      type: 'warning',
      read: false,
    },
    {
      id: 'nt-2',
      title: 'AI Anomaly Detected',
      message: 'Application APP-2024-0896 exceeds family income ceiling criteria for EWS waiver.',
      time: '2 hours ago',
      type: 'danger',
      read: false,
    },
    {
      id: 'nt-3',
      title: 'Bank Statement Verified',
      message: 'Canara Bank (•••• 4321) Q2 statement parsed successfully with 218 transactions.',
      time: '1 day ago',
      type: 'success',
      read: true,
    },
    {
      id: 'nt-4',
      title: 'Submission Deadline Approaching',
      message: 'Quarterly statement submission deadline is 31-Oct-2024 (12 days remaining).',
      time: '2 days ago',
      type: 'info',
      read: true,
    }
  ]);

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_bank_accounts`, JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_applications`, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_disbursements`, JSON.stringify(disbursements));
  }, [disbursements]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  // Fetch Live Data from Express Backend
  const fetchLiveData = useCallback(async () => {
    try {
      const [stmtRes, sumRes, appRes, anomRes, modelsRes] = await Promise.allSettled([
        api.getStatements(financialYear, quarter),
        api.getStatementSummary(financialYear, quarter),
        api.getApplications(),
        api.getAiAnomalies(),
        api.getAiModels(),
      ]);

      let backendActive = false;

      if (stmtRes.status === 'fulfilled' && stmtRes.value?.success && stmtRes.value.data?.length > 0) {
        setBankAccounts(stmtRes.value.data);
        backendActive = true;
      }
      if (sumRes.status === 'fulfilled' && sumRes.value?.success) {
        setStatementSummary(sumRes.value.data);
      }
      if (appRes.status === 'fulfilled' && appRes.value?.success && appRes.value.data) {
        setApplications(appRes.value.data);
      }
      if (anomRes.status === 'fulfilled' && anomRes.value?.success && anomRes.value.data) {
        setAnomalies(anomRes.value.data);
      }
      if (modelsRes.status === 'fulfilled' && modelsRes.value?.success && modelsRes.value.data) {
        setAiModels(modelsRes.value.data);
      }

      setIsBackendConnected(backendActive);
    } catch {
      setIsBackendConnected(false);
    }
  }, [financialYear, quarter]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Role Switcher / Authentication
  const switchUser = async (roleName) => {
    const roleCredentials = {
      'Super Admin': { username: 'superadmin', password: 'Password@123' },
      'University Admin': { username: 'univadmin', password: 'Password@123' },
      'Finance Officer': { username: 'financeofficer', password: 'Password@123' },
      'Validator': { username: 'validator', password: 'Password@123' },
      'Read-Only Auditor': { username: 'auditor', password: 'Password@123' },
    };

    const creds = roleCredentials[roleName] || roleCredentials['Finance Officer'];
    try {
      const res = await api.login(creds.username, creds.password);
      const token = res?.token || res?.data?.token;
      const user = res?.user || res?.data?.user;
      if (res && res.success && token && user) {
        localStorage.setItem('univ_fund_jwt_token', token);
        setCurrentUser(user);
        addToast({
          title: `Role Switched: ${roleName}`,
          message: `Logged in as ${user.full_name} (${user.role})`,
          type: 'success',
        });
        return;
      }
    } catch {
      // offline fallback
    }

    const mockUsers = {
      'Super Admin': { id: 1, username: 'superadmin', full_name: 'Dr. Suresh Kumar (IAS)', role: 'Super Admin', email: 'suresh.kumar@karnataka.gov.in' },
      'University Admin': { id: 2, username: 'univadmin', full_name: 'Prof. Lingaraja Gandhi', role: 'University Admin', email: 'vc@bcu.ac.in' },
      'Finance Officer': { id: 3, username: 'financeofficer', full_name: 'Dr. R. Manjunath', role: 'Finance Officer', email: 'fo.manjunath@bcu.ac.in' },
      'Validator': { id: 4, username: 'validator', full_name: 'Smt. Kavitha Rao', role: 'Validator', email: 'kavitha.rao@dhe.gov.in' },
      'Read-Only Auditor': { id: 5, username: 'auditor', full_name: 'Sri H. S. Narayana', role: 'Read-Only Auditor', email: 'auditor.narayana@cag.gov.in' },
    };
    const user = mockUsers[roleName] || mockUsers['Finance Officer'];
    setCurrentUser(user);
    addToast({
      title: `Role Switched: ${roleName}`,
      message: `Active session set to ${user.full_name} (${user.role})`,
      type: 'info',
    });
  };

  // Actions for Quarterly Statement Upload
  const uploadBankStatement = async (accountId, fileOrName, isReplace = false) => {
    // If a File object is passed, send multipart form-data to backend
    if (fileOrName && typeof fileOrName === 'object' && fileOrName.name) {
      try {
        const formData = new FormData();
        formData.append('statement_file', fileOrName);
        formData.append('account_id', accountId);
        formData.append('financial_year', financialYear);
        formData.append('quarter', quarter);
        if (isReplace) formData.append('is_replace', 'true');

        const res = await api.uploadStatement(formData);
        if (res && res.success) {
          addToast({
            title: 'Statement Uploaded & Verified',
            message: `${res.data.file_name} parsed successfully with ${res.data.transactions_count} line items. AI status: ${res.data.ai_status}`,
            type: 'success',
          });
          await fetchLiveData();
          return { success: true, data: res.data };
        } else {
          addToast({
            title: 'Upload Notice',
            message: res?.message || 'Error processing statement upload.',
            type: 'warning',
          });
          return { success: false, message: res?.message };
        }
      } catch (err) {
        console.warn('Backend statement upload error, falling back to local simulation:', err);
      }
    }

    // Local simulation fallback:
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const fileName = typeof fileOrName === 'string' ? fileOrName : (fileOrName?.name || 'Uploaded_Statement.pdf');

    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            statement_status: 'Uploaded',
            ai_status: 'Completed',
            last_uploaded: now,
            file_name: fileName,
            file_size: '2.4 MB',
            parsed_transactions_count: Math.floor(Math.random() * 80) + 30,
            anomalies_detected: 0,
          };
        }
        return acc;
      })
    );

    addToast({
      title: 'Statement Uploaded Successfully',
      message: `Bank statement has been indexed and AI transaction parser completed.`,
      type: 'success',
    });
    return { success: true };
  };

  const replaceBankStatement = (accountId, fileOrName) => {
    return uploadBankStatement(accountId, fileOrName, true);
  };

  const bulkUploadStatements = async () => {
    try {
      const res = await api.bulkUpload(financialYear, quarter);
      if (res && res.success) {
        addToast({
          title: 'Bulk Upload Completed',
          message: res.message || 'All missing bank statements have been generated and processed.',
          type: 'success',
        });
        await fetchLiveData();
        return;
      }
    } catch (err) {
      console.warn('Backend bulk upload error, falling back to local simulation:', err);
    }

    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    setBankAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        statement_status: 'Uploaded',
        ai_status: 'Completed',
        last_uploaded: now,
        file_name: `${acc.bank_code}_Statement_Q2.pdf`,
        file_size: '2.1 MB',
        parsed_transactions_count: acc.parsed_transactions_count || 45,
      }))
    );

    addToast({
      title: 'Bulk Upload Completed',
      message: `All statements successfully uploaded and AI models executed.`,
      type: 'success',
    });
  };

  const saveProgress = async () => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_bank_accounts`, JSON.stringify(bankAccounts));
    try {
      await api.saveStatementProgress({ financial_year: financialYear, quarter, accounts: bankAccounts });
    } catch {
      // Ignore
    }
    addToast({
      title: 'Draft Progress Saved',
      message: 'All quarterly statement uploads and metadata have been saved.',
      type: 'info',
    });
  };

  const submitAllStatements = async () => {
    const pendingCount = bankAccounts.filter((a) => a.statement_status !== 'Uploaded').length;
    if (pendingCount > 0) {
      addToast({
        title: 'Validation Notice',
        message: `There are still ${pendingCount} bank accounts with pending or in-progress statements. Please complete all before final submission.`,
        type: 'warning',
      });
      return false;
    }

    try {
      const res = await api.submitAllStatements(financialYear, quarter);
      if (res && res.success) {
        addToast({
          title: 'Submission Successful!',
          message: 'All 18 quarterly statements submitted to Department of Higher Education for audit.',
          type: 'success',
          duration: 6000,
        });
        await fetchLiveData();
        return true;
      }
    } catch {
      // Fallback
    }

    addToast({
      title: 'Submission Successful!',
      message: 'All 18 quarterly statements submitted to Department of Higher Education for audit.',
      type: 'success',
      duration: 6000,
    });
    return true;
  };

  // Generic Entity Actions
  const addEntity = async (entityType, item) => {
    try {
      await api.createEntity(entityType, item);
    } catch {
      // offline fallback
    }

    switch (entityType) {
      case 'universities':
        setUniversities((prev) => [item, ...prev]);
        break;
      case 'departments':
        setDepartments((prev) => [item, ...prev]);
        break;
      case 'faculty':
        setFaculty((prev) => [item, ...prev]);
        break;
      case 'students':
        setStudents((prev) => [item, ...prev]);
        break;
      case 'courses':
        setCourses((prev) => [item, ...prev]);
        break;
      case 'registrations':
        setRegistrations((prev) => [item, ...prev]);
        break;
      case 'schemes':
        setSchemes((prev) => [item, ...prev]);
        break;
      case 'applications':
        setApplications((prev) => [item, ...prev]);
        break;
      case 'bank-accounts':
        setBankAccounts((prev) => [item, ...prev]);
        break;
      case 'disbursements':
        setDisbursements((prev) => [item, ...prev]);
        break;
      default:
        break;
    }
    addToast({
      title: 'Record Created',
      message: `Successfully created new record in ${entityType}.`,
      type: 'success',
    });
  };

  const updateEntity = async (entityType, idField, idValue, updatedItem) => {
    try {
      await api.updateEntity(entityType, idValue, updatedItem);
    } catch {
      // offline fallback
    }

    const updater = (list) => list.map((item) => (item[idField] === idValue ? updatedItem : item));
    switch (entityType) {
      case 'universities':
        setUniversities(updater);
        break;
      case 'departments':
        setDepartments(updater);
        break;
      case 'faculty':
        setFaculty(updater);
        break;
      case 'students':
        setStudents(updater);
        break;
      case 'courses':
        setCourses(updater);
        break;
      case 'registrations':
        setRegistrations(updater);
        break;
      case 'schemes':
        setSchemes(updater);
        break;
      case 'applications':
        setApplications(updater);
        break;
      case 'bank-accounts':
        setBankAccounts(updater);
        break;
      case 'disbursements':
        setDisbursements(updater);
        break;
      default:
        break;
    }
    addToast({
      title: 'Record Updated',
      message: `Successfully updated record in ${entityType}.`,
      type: 'info',
    });
  };

  const deleteEntity = async (entityType, idField, idValue) => {
    try {
      await api.deleteEntity(entityType, idValue);
    } catch {
      // offline fallback
    }

    const filterer = (list) => list.filter((item) => item[idField] !== idValue);
    switch (entityType) {
      case 'universities':
        setUniversities(filterer);
        break;
      case 'departments':
        setDepartments(filterer);
        break;
      case 'faculty':
        setFaculty(filterer);
        break;
      case 'students':
        setStudents(filterer);
        break;
      case 'courses':
        setCourses(filterer);
        break;
      case 'registrations':
        setRegistrations(filterer);
        break;
      case 'schemes':
        setSchemes(filterer);
        break;
      case 'applications':
        setApplications(filterer);
        break;
      case 'bank-accounts':
        setBankAccounts(filterer);
        break;
      default:
        break;
    }
    addToast({
      title: 'Record Deleted',
      message: `Record was removed from ${entityType}.`,
      type: 'danger',
    });
  };

  // Reset to sample defaults
  const resetAllData = () => {
    setUniversities(INITIAL_UNIVERSITIES);
    setDepartments(INITIAL_DEPARTMENTS);
    setFaculty(INITIAL_FACULTY);
    setCourses(INITIAL_COURSES);
    setStudents(INITIAL_STUDENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setSchemes(INITIAL_SCHEMES);
    setApplications(INITIAL_APPLICATIONS);
    setValidators(INITIAL_VALIDATORS);
    setDisbursements(INITIAL_DISBURSEMENTS);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setAiModels(INITIAL_AI_MODELS);
    setReports(INITIAL_REPORTS);
    setAnomalies(INITIAL_ANOMALIES);
    localStorage.clear();
    addToast({
      title: 'System Reset',
      message: 'State has been reset to default university configuration.',
      type: 'info',
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedUniversity,
        setSelectedUniversity,
        financialYear,
        setFinancialYear,
        quarter,
        setQuarter,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationOpen,
        setIsNotificationOpen,

        // Auth & Backend Status
        currentUser,
        setCurrentUser,
        switchUser,
        isBackendConnected,
        statementSummary,
        fetchLiveData,

        // Data Lists
        universities,
        departments,
        faculty,
        courses,
        students,
        registrations,
        schemes,
        applications,
        validators,
        disbursements,
        bankAccounts,
        aiModels,
        reports,
        anomalies,
        sampleTransactions: SAMPLE_TRANSACTIONS,

        // Statements Actions
        uploadBankStatement,
        replaceBankStatement,
        bulkUploadStatements,
        saveProgress,
        submitAllStatements,

        // CRUD Actions
        addEntity,
        updateEntity,
        deleteEntity,
        resetAllData,

        // Notifications & Toasts
        notifications,
        setNotifications,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
