import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Breadcrumbs from './components/layout/Breadcrumbs';
import ToastContainer from './components/layout/ToastContainer';
import GlobalSearchModal from './components/layout/GlobalSearchModal';
import NotificationDrawer from './components/layout/NotificationDrawer';

// Views
import QuarterlyStatementUploadView from './components/views/QuarterlyStatementUploadView';
import DashboardView from './components/views/DashboardView';
import AiValidationView from './components/views/AiValidationView';
import EntitiesView from './components/views/EntitiesView';
import FinancialAnalysisView from './components/views/FinancialAnalysisView';
import IncomeExpenditureView from './components/views/IncomeExpenditureView';
import FundFlowView from './components/views/FundFlowView';
import BudgetGrantsView from './components/views/BudgetGrantsView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
import HelpSupportView from './components/views/HelpSupportView';

import './index.css';
import './App.css';

function MainContent() {
  const { activeTab } = useApp();

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'upload-statements':
        return <QuarterlyStatementUploadView />;
      case 'ai-validation':
        return <AiValidationView />;
      case 'financial-analysis':
        return <FinancialAnalysisView />;
      case 'income-expenditure':
        return <IncomeExpenditureView />;
      case 'fund-flow':
        return <FundFlowView />;
      case 'budget-grants':
        return <BudgetGrantsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'help-support':
        return <HelpSupportView />;

      // Reusable Entity Management Views (ER Diagram)
      case 'universities':
      case 'departments':
      case 'faculty':
      case 'students':
      case 'courses':
      case 'registrations':
      case 'schemes':
      case 'applications':
      case 'bank-accounts':
      case 'disbursements':
        return <EntitiesView entityType={activeTab} />;

      default:
        return <QuarterlyStatementUploadView />;
    }
  };

  return (
    <div className="app-shell">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Sticky Top Header */}
        <Header />

        {/* Dynamic Page Container */}
        <main className="page-container">
          <Breadcrumbs />
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Overlays & Notifications */}
      <GlobalSearchModal />
      <NotificationDrawer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
