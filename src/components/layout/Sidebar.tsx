import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Building2,
  CreditCard,
  FileCheck2,
  FileSpreadsheet,
  History,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  PlugZap,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useFinSight } from '../../context/FinSightContext';
import { ORGANISATIONS } from '../../data/mockOrganisations';
import { DateRangePreset, NavPageId } from '../../types';

interface NavGroup {
  group: string;
  items: { id: NavPageId; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { id: 'executive-dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'ai-intelligence', label: 'AI Intelligence Centre', icon: BrainCircuit },
    ],
  },
  {
    group: 'Financial Intelligence',
    items: [
      { id: 'financial-analytics', label: 'Financial Analytics', icon: BarChart3 },
      { id: 'transaction-monitoring', label: 'Transaction Monitoring', icon: Activity },
      { id: 'fraud-detection', label: 'Fraud Detection', icon: ShieldAlert },
      { id: 'credit-lending', label: 'Credit & Lending Intelligence', icon: Landmark },
      { id: 'financial-reconciliation', label: 'Financial Reconciliation', icon: ArrowLeftRight },
    ],
  },
  {
    group: 'Risk & Compliance',
    items: [
      { id: 'risk-management', label: 'Risk Management', icon: CreditCard },
      { id: 'kyc-aml', label: 'KYC & AML', icon: FileCheck2 },
      { id: 'compliance-monitoring', label: 'Compliance Monitoring', icon: ShieldCheck },
    ],
  },
  {
    group: 'AI Operations',
    items: [
      { id: 'ai-agent-centre', label: 'AI Agent Centre', icon: Bot },
      { id: 'agent-history', label: 'Agent Execution History', icon: History },
      { id: 'ai-recommendations', label: 'AI Recommendations', icon: Lightbulb },
    ],
  },
  {
    group: 'Administration',
    items: [
      { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
      { id: 'integrations', label: 'Integrations', icon: PlugZap },
      { id: 'org-settings', label: 'Organisation Settings', icon: Building2 },
      { id: 'user-management', label: 'User Management', icon: Users },
    ],
  },
];

export function Sidebar() {
  const {
    activePage,
    setActivePage,
    mobileNavOpen,
    setMobileNavOpen,
    selectedOrg,
    setSelectedOrgId,
    dateRange,
    setDateRange,
  } = useFinSight();

  const handleSelect = (id: NavPageId) => {
    setActivePage(id);
    setMobileNavOpen(false);
  };

  const navContent = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sky-400 dark:bg-sky-600 dark:text-white">
            <BrainCircuit className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              FinSight AI
            </div>
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Financial Intelligence
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation menu"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-2 border-b border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
        <select
          aria-label="Mobile Organisation Selector"
          value={selectedOrg.id}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {ORGANISATIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.shortName}
            </option>
          ))}
        </select>
        <select
          aria-label="Mobile Date Range Selector"
          value={dateRange.preset}
          onChange={(e) =>
            setDateRange({ ...dateRange, preset: e.target.value as DateRangePreset })
          }
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <nav
        aria-label="Primary Sidebar Navigation"
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
      >
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group}>
            <div className="mb-1.5 px-3 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500">
              {grp.group}
            </div>
            <ul className="space-y-0.5">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="font-medium text-slate-700 dark:text-slate-300">Simulated Environment</div>
        <div className="mt-0.5">Illustrative institutional telemetry</div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 lg:block">{navContent}</aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[270px] max-w-[85vw]">{navContent}</aside>
        </div>
      )}
    </>
  );
}
