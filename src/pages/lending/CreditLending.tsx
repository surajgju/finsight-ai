import { useMemo, useState } from 'react';
import { AlertCircle, Download, Landmark, Sparkles } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFinSight } from '../../context/FinSightContext';
import { MOCK_LENDING_APPLICATIONS } from '../../data/mockLending';
import { calculateDebtToRevenueRatio } from '../../services/analyticsService';
import { runGeminiAnalysis } from '../../services/intelligenceService';
import { downloadCSV, formatINR, formatINRCompact } from '../../utils/formatters';

const APPROVAL_DIST = [
  { name: 'Approved (Simulated)', value: 54, color: '#16a34a' },
  { name: 'Underwriting', value: 23, color: '#0284c7' },
  { name: 'Committee Review', value: 15, color: '#d97706' },
  { name: 'Declined (Simulated)', value: 8, color: '#dc2626' },
];

const REPAYMENT_COHORT = [
  { bucket: 'On-Time (0 DPD)', percent: 91.4 },
  { bucket: '1–15 DPD', percent: 5.2 },
  { bucket: '16–30 DPD', percent: 2.1 },
  { bucket: '31–60 DPD', percent: 0.9 },
  { bucket: '60+ DPD', percent: 0.4 },
];

export function CreditLending() {
  const { showToast } = useFinSight();
  const [selectedId, setSelectedId] = useState<string>('LN-8001');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Moderate' | 'Elevated' | 'High'>('All');
  const [geminiMemo, setGeminiMemo] = useState<string | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [memoLoading, setMemoLoading] = useState(false);

  const selectedBorrower = useMemo(
    () => MOCK_LENDING_APPLICATIONS.find((b) => b.id === selectedId) ?? MOCK_LENDING_APPLICATIONS[0],
    [selectedId],
  );

  const filteredApps = useMemo(
    () =>
      MOCK_LENDING_APPLICATIONS.filter(
        (a) => riskFilter === 'All' || a.riskClassification === riskFilter,
      ),
    [riskFilter],
  );

  const handleGenerateMemo = async () => {
    setMemoLoading(true);
    setGeminiError(null);
    setGeminiMemo(null);
    try {
      const res = await runGeminiAnalysis({
        taskType: 'borrower',
        payload: selectedBorrower as unknown as Record<string, unknown>,
      });
      setGeminiMemo(res.analysis);
    } catch (err) {
      setGeminiError(
        err instanceof Error ? err.message : 'Unable to generate borrower memo with Gemini.',
      );
    } finally {
      setMemoLoading(false);
    }
  };

  const handleExport = () => {
    downloadCSV('finsight-lending-portfolio.csv', filteredApps);
    showToast('Simulated lending applications exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            AI Credit & Lending Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Borrower risk scoring, GST cashflow underwriting, default probability, and alternative credit signals
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Export Portfolio CSV</span>
        </button>
      </div>

      {/* Mandatory Illustrative Disclaimer */}
      <div
        role="note"
        className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>
          <strong>Illustrative Simulation Notice:</strong> All credit scores, default probabilities,
          and AI lending assessments shown below are simulated analytical outputs for demonstration
          purposes only and do not constitute actual credit bureau pulls or binding lending decisions.
        </span>
      </div>

      {/* Featured Borrower Credit Assessment Spotlight */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {selectedBorrower.borrowerName}
                </h2>
                <StatusBadge label={`AI Assessment: ${selectedBorrower.aiAssessment}`} tone="success" />
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {selectedBorrower.id} · {selectedBorrower.industry} · {selectedBorrower.city} · Submitted {selectedBorrower.submittedDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Select Borrower Profile"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setGeminiMemo(null);
                setGeminiError(null);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {MOCK_LENDING_APPLICATIONS.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.id} — {app.borrowerName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGenerateMemo}
              disabled={memoLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{memoLoading ? 'Drafting Memo…' : 'Generate Gemini Credit Memo'}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Requested Loan</div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums dark:text-slate-50">
              {formatINR(selectedBorrower.requestedLoanINR)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Annual Revenue</div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums dark:text-slate-50">
              {formatINRCompact(selectedBorrower.annualRevenueINR)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Existing Liabilities</div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums dark:text-slate-50">
              {formatINRCompact(selectedBorrower.existingLiabilitiesINR)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Credit Score (Illustrative)
            </div>
            <div className="mt-1 font-mono text-base font-bold text-sky-700 tabular-nums dark:text-sky-400">
              {selectedBorrower.creditScore}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Est. Default Prob.</div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums dark:text-slate-50">
              {selectedBorrower.defaultProbability}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Debt / Revenue</div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums dark:text-slate-50">
              {calculateDebtToRevenueRatio(selectedBorrower)}x · {selectedBorrower.riskClassification}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 text-xs dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              AI Credit Explanation & Cashflow Health
            </div>
            <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
              {selectedBorrower.aiExplanation}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 text-xs dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Alternative Credit & GST Telemetry
            </div>
            <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
              {selectedBorrower.altDataSignal}
            </p>
            <div className="mt-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              GST Filing Streak: {selectedBorrower.gstComplianceMonths} months · Repayment Index:{' '}
              {selectedBorrower.repaymentScore}/100
            </div>
          </div>
        </div>

        {geminiMemo && (
          <div className="mt-4 whitespace-pre-line rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 text-xs leading-relaxed text-slate-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-slate-200">
            <div className="mb-1 font-semibold text-indigo-700 dark:text-indigo-300">
              Gemini Illustrative Underwriting Memo
            </div>
            {geminiMemo}
          </div>
        )}

        {geminiError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {geminiError}
          </div>
        )}
      </section>

      {/* Portfolio Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Loan Approval Distribution (%)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pipeline disposition across simulated MSME & corporate applications
          </p>
          <div className="mt-3 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={APPROVAL_DIST}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={72}
                  >
                    {APPROVAL_DIST.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v ?? 0}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-xs">
              {APPROVAL_DIST.map((d) => (
                <li key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span
                      className="h-2.5 w-2.5 rounded-xs"
                      style={{ backgroundColor: d.color }}
                      aria-hidden="true"
                    />
                    <span>{d.name}</span>
                  </span>
                  <span className="font-mono font-semibold tabular-nums">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Portfolio Repayment Behaviour (DPD Buckets)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active book share by days-past-due delinquency cohort
          </p>
          <div className="mt-3 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REPAYMENT_COHORT}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(v) => `${v ?? 0}%`} />
                <Bar dataKey="percent" name="Portfolio %" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 22 Lending Applications Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Simulated Loan Applications ({filteredApps.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any row to inspect detailed borrower metrics and AI underwriting notes
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['All', 'Low', 'Moderate', 'Elevated', 'High'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskFilter(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  riskFilter === r
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">App ID</th>
                <th className="px-4 py-3 font-medium">Borrower</th>
                <th className="px-4 py-3 text-right font-medium">Requested</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-4 py-3 text-right font-medium">Score (Illus.)</th>
                <th className="px-4 py-3 text-right font-medium">Est. PD</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-5 py-3 font-medium">AI Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => {
                    setSelectedId(app.id);
                    setGeminiMemo(null);
                  }}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    app.id === selectedBorrower.id ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                    {app.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {app.borrowerName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {app.industry} · {app.city}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {formatINR(app.requestedLoanINR)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {formatINRCompact(app.annualRevenueINR)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {app.creditScore}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {app.defaultProbability}%
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={app.riskClassification} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={app.aiAssessment} />
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
