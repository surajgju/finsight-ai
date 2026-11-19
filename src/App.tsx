import { CopilotDrawer } from './components/common/CopilotDrawer';
import { TransactionDrawer } from './components/common/TransactionDrawer';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { FinSightProvider, useFinSight } from './context/FinSightContext';
import {
  IntegrationsPage,
  OrgSettingsPage,
  ReportsPage,
  UserManagementPage,
} from './pages/admin/AdminPages';
import {
  AgentExecutionHistory,
  AIAgentCentre,
  AIRecommendations,
} from './pages/agents/AgentCentre';
import { FinancialAnalytics } from './pages/analytics/FinancialAnalytics';
import { KycAml } from './pages/compliance/KycAml';
import { ComplianceMonitoring, RiskManagement } from './pages/compliance/RiskAndCompliance';
import { FraudDetection } from './pages/fraud/FraudDetection';
import { AIIntelligenceCentre } from './pages/intelligence/AIIntelligenceCentre';
import { CreditLending } from './pages/lending/CreditLending';
import { ExecutiveDashboard } from './pages/overview/ExecutiveDashboard';
import { FinancialReconciliation } from './pages/reconciliation/FinancialReconciliation';
import { TransactionMonitoring } from './pages/transactions/TransactionMonitoring';

function DashboardShell() {
  const { activePage, toastMessage } = useFinSight();

  const renderPage = () => {
    switch (activePage) {
      case 'executive-dashboard':
        return <ExecutiveDashboard />;
      case 'ai-intelligence':
        return <AIIntelligenceCentre />;
      case 'financial-analytics':
        return <FinancialAnalytics />;
      case 'transaction-monitoring':
        return <TransactionMonitoring />;
      case 'fraud-detection':
        return <FraudDetection />;
      case 'credit-lending':
        return <CreditLending />;
      case 'financial-reconciliation':
        return <FinancialReconciliation />;
      case 'risk-management':
        return <RiskManagement />;
      case 'kyc-aml':
        return <KycAml />;
      case 'compliance-monitoring':
        return <ComplianceMonitoring />;
      case 'ai-agent-centre':
        return <AIAgentCentre />;
      case 'agent-history':
        return <AgentExecutionHistory />;
      case 'ai-recommendations':
        return <AIRecommendations />;
      case 'reports':
        return <ReportsPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'org-settings':
        return <OrgSettingsPage />;
      case 'user-management':
        return <UserManagementPage />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="flex-1 px-4 py-6 lg:px-8">{renderPage()}</main>

        <footer className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 lg:px-8 dark:border-slate-800 dark:text-slate-400">
          FinSight AI — Intelligence Behind Every Financial Decision · Simulated enterprise dataset for demonstration purposes.
        </footer>
      </div>

      <TransactionDrawer />
      <CopilotDrawer />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 bottom-5 z-50 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <FinSightProvider>
      <DashboardShell />
    </FinSightProvider>
  );
}
