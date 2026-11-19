import { Download, Sparkles } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFinSight } from '../../context/FinSightContext';
import {
  getAutomationPerformanceSeries,
  getCategoryDistribution,
  getDateRangeLabel,
  getFraudTrendSeries,
  getMonthlyFinancialPerformance,
  getSegmentRiskDistribution,
  getVolumeTimeSeries,
} from '../../services/analyticsService';
import { downloadCSV, formatINR } from '../../utils/formatters';

const PIE_COLORS = ['#0284c7', '#0891b2', '#6366f1', '#0f766e', '#64748b'];

export function ExecutiveDashboard() {
  const {
    selectedOrg,
    dateRange,
    kpis,
    scopedTransactions,
    setSelectedTransactionId,
    setActivePage,
    openCopilotWithPrompt,
    showToast,
  } = useFinSight();

  const volumeSeries = getVolumeTimeSeries(selectedOrg, dateRange);
  const categoryDist = getCategoryDistribution(selectedOrg);
  const fraudTrends = getFraudTrendSeries(selectedOrg, dateRange);
  const segmentRisk = getSegmentRiskDistribution();
  const automationPerf = getAutomationPerformanceSeries();
  const monthlyPerf = getMonthlyFinancialPerformance(selectedOrg);

  const highPriorityTxns = [...scopedTransactions]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6);

  const handleExportSummary = () => {
    const rows = kpis.map((k) => ({
      Organisation: selectedOrg.name,
      DateRange: getDateRangeLabel(dateRange),
      Metric: k.label,
      Value: k.formattedValue,
      PeriodChangePercent: `${k.deltaPercent}%`,
    }));
    downloadCSV(`finsight-executive-summary-${selectedOrg.id}.csv`, rows);
    showToast('Executive KPI summary exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Executive Financial Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {selectedOrg.name} · {getDateRangeLabel(dateRange)} · Simulated institutional telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              openCopilotWithPrompt(
                `Provide an executive financial briefing for ${selectedOrg.name} over ${getDateRangeLabel(dateRange)}, highlighting revenue trajectory, fraud containment, and compliance posture.`,
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 whitespace-nowrap dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-300"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>AI Executive Brief</span>
          </button>
          <button
            type="button"
            onClick={handleExportSummary}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export Summary CSV</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <section aria-label="Primary Financial KPIs" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </section>

      {/* Row 1 Charts: Transaction Volume & Category Distribution */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Transaction Volume & Value Throughput
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Payment volume count and INR value (Cr) across active rails
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('financial-analytics')}
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              Deep Analytics →
            </button>
          </div>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={volumeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.14}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="valueCr"
                  name="Value (₹ Cr)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Distribution by Category
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share of total INR throughput
          </p>
          <div className="mt-3 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDist}
                  dataKey="share"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={2}
                >
                  {categoryDist.map((entry, idx) => (
                    <Cell key={entry.category} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val ?? 0}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs">
            {categoryDist.map((item, idx) => (
              <li key={item.category} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-xs"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span>{item.category}</span>
                </span>
                <span className="font-mono text-slate-600 tabular-nums dark:text-slate-400">
                  ₹{item.valueCr} Cr ({item.share}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 2 Charts: Fraud Detection Trends & Revenue/Value Trends */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Fraud Detection & Prevention Trends
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Suspicious incidents vs prevented losses (₹ Cr)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('fraud-detection')}
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              Fraud Module →
            </button>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fraudTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="detected"
                  name="Suspicious Cases"
                  fill="#d97706"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="preventedCr"
                  name="Prevented (₹ Cr)"
                  stroke="#0891b2"
                  strokeWidth={2.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Monthly Financial & Revenue Performance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gross throughput (₹ Cr), fee revenue (₹ L), and net yield (₹ L)
            </p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="feeRevenueL" name="Fee Revenue (₹ L)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netYieldL" name="Net Yield (₹ L)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 Charts: Segment Risk Distribution & AI Automation Performance */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Risk Distribution by Customer Segment
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Percentage share of Low, Moderate, and High-risk profiles
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentRisk} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="segment" width={126} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="low" name="Low Risk %" stackId="a" fill="#16a34a" />
                <Bar dataKey="moderate" name="Moderate %" stackId="a" fill="#d97706" />
                <Bar dataKey="high" name="High Risk %" stackId="a" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                AI Automation Performance by Workflow
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Straight-through AI execution vs analyst escalation %
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('ai-agent-centre')}
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              AI Agents →
            </button>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={automationPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="function" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="automated" name="AI Automated %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="humanReview" name="Analyst Escalation %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Priority Transaction Watchlist */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Priority Risk Watchlist
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any transaction to open full forensic telemetry and Gemini risk review
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('transaction-monitoring')}
            className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            View All {scopedTransactions.length} Transactions →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Transaction ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Merchant</th>
                <th className="px-4 py-3 font-medium">Rail</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Risk Score</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {highPriorityTxns.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => setSelectedTransactionId(txn.id)}
                  className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-5 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                    {txn.id}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {txn.customerName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {txn.merchantName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{txn.rail}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums dark:text-slate-100">
                    {formatINR(txn.amountINR)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                    <span
                      className={
                        txn.riskScore >= 80
                          ? 'text-red-600 dark:text-red-400'
                          : txn.riskScore >= 55
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {txn.riskScore}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={txn.status} />
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
