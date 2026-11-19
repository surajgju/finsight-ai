import { useMemo, useState } from 'react';
import { Download, Network, ShieldAlert, Smartphone } from 'lucide-react';
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
import { Pagination } from '../../components/common/TableControls';
import { useFinSight } from '../../context/FinSightContext';
import { FraudCase } from '../../types';
import { downloadCSV, formatINR, formatINRCompact } from '../../utils/formatters';

export function FraudDetection() {
  const {
    transactions,
    fraudCases,
    updateFraudCaseStatus,
    setSelectedTransactionId,
    showToast,
  } = useFinSight();

  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');
  const [casePage, setCasePage] = useState(1);

  const featuredMonitoringRows = useMemo(() => {
    const priorityIds = new Set(['TXN-98231', 'TXN-98232', 'TXN-98233', 'TXN-98234']);
    const featured = transactions.filter((t) => priorityIds.has(t.id));
    const additionalFlagged = transactions
      .filter((t) => !priorityIds.has(t.id) && t.riskScore >= 75)
      .slice(0, 6);
    return [...featured, ...additionalFlagged];
  }, [transactions]);

  const filteredCases = useMemo(
    () =>
      fraudCases.filter((c) => severityFilter === 'All' || c.severity === severityFilter),
    [fraudCases, severityFilter],
  );

  const paginatedCases = filteredCases.slice((casePage - 1) * 6, casePage * 6);

  const patternDistribution = useMemo(() => {
    const map = new Map<string, { pattern: string; cases: number; exposureL: number }>();
    for (const c of fraudCases) {
      const existing = map.get(c.patternType) || { pattern: c.patternType, cases: 0, exposureL: 0 };
      existing.cases += 1;
      existing.exposureL = Number((existing.exposureL + c.amountAtRiskINR / 100000).toFixed(1));
      map.set(c.patternType, existing);
    }
    return Array.from(map.values());
  }, [fraudCases]);

  const totalExposureINR = fraudCases.reduce((s, c) => s + c.amountAtRiskINR, 0);
  const duplicateTxns = transactions.filter((t) => t.duplicateFlag);

  const handleExportCases = () => {
    downloadCSV('finsight-fraud-cases.csv', filteredCases);
    showToast('Fraud investigation ledger exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Fraud Detection & Security Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time suspicious transaction monitoring, mule-account clustering, and device risk scoring
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCases}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Export Fraud Cases CSV</span>
        </button>
      </div>

      {/* Fraud Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Active Fraud Cases</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {fraudCases.filter((c) => c.status !== 'Contained').length} / {fraudCases.length}
          </div>
          <div className="mt-1 text-[11px] text-red-600 dark:text-red-400">
            {fraudCases.filter((c) => c.severity === 'Critical').length} Critical priority
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Aggregate Exposure at Risk</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {formatINRCompact(totalExposureINR)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            98.72% interception rate
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Mule Account Clusters</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            4 Active Rings
          </div>
          <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
            35 linked VPAs & 14 shared devices
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Duplicate Signatures Caught</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {duplicateTxns.length} Flags
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Idempotency guard active
          </div>
        </div>
      </div>

      {/* Pattern Chart & Mule / Device Intelligence */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Fraud Pattern Exposure (₹ Lakhs)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Value at risk across detected fraud typologies
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patternDistribution} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="pattern" width={145} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(val) => `₹${val ?? 0} L`} />
                <Bar dataKey="exposureL" name="Exposure (₹ L)" fill="#dc2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Network className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
              <span>Mule-Account Network Intelligence</span>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                <div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    CLUSTER-SRT-04
                  </div>
                  <div className="text-[11px] text-slate-500">14 UPI handles · 5 Android devices · Surat</div>
                </div>
                <StatusBadge label="Critical" />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                <div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    CLUSTER-MUM-11
                  </div>
                  <div className="text-[11px] text-slate-500">9 accounts · Shared VPN subnet · Mumbai</div>
                </div>
                <StatusBadge label="High" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>Suspicious IP & Device Telemetry</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center justify-between">
                <span className="font-mono">DEV-AND-9941A (Rooted)</span>
                <span className="font-mono text-red-600 dark:text-red-400">9 linked accounts</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-mono">103.21.160.192 (Proxy Hop)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">Dubai → Mumbai</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-mono">DEV-WEB-8120X (Headless)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">6 duplicate replays</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real-Time Transaction Risk Scoring Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Real-Time Transaction Risk Scoring Table
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click Inspect to clear, flag, or block
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Transaction ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Device / IP</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Risk Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {featuredMonitoringRows.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                    {t.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {t.customerName} · <span className="font-normal text-slate-500">{t.city}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {t.deviceId} · {t.ipAddress}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums dark:text-slate-100">
                    {formatINR(t.amountINR)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                    <span
                      className={
                        t.riskScore >= 80
                          ? 'text-red-600 dark:text-red-400'
                          : t.riskScore >= 55
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {t.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={t.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTransactionId(t.id)}
                      className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 16 Fraud Investigation Cases */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Fraud Investigation Queue ({filteredCases.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update investigation status across active fraud rings and anomalies
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['All', 'Critical', 'High', 'Medium'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => {
                  setSeverityFilter(sev);
                  setCasePage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  severityFilter === sev
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Case ID</th>
                <th className="px-4 py-3 font-medium">Investigation Title</th>
                <th className="px-4 py-3 font-medium">Pattern</th>
                <th className="px-4 py-3 text-right font-medium">At Risk</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Disposition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedCases.map((fc) => (
                <tr key={fc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {fc.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{fc.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {fc.customerName} · {fc.transactionId} · {fc.linkedAccounts} accounts
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fc.patternType}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums dark:text-slate-100">
                    {formatINR(fc.amountAtRiskINR)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={fc.severity} />
                  </td>
                  <td className="px-5 py-3">
                    <select
                      aria-label={`Status for fraud case ${fc.id}`}
                      value={fc.status}
                      onChange={(e) =>
                        updateFraudCaseStatus(fc.id, e.target.value as FraudCase['status'])
                      }
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="Open">Open</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Contained">Contained</option>
                      <option value="Escalated to FIU">Escalated to FIU</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={casePage}
          pageSize={6}
          totalItems={filteredCases.length}
          onPageChange={setCasePage}
        />
      </div>
    </div>
  );
}
