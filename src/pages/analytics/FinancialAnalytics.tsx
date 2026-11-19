import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFinSight } from '../../context/FinSightContext';
import { MOCK_MERCHANTS } from '../../data/mockCustomers';
import { getDateRangeLabel } from '../../services/analyticsService';
import { DateRangePreset } from '../../types';
import { downloadCSV, formatINRCompact } from '../../utils/formatters';

type Cadence = 'Daily' | 'Weekly' | 'Monthly';

export function FinancialAnalytics() {
  const { selectedOrg, dateRange, setDateRange, showToast } = useFinSight();
  const [cadence, setCadence] = useState<Cadence>('Weekly');
  const [segmentFilter, setSegmentFilter] = useState<string>('All');

  const s = selectedOrg.scaleFactor;

  const cashFlowSeries = useMemo(() => {
    const labels =
      cadence === 'Daily'
        ? ['13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov']
        : cadence === 'Weekly'
          ? ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']
          : ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

    const mult = cadence === 'Daily' ? 0.14 : cadence === 'Weekly' ? 0.55 : 1.0;
    const baseInflow = [192, 204, 198, 224, 238, 248, 256];
    const baseOutflow = [148, 159, 154, 171, 182, 189, 194];

    return labels.map((period, i) => {
      const inflow = Number((baseInflow[i % baseInflow.length] * s * mult).toFixed(2));
      const outflow = Number((baseOutflow[i % baseOutflow.length] * s * mult).toFixed(2));
      return {
        period,
        inflowCr: inflow,
        outflowCr: outflow,
        netCr: Number((inflow - outflow).toFixed(2)),
      };
    });
  }, [cadence, s]);

  const forecastSeries = useMemo(
    () => [
      { period: 'Sep (Act)', actualCr: Number((221.4 * s).toFixed(1)), forecastCr: null },
      { period: 'Oct (Act)', actualCr: Number((236.9 * s).toFixed(1)), forecastCr: null },
      { period: 'Nov (Act)', actualCr: Number((248.6 * s).toFixed(1)), forecastCr: Number((248.6 * s).toFixed(1)) },
      { period: 'Dec (Proj)', actualCr: null, forecastCr: Number((269.4 * s).toFixed(1)) },
      { period: 'Jan (Proj)', actualCr: null, forecastCr: Number((284.1 * s).toFixed(1)) },
      { period: 'Feb (Proj)', actualCr: null, forecastCr: Number((298.8 * s).toFixed(1)) },
    ],
    [s],
  );

  const railSuccessData = [
    { rail: 'UPI Switch', success: 99.1, failure: 0.9 },
    { rail: 'NEFT / RTGS', success: 99.6, failure: 0.4 },
    { rail: 'IMPS Core', success: 98.4, failure: 1.6 },
    { rail: 'Corporate Card', success: 97.9, failure: 2.1 },
    { rail: 'Razorpay PG', success: 95.9, failure: 4.1 },
  ];

  const spendingBehaviour = [
    { segment: 'Enterprise MSME', avgTicketL: 4.85, monthlyGrowth: 16.4 },
    { segment: 'NBFC Partner', avgTicketL: 8.4, monthlyGrowth: 12.1 },
    { segment: 'Digital Merchant', avgTicketL: 1.92, monthlyGrowth: 21.8 },
    { segment: 'HNI Retail', avgTicketL: 1.45, monthlyGrowth: 9.7 },
    { segment: 'Salaried Prime', avgTicketL: 0.24, monthlyGrowth: 14.3 },
  ];

  const filteredMerchants = useMemo(
    () =>
      MOCK_MERCHANTS.filter((m) => segmentFilter === 'All' || m.gateway === segmentFilter).slice(
        0,
        10,
      ),
    [segmentFilter],
  );

  const handleExport = () => {
    downloadCSV('finsight-financial-analytics.csv', cashFlowSeries);
    showToast('Financial analytics cashflow data exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Financial Analytics Workspace
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {selectedOrg.name} · {getDateRangeLabel(dateRange)} · Cash flow, gateway reliability, and merchant yield
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
            {(['today', '7d', '30d', '90d'] as DateRangePreset[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDateRange({ ...dateRange, preset: p })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  dateRange.preset === p
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {p === 'today' ? 'Today' : p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
            {(['Daily', 'Weekly', 'Monthly'] as Cadence[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCadence(c)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  cadence === c
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cash Flow & Forecasting */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {cadence} Cash Flow Analysis (₹ Crores)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gross inflows, settlement outflows, and net liquidity retained
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashFlowSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="inflowCr" name="Inflow (₹ Cr)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflowCr" name="Outflow (₹ Cr)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="netCr"
                  name="Net Retained (₹ Cr)"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            90-Day AI Volume Forecast (₹ Crores)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Actual throughput vs simulated seasonal projection
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="actualCr"
                  name="Actual (₹ Cr)"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="forecastCr"
                  name="Projected (₹ Cr)"
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  fill="#6366f1"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment Rail Success vs Failure & Segment Comparison */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Payment Gateway Success & Failure Rates (%)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time rail conversion telemetry
          </p>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={railSuccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="rail" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="success" name="Success Rate %" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Customer Segment Spending & Growth Comparison
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Average ticket size (₹ Lakhs) and MoM growth (%)
          </p>
          <div className="mt-4 space-y-3">
            {spendingBehaviour.map((seg) => (
              <div
                key={seg.segment}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {seg.segment}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Avg Ticket: <span className="font-mono">₹{seg.avgTicketL} L</span>
                  </div>
                </div>
                <span className="font-mono font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
                  +{seg.monthlyGrowth}% MoM
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Merchant Performance Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Merchant Settlement & Gateway Performance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top institutional merchants by monthly INR turnover
            </p>
          </div>
          <select
            aria-label="Filter merchants by gateway"
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Gateways</option>
            <option value="UPI Switch">UPI Switch</option>
            <option value="IMPS Core">IMPS Core</option>
            <option value="NEFT / RTGS">NEFT / RTGS</option>
            <option value="Razorpay PG">Razorpay PG</option>
            <option value="Corporate Card">Corporate Card</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Merchant</th>
                <th className="px-4 py-3 font-medium">Category · City</th>
                <th className="px-4 py-3 font-medium">Primary Rail</th>
                <th className="px-4 py-3 text-right font-medium">Monthly Turnover</th>
                <th className="px-4 py-3 text-right font-medium">Success Rate</th>
                <th className="px-4 py-3 text-right font-medium">Chargeback</th>
                <th className="px-5 py-3 font-medium">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMerchants.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {m.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {m.category} · {m.city}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{m.gateway}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums dark:text-slate-100">
                    {formatINRCompact(m.monthlyTurnoverINR)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                    {m.successRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {m.chargebackRate.toFixed(2)}%
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={m.settlementStatus} />
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
