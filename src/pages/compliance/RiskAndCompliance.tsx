import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  History,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DEMO_ACTORS, useFinSight } from '../../context/FinSightContext';
import { MOCK_CUSTOMERS } from '../../data/mockCustomers';
import { downloadCSV, formatINR, formatINRCompact } from '../../utils/formatters';

const ENTERPRISE_RISK_DOMAINS = [
  { domain: 'Payment Fraud & Mule Rings', score: 24, limit: 35, trend: 'Improving' },
  { domain: 'MSME Credit Portfolio PD', score: 19, limit: 30, trend: 'Watch: Textiles' },
  { domain: 'Intraday Escrow Liquidity', score: 15, limit: 25, trend: 'Stable' },
  { domain: 'Gateway & Operational SLA', score: 21, limit: 25, trend: 'Elevated PG Lag' },
  { domain: 'Regulatory & KYC Drift', score: 13, limit: 20, trend: 'Nominal' },
];

const COMPLIANCE_CONTROLS = [
  {
    id: 'CTRL-RBI-01',
    regulation: 'RBI Master Direction on KYC (Periodic Updation)',
    owner: 'Meera Iyer',
    coverage: '98.7%',
    lastAudit: '2026-11-18',
    status: 'Compliant',
  },
  {
    id: 'CTRL-FIU-02',
    regulation: 'PMLA / FIU-IND Cash & Suspicious Transaction Reporting',
    owner: 'Kavya Nair',
    coverage: '100.0%',
    lastAudit: '2026-11-19',
    status: 'Active Review',
  },
  {
    id: 'CTRL-NPCI-03',
    regulation: 'NPCI UPI Dispute & Chargeback Turnaround (T+1)',
    owner: 'Siddharth Verma',
    coverage: '97.9%',
    lastAudit: '2026-11-17',
    status: 'Compliant',
  },
  {
    id: 'CTRL-RBI-04',
    regulation: 'RBI Digital Lending Guidelines (KFS & Nodal Escrow)',
    owner: 'Rohan Kulkarni',
    coverage: '99.4%',
    lastAudit: '2026-11-16',
    status: 'Compliant',
  },
  {
    id: 'CTRL-CERT-05',
    regulation: 'CERT-In 6-Hour Incident Telemetry Retention',
    owner: 'Arjun Deshmukh',
    coverage: '100.0%',
    lastAudit: '2026-11-19',
    status: 'Compliant',
  },
];

export function RiskManagement() {
  const { showToast } = useFinSight();
  const [riskAppetiteCeiling, setRiskAppetiteCeiling] = useState(25);

  const highRiskCustomers = MOCK_CUSTOMERS.filter((c) => c.riskScore >= 55).sort(
    (a, b) => b.riskScore - a.riskScore,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Enterprise Risk Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Cross-domain risk appetite thresholds, customer concentration exposure, and stress controls
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
          <label htmlFor="risk-ceiling" className="font-medium text-slate-700 dark:text-slate-200">
            Portfolio Risk Ceiling: <span className="font-mono font-bold">{riskAppetiteCeiling}/100</span>
          </label>
          <input
            id="risk-ceiling"
            type="range"
            min={15}
            max={45}
            value={riskAppetiteCeiling}
            onChange={(e) => {
              setRiskAppetiteCeiling(Number(e.target.value));
              showToast(`Risk appetite threshold adjusted to ${e.target.value}/100`);
            }}
            className="accent-sky-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Risk Exposure vs Institutional Appetite Limit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current score vs board-approved limit across 5 risk pillars
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ENTERPRISE_RISK_DOMAINS} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="domain" width={155} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="score" name="Current Risk" fill="#0284c7" radius={[0, 4, 4, 0]} />
                <Bar dataKey="limit" name="Appetite Limit" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Domain Risk Summary
            </h2>
          </div>
          <div className="mt-4 space-y-2.5 text-xs">
            {ENTERPRISE_RISK_DOMAINS.map((d) => (
              <div
                key={d.domain}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{d.domain}</div>
                  <div className="text-[11px] text-slate-500">{d.trend}</div>
                </div>
                <span
                  className={`font-mono font-semibold tabular-nums ${
                    d.score > riskAppetiteCeiling
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {d.score} / {d.limit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-Risk Customer Watchlist */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Elevated Risk Customer Profiles ({highRiskCustomers.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Customer ID</th>
                <th className="px-4 py-3 font-medium">Name & City</th>
                <th className="px-4 py-3 font-medium">Segment</th>
                <th className="px-4 py-3 text-right font-medium">Monthly Volume</th>
                <th className="px-4 py-3 text-right font-medium">Linked Accounts</th>
                <th className="px-5 py-3 text-right font-medium">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {highRiskCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {c.name} · <span className="font-normal text-slate-500">{c.city}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.segment}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatINRCompact(c.monthlyVolumeINR)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {c.linkedAccounts}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold tabular-nums text-red-600 dark:text-red-400">
                    {c.riskScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ComplianceMonitoring() {
  const {
    activeActor,
    setActiveActorId,
    approvals,
    pendingApprovalCount,
    resolveApproval,
    auditLogs,
    showToast,
  } = useFinSight();
  const [controls, setControls] = useState(COMPLIANCE_CONTROLS);
  const [auditQuery, setAuditQuery] = useState('');

  const runPolicyAudit = () => {
    setControls((prev) =>
      prev.map((c) => ({ ...c, lastAudit: '2026-11-19', status: 'Compliant' })),
    );
    showToast('Automated RBI & PMLA compliance control sweep completed');
  };

  const filteredAuditLogs = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (a) =>
        a.entityId.toLowerCase().includes(q) ||
        a.actorName.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.note.toLowerCase().includes(q),
    );
  }, [auditLogs, auditQuery]);

  const toggleActorRole = () => {
    const next =
      activeActor.governanceRole === 'Maker' ? DEMO_ACTORS[0] : DEMO_ACTORS[1];
    setActiveActorId(next.id);
    showToast(`Switched active actor to ${next.name} (${next.governanceRole})`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Regulatory Compliance & Governance
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            RBI, FIU-IND, NPCI, and CERT-In control verification, Maker-Checker dual-control queue, and immutable audit ledger
          </p>
        </div>

        <button
          type="button"
          onClick={runPolicyAudit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Run Automated Control Audit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Overall Compliance Score</div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
            96.8%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Audit-ready posture</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Pending Dual-Control Approvals</div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums dark:text-amber-400">
            {pendingApprovalCount} Pending
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Requires Checker CRO sign-off</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Controls Passing</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {controls.filter((c) => c.status === 'Compliant').length} / {controls.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Monitored by Compliance Agent</div>
        </div>
      </div>

      {/* Maker-Checker Dual-Control Queue */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Maker-Checker Dual-Control Queue ({approvals.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active persona: <strong className="text-slate-800 dark:text-slate-200">{activeActor.name}</strong> ({activeActor.governanceRole})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleActorRole}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {activeActor.governanceRole === 'Maker'
              ? 'Switch to Checker (Arjun)'
              : 'Switch to Maker (Kavya)'}
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {approvals.map((item) => {
            const isPending = item.status === 'Pending Checker';
            const canResolve = isPending && activeActor.governanceRole === 'Checker';
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                      {item.entityId}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.actionTitle}
                    </span>
                    <StatusBadge
                      label={item.status}
                      tone={
                        item.status === 'Approved'
                          ? 'success'
                          : item.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    />
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{item.summary}</p>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Maker: {item.makerName} · Created {item.createdAt}
                    {item.amountINR !== undefined && ` · Exposure: ${formatINR(item.amountINR)}`}
                    {item.checkerName && ` · Resolved by ${item.checkerName} (${item.resolvedAt})`}
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!canResolve}
                      title={
                        canResolve
                          ? 'Approve dual-control action'
                          : 'Switch to Checker role to approve'
                      }
                      onClick={() => resolveApproval(item.id, 'Approved')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      disabled={!canResolve}
                      title={
                        canResolve
                          ? 'Reject dual-control action'
                          : 'Switch to Checker role to reject'
                      }
                      onClick={() => resolveApproval(item.id, 'Rejected')}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                    >
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regulatory Control Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Regulatory Control Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Control ID</th>
                <th className="px-4 py-3 font-medium">Regulatory Mandate</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 text-right font-medium">Coverage</th>
                <th className="px-4 py-3 font-medium">Last Audited</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {controls.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {c.regulation}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.owner}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {c.coverage}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 tabular-nums dark:text-slate-400">
                    {c.lastAudit}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={c.status}
                      tone={c.status === 'Compliant' ? 'success' : 'warning'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Governance Audit Trail */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Immutable Governance Audit Trail ({filteredAuditLogs.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chronological trace of analyst triage, Maker-Checker approvals, KYC updates, and CSV batch runs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                placeholder="Filter audit trail..."
                aria-label="Filter governance audit trail"
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                downloadCSV('finsight-governance-audit-trail.csv', filteredAuditLogs);
                showToast('Governance audit trail exported to CSV');
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export Audit CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Transition</th>
                <th className="px-5 py-3 font-medium">Governance Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAuditLogs.slice(0, 16).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {log.actorName}
                    </div>
                    <div className="text-[11px] text-slate-500">{log.actorTitle}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-sky-700 dark:text-sky-400">
                      {log.entityId}
                    </span>
                    <div className="text-[11px] text-slate-500">{log.entityType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{log.action}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {log.previousValue} → {log.newValue}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{log.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
