import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AIInsight,
  AIRecommendation,
  AuditLogEntry,
  DateRangeFilter,
  DemoActor,
  FraudCase,
  IntegrationItem,
  KpiMetric,
  KycRecord,
  MakerCheckerApproval,
  NavPageId,
  NotificationItem,
  Organisation,
  ReconciliationRecord,
  TeamUser,
  TransactionRecord,
  TransactionStatus,
} from '../types';
import {
  INITIAL_INTEGRATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TEAM_USERS,
  ORGANISATIONS,
} from '../data/mockOrganisations';
import { INITIAL_TRANSACTIONS } from '../data/mockTransactions';
import { INITIAL_AI_INSIGHTS, INITIAL_FRAUD_CASES, INITIAL_RECOMMENDATIONS } from '../data/mockFraudCases';
import { INITIAL_KYC_RECORDS } from '../data/mockCompliance';
import { INITIAL_RECONCILIATION_RECORDS } from '../data/mockReconciliation';
import { computeExecutiveKPIs, filterTransactionsByScope } from '../services/analyticsService';

export const DEMO_ACTORS: DemoActor[] = [
  {
    id: 'actor-checker',
    name: 'Arjun Deshmukh',
    title: 'Chief Risk Officer · Mumbai',
    governanceRole: 'Checker',
  },
  {
    id: 'actor-maker',
    name: 'Kavya Nair',
    title: 'Fraud Ops Lead · Bengaluru',
    governanceRole: 'Maker',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-4104',
    timestamp: '2026-11-19 14:12 IST',
    actorName: 'Kavya Nair',
    actorTitle: 'Fraud Ops Lead (Maker)',
    action: 'Requested High-Value Block (Dual-Control)',
    entityType: 'Transaction',
    entityId: 'TXN-98233',
    previousValue: 'High',
    newValue: 'Pending Checker (Flagged)',
    note: 'IMPS ₹1,20,000 velocity burst linked to Surat corridor mule watch.',
  },
  {
    id: 'AUD-4103',
    timestamp: '2026-11-19 13:48 IST',
    actorName: 'Arjun Deshmukh',
    actorTitle: 'Chief Risk Officer (Checker)',
    action: 'Checker Approved Action',
    entityType: 'AI Policy',
    entityId: 'REC-002',
    previousValue: 'Pending Review',
    newValue: 'Approved',
    note: 'Dual-control sign-off for IMPS ₹1L+ velocity step-up OTP verification.',
  },
  {
    id: 'AUD-4102',
    timestamp: '2026-11-19 12:30 IST',
    actorName: 'Meera Iyer',
    actorTitle: 'Compliance Officer',
    action: 'AML Sanctions Escalation',
    entityType: 'KYC Record',
    entityId: 'KYC-3002',
    previousValue: 'Pending KYC',
    newValue: 'AML Flagged',
    note: 'Queued for FIU-IND statutory STR review within 7-day SLA.',
  },
  {
    id: 'AUD-4101',
    timestamp: '2026-11-19 11:15 IST',
    actorName: 'FinSight Recon Agent',
    actorTitle: 'Autonomous Reconciliation Engine',
    action: 'Auto-Matched Escrow Settlement',
    entityType: 'Reconciliation',
    entityId: 'RCN-6001',
    previousValue: 'Unmatched',
    newValue: 'Matched',
    note: 'NPCI UTR hash reconciled across HDFC Escrow & Razorpay PG.',
  },
];

const INITIAL_APPROVALS: MakerCheckerApproval[] = [
  {
    id: 'APR-902',
    createdAt: '2026-11-19 14:12 IST',
    makerName: 'Kavya Nair',
    makerTitle: 'Fraud Ops Lead',
    actionTitle: 'High-Value Rail Block (>= ₹1,00,000)',
    entityType: 'Transaction',
    entityId: 'TXN-98233',
    amountINR: 120000,
    targetStatus: 'Blocked',
    summary: 'Block IMPS payout to unregistered beneficiary clustered with Surat mule ring.',
    status: 'Pending Checker',
  },
  {
    id: 'APR-901',
    createdAt: '2026-11-19 13:20 IST',
    makerName: 'Kavya Nair',
    makerTitle: 'Fraud Ops Lead',
    actionTitle: 'Deploy AI Velocity Rule REC-002',
    entityType: 'AI Policy',
    entityId: 'REC-002',
    targetStatus: 'Deployed',
    summary: 'Enable dynamic step-up MFA for new-beneficiary IMPS transfers above ₹1,00,000.',
    status: 'Approved',
    checkerName: 'Arjun Deshmukh',
    resolvedAt: '2026-11-19 13:48 IST',
  },
];

const STORAGE_KEY = 'finsight_demo_state_v1';

interface PersistedDemoState {
  transactions?: TransactionRecord[];
  fraudCases?: FraudCase[];
  kycRecords?: KycRecord[];
  reconciliationRecords?: ReconciliationRecord[];
  recommendations?: AIRecommendation[];
  auditLogs?: AuditLogEntry[];
  approvals?: MakerCheckerApproval[];
  activeActorId?: string;
}

function loadPersistedState(): PersistedDemoState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedDemoState;
  } catch {
    return {};
  }
}

function formatNowIST(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10);
  const timePart = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart} ${timePart} IST`;
}

interface FinSightContextValue {
  activePage: NavPageId;
  setActivePage: (page: NavPageId) => void;
  selectedOrg: Organisation;
  setSelectedOrgId: (id: string) => void;
  dateRange: DateRangeFilter;
  setDateRange: (range: DateRangeFilter) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  activeActor: DemoActor;
  setActiveActorId: (id: string) => void;
  auditLogs: AuditLogEntry[];
  approvals: MakerCheckerApproval[];
  pendingApprovalCount: number;
  resolveApproval: (id: string, decision: 'Approved' | 'Rejected') => void;

  transactions: TransactionRecord[];
  scopedTransactions: TransactionRecord[];
  updateTransactionStatus: (id: string, status: TransactionStatus, note?: string) => void;
  importTransactionBatch: (rows: TransactionRecord[], sourceLabel: string) => void;
  pushLiveTransaction: (txn: TransactionRecord) => void;
  selectedTransaction: TransactionRecord | null;
  setSelectedTransactionId: (id: string | null) => void;

  fraudCases: FraudCase[];
  updateFraudCaseStatus: (id: string, status: FraudCase['status']) => void;

  insights: AIInsight[];
  acknowledgeInsight: (id: string) => void;

  recommendations: AIRecommendation[];
  updateRecommendationStatus: (id: string, status: AIRecommendation['status']) => void;

  kycRecords: KycRecord[];
  updateKycStatus: (id: string, status: KycRecord['verificationStatus']) => void;

  reconciliationRecords: ReconciliationRecord[];
  resolveReconciliation: (id: string) => void;
  importReconciliationBatch: (rows: ReconciliationRecord[], sourceLabel: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  integrations: IntegrationItem[];
  toggleIntegration: (id: string) => void;

  teamUsers: TeamUser[];
  addTeamUser: (user: Omit<TeamUser, 'id' | 'status' | 'lastActive'>) => void;

  kpis: KpiMetric[];
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  copilotSeedPrompt: string | null;
  openCopilotWithPrompt: (prompt: string) => void;
  clearCopilotSeedPrompt: () => void;

  resetDemoState: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const FinSightContext = createContext<FinSightContextValue | undefined>(undefined);

export function FinSightProvider({ children }: { children: React.ReactNode }) {
  const initialPersisted = useMemo(() => loadPersistedState(), []);

  const [activePage, setActivePage] = useState<NavPageId>('executive-dashboard');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-apex');
  const [dateRange, setDateRange] = useState<DateRangeFilter>({ preset: '30d' });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [activeActorId, setActiveActorId] = useState<string>(
    initialPersisted.activeActorId ?? DEMO_ACTORS[0].id,
  );
  const [transactions, setTransactions] = useState<TransactionRecord[]>(
    initialPersisted.transactions ?? INITIAL_TRANSACTIONS,
  );
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [fraudCases, setFraudCases] = useState<FraudCase[]>(
    initialPersisted.fraudCases ?? INITIAL_FRAUD_CASES,
  );
  const [insights, setInsights] = useState<AIInsight[]>(INITIAL_AI_INSIGHTS);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    initialPersisted.recommendations ?? INITIAL_RECOMMENDATIONS,
  );
  const [kycRecords, setKycRecords] = useState<KycRecord[]>(
    initialPersisted.kycRecords ?? INITIAL_KYC_RECORDS,
  );
  const [reconciliationRecords, setReconciliationRecords] = useState<ReconciliationRecord[]>(
    initialPersisted.reconciliationRecords ?? INITIAL_RECONCILIATION_RECORDS,
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(
    initialPersisted.auditLogs ?? INITIAL_AUDIT_LOGS,
  );
  const [approvals, setApprovals] = useState<MakerCheckerApproval[]>(
    initialPersisted.approvals ?? INITIAL_APPROVALS,
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>(INITIAL_TEAM_USERS);

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotSeedPrompt, setCopilotSeedPrompt] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload: PersistedDemoState = {
        transactions: transactions.slice(0, 200),
        fraudCases,
        kycRecords,
        reconciliationRecords: reconciliationRecords.slice(0, 150),
        recommendations,
        auditLogs: auditLogs.slice(0, 150),
        approvals: approvals.slice(0, 60),
        activeActorId,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in restricted iframe environments
    }
  }, [
    transactions,
    fraudCases,
    kycRecords,
    reconciliationRecords,
    recommendations,
    auditLogs,
    approvals,
    activeActorId,
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3400);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeActor = useMemo(
    () => DEMO_ACTORS.find((a) => a.id === activeActorId) ?? DEMO_ACTORS[0],
    [activeActorId],
  );

  const pendingApprovalCount = useMemo(
    () => approvals.filter((a) => a.status === 'Pending Checker').length,
    [approvals],
  );

  const selectedOrg = useMemo(
    () => ORGANISATIONS.find((o) => o.id === selectedOrgId) ?? ORGANISATIONS[0],
    [selectedOrgId],
  );

  const scopedTransactions = useMemo(
    () => filterTransactionsByScope(transactions, selectedOrg.id, dateRange),
    [transactions, selectedOrg.id, dateRange],
  );

  const kpis = useMemo(
    () => computeExecutiveKPIs(selectedOrg, dateRange, scopedTransactions),
    [selectedOrg, dateRange, scopedTransactions],
  );

  const selectedTransaction = useMemo(
    () => transactions.find((t) => t.id === selectedTransactionId) ?? null,
    [transactions, selectedTransactionId],
  );

  const appendAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${4105 + auditLogs.length}`,
      timestamp: formatNowIST(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const updateTransactionStatus = (id: string, status: TransactionStatus, note?: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    if (status === 'Blocked' && target.amountINR >= 100000 && activeActor.governanceRole === 'Maker') {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: 'Flagged',
                reviewerNote: note || 'Queued for Checker dual-control sign-off',
              }
            : t,
        ),
      );
      const newApproval: MakerCheckerApproval = {
        id: `APR-${903 + approvals.length}`,
        createdAt: formatNowIST(),
        makerName: activeActor.name,
        makerTitle: activeActor.title,
        actionTitle: 'High-Value Rail Block (>= ₹1,00,000)',
        entityType: 'Transaction',
        entityId: id,
        amountINR: target.amountINR,
        targetStatus: 'Blocked',
        summary: note || `Hold & block ${target.rail} transfer for ${target.customerName}`,
        status: 'Pending Checker',
      };
      setApprovals((prev) => [newApproval, ...prev]);
      appendAuditLog({
        actorName: activeActor.name,
        actorTitle: `${activeActor.title} (Maker)`,
        action: 'Requested High-Value Block (Dual-Control)',
        entityType: 'Transaction',
        entityId: id,
        previousValue: target.status,
        newValue: 'Pending Checker (Flagged)',
        note: newApproval.summary,
      });
      showToast(`${id} queued for Checker dual-control approval`);
      return;
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, reviewerNote: note ?? t.reviewerNote } : t)),
    );
    appendAuditLog({
      actorName: activeActor.name,
      actorTitle: `${activeActor.title} (${activeActor.governanceRole})`,
      action: 'Transaction Status Updated',
      entityType: 'Transaction',
      entityId: id,
      previousValue: target.status,
      newValue: status,
      note: note ?? `Manual triage disposition by ${activeActor.name}`,
    });
    showToast(`${id} marked as ${status}`);
  };

  const importTransactionBatch = (rows: TransactionRecord[], sourceLabel: string) => {
    if (rows.length === 0) {
      showToast('No valid transaction rows found in CSV batch');
      return;
    }
    setTransactions((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const uniqueNew = rows.filter((r) => !existingIds.has(r.id));
      return [...uniqueNew, ...prev];
    });
    appendAuditLog({
      actorName: activeActor.name,
      actorTitle: `${activeActor.title} (${activeActor.governanceRole})`,
      action: 'Automated CSV Risk Triage',
      entityType: 'Batch Import',
      entityId: sourceLabel,
      previousValue: '0 rows',
      newValue: `${rows.length} scored`,
      note: `Ingested and risk-scored ${rows.length} ledger instructions (${rows.filter((r) => r.riskScore >= 75).length} high-risk).`,
    });
    showToast(`Ingested & risk-scored ${rows.length} transactions`);
  };

  const pushLiveTransaction = useCallback((txn: TransactionRecord) => {
    setTransactions((prev) => {
      if (prev.some((t) => t.id === txn.id)) return prev;
      return [txn, ...prev].slice(0, 220);
    });
  }, []);

  const updateFraudCaseStatus = (id: string, status: FraudCase['status']) => {
    const target = fraudCases.find((c) => c.id === id);
    setFraudCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    if (target) {
      appendAuditLog({
        actorName: activeActor.name,
        actorTitle: `${activeActor.title} (${activeActor.governanceRole})`,
        action: 'Fraud Case Escalation Updated',
        entityType: 'Fraud Case',
        entityId: id,
        previousValue: target.status,
        newValue: status,
        note: `Case ${target.title} disposition updated`,
      });
    }
    showToast(`Case ${id} updated to ${status}`);
  };

  const acknowledgeInsight = (id: string) => {
    setInsights((prev) => prev.map((ins) => (ins.id === id ? { ...ins, acknowledged: true } : ins)));
    showToast('AI insight marked as acknowledged');
  };

  const updateRecommendationStatus = (id: string, status: AIRecommendation['status']) => {
    const target = recommendations.find((r) => r.id === id);
    if (!target) return;

    if (status === 'Deployed' && activeActor.governanceRole === 'Maker') {
      const newApproval: MakerCheckerApproval = {
        id: `APR-${903 + approvals.length}`,
        createdAt: formatNowIST(),
        makerName: activeActor.name,
        makerTitle: activeActor.title,
        actionTitle: `Deploy AI Policy ${id}`,
        entityType: 'AI Policy',
        entityId: id,
        targetStatus: 'Deployed',
        summary: target.title,
        status: 'Pending Checker',
      };
      setApprovals((prev) => [newApproval, ...prev]);
      appendAuditLog({
        actorName: activeActor.name,
        actorTitle: `${activeActor.title} (Maker)`,
        action: 'Requested AI Policy Deployment',
        entityType: 'AI Policy',
        entityId: id,
        previousValue: target.status,
        newValue: 'Pending Checker',
        note: target.title,
      });
      showToast(`${id} deployment queued for Checker approval`);
      return;
    }

    setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    appendAuditLog({
      actorName: activeActor.name,
      actorTitle: `${activeActor.title} (${activeActor.governanceRole})`,
      action: 'AI Policy Status Changed',
      entityType: 'AI Policy',
      entityId: id,
      previousValue: target.status,
      newValue: status,
      note: target.title,
    });
    showToast(`Recommendation ${id} status set to ${status}`);
  };

  const updateKycStatus = (id: string, status: KycRecord['verificationStatus']) => {
    const target = kycRecords.find((k) => k.id === id);
    setKycRecords((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              verificationStatus: status,
              lastVerifiedDate: '2026-11-19',
            }
          : k,
      ),
    );
    if (target) {
      appendAuditLog({
        actorName: activeActor.name,
        actorTitle: `${activeActor.title} (${activeActor.governanceRole})`,
        action: 'KYC Verification Updated',
        entityType: 'KYC Record',
        entityId: id,
        previousValue: target.verificationStatus,
        newValue: status,
        note: `${target.customerName} compliance status updated`,
      });
    }
    showToast(`${id} updated to ${status}`);
  };

  const resolveReconciliation = (id: string) => {
    const target = reconciliationRecords.find((r) => r.id === id);
    setReconciliationRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'Resolved', varianceINR: 0, settledAmountINR: r.expectedAmountINR }
          : r,
      ),
    );
    if (target) {
      appendAuditLog({
        actorName: activeActor.name,
        actorTitle: `${activeActor.title} (${activeActor.governanceRole})`,
        action: 'Reconciliation Variance Resolved',
        entityType: 'Reconciliation',
        entityId: id,
        previousValue: target.status,
        newValue: 'Resolved',
        note: `Cleared ${target.sourceLedger} discrepancy (${target.transactionRef})`,
      });
    }
    showToast(`Reconciliation item ${id} resolved`);
  };

  const importReconciliationBatch = (rows: ReconciliationRecord[], sourceLabel: string) => {
    if (rows.length === 0) {
      showToast('No valid settlement rows found in CSV');
      return;
    }
    setReconciliationRecords((prev) => [...rows, ...prev]);
    const exceptions = rows.filter((r) => r.status !== 'Matched').length;
    appendAuditLog({
      actorName: activeActor.name,
      actorTitle: `${activeActor.title} (${activeActor.governanceRole})`,
      action: 'Nodal Settlement Batch Matched',
      entityType: 'Reconciliation',
      entityId: sourceLabel,
      previousValue: 'Pending Batch',
      newValue: `${rows.length} rows (${exceptions} exceptions)`,
      note: `Automated UTR matching completed against active nodal ledger`,
    });
    showToast(`Reconciled ${rows.length} rows (${exceptions} exceptions flagged)`);
  };

  const resolveApproval = (id: string, decision: 'Approved' | 'Rejected') => {
    if (activeActor.governanceRole !== 'Checker') {
      showToast('Switch to Checker role (Arjun Deshmukh) to resolve approvals');
      return;
    }

    const approval = approvals.find((a) => a.id === id);
    if (!approval || approval.status !== 'Pending Checker') return;

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: decision,
              checkerName: activeActor.name,
              resolvedAt: formatNowIST(),
            }
          : a,
      ),
    );

    if (decision === 'Approved') {
      if (approval.entityType === 'Transaction') {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === approval.entityId
              ? {
                  ...t,
                  status: approval.targetStatus as TransactionStatus,
                  reviewerNote: `Checker approved by ${activeActor.name}`,
                }
              : t,
          ),
        );
      } else if (approval.entityType === 'AI Policy') {
        setRecommendations((prev) =>
          prev.map((r) =>
            r.id === approval.entityId
              ? { ...r, status: approval.targetStatus as AIRecommendation['status'] }
              : r,
          ),
        );
      }
    }

    appendAuditLog({
      actorName: activeActor.name,
      actorTitle: `${activeActor.title} (Checker)`,
      action: decision === 'Approved' ? 'Checker Approved Action' : 'Checker Rejected Action',
      entityType: approval.entityType,
      entityId: approval.entityId,
      previousValue: 'Pending Checker',
      newValue: decision === 'Approved' ? approval.targetStatus : 'Rejected',
      note: `${approval.actionTitle} · Maker: ${approval.makerName}`,
    });

    showToast(`${approval.entityId} ${decision.toLowerCase()} by ${activeActor.name}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
    showToast('Integration sync configuration updated');
  };

  const addTeamUser = (user: Omit<TeamUser, 'id' | 'status' | 'lastActive'>) => {
    const newUser: TeamUser = {
      ...user,
      id: `usr-${teamUsers.length + 1}`,
      status: 'Invited',
      lastActive: 'Invite sent just now',
    };
    setTeamUsers((prev) => [newUser, ...prev]);
    showToast(`Invitation sent to ${user.email}`);
  };

  const openCopilotWithPrompt = (prompt: string) => {
    setCopilotSeedPrompt(prompt);
    setCopilotOpen(true);
  };

  const clearCopilotSeedPrompt = () => setCopilotSeedPrompt(null);

  const resetDemoState = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setTransactions(INITIAL_TRANSACTIONS);
    setFraudCases(INITIAL_FRAUD_CASES);
    setKycRecords(INITIAL_KYC_RECORDS);
    setReconciliationRecords(INITIAL_RECONCILIATION_RECORDS);
    setRecommendations(INITIAL_RECOMMENDATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setApprovals(INITIAL_APPROVALS);
    setActiveActorId(DEMO_ACTORS[0].id);
    showToast('Demo environment reset to baseline telemetry');
  };

  return (
    <FinSightContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedOrg,
        setSelectedOrgId,
        dateRange,
        setDateRange,
        theme,
        toggleTheme,
        mobileNavOpen,
        setMobileNavOpen,
        activeActor,
        setActiveActorId,
        auditLogs,
        approvals,
        pendingApprovalCount,
        resolveApproval,
        transactions,
        scopedTransactions,
        updateTransactionStatus,
        importTransactionBatch,
        pushLiveTransaction,
        selectedTransaction,
        setSelectedTransactionId,
        fraudCases,
        updateFraudCaseStatus,
        insights,
        acknowledgeInsight,
        recommendations,
        updateRecommendationStatus,
        kycRecords,
        updateKycStatus,
        reconciliationRecords,
        resolveReconciliation,
        importReconciliationBatch,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        integrations,
        toggleIntegration,
        teamUsers,
        addTeamUser,
        kpis,
        copilotOpen,
        setCopilotOpen,
        copilotSeedPrompt,
        openCopilotWithPrompt,
        clearCopilotSeedPrompt,
        resetDemoState,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </FinSightContext.Provider>
  );
}

export function useFinSight(): FinSightContextValue {
  const ctx = useContext(FinSightContext);
  if (!ctx) {
    throw new Error('useFinSight must be used inside FinSightProvider');
  }
  return ctx;
}
