import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Sparkles, Upload } from 'lucide-react';
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
import { RECONCILIATION_SUMMARY_STATS } from '../../data/mockReconciliation';
import {
  calculateReconciliationSummary,
  parseReconciliationCsv,
} from '../../services/analyticsService';
import { runGeminiAnalysis } from '../../services/intelligenceService';
import { ReconciliationRecord } from '../../types';
import { downloadCSV, formatINR, formatInteger } from '../../utils/formatters';

const SAMPLE_RECON_CSV = [
  'transactionRef,sourceLedger,merchantName,expectedAmountINR,settledAmountINR',
  'TXN-98231,HDFC Escrow,Zaveri Bullion & Jewellers,245000,245000',
  'UTR-ICICI-88412,ICICI Nodal,BharatSteel Logistics Pvt. Ltd.,412000,398500',
  'UTR-RZP-88413,Razorpay Settlement,Swadeshi Mart Retail,148500,148500',
  'UTR-NPCI-88414,NPCI UPI Switch,Deccan Pharma Distributors,86000,86000',
].join('\n');

export function FinancialReconciliation() {
  const {
    reconciliationRecords,
    resolveReconciliation,
    importReconciliationBatch,
    showToast,
  } = useFinSight();
  const [statusFilter, setStatusFilter] = useState<'All' | ReconciliationRecord['status']>('All');
  const [page, setPage] = useState(1);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const liveSampleStats = useMemo(
    () => calculateReconciliationSummary(reconciliationRecords),
    [reconciliationRecords],
  );

  const filtered = useMemo(
    () =>
      reconciliationRecords.filter(
        (r) => statusFilter === 'All' || r.status === statusFilter,
      ),
    [reconciliationRecords, statusFilter],
  );

  const paginated = filtered.slice((page - 1) * 10, page * 10);

  const ledgerBreakdown = useMemo(() => {
    const map = new Map<string, { ledger: string; matched: number; discrepancies: number }>();
    for (const r of reconciliationRecords) {
      const cur = map.get(r.sourceLedger) || { ledger: r.sourceLedger, matched: 0, discrepancies: 0 };
      if (r.status === 'Matched' || r.status === 'Resolved') cur.matched += 1;
      else cur.discrepancies += 1;
      map.set(r.sourceLedger, cur);
    }
    return Array.from(map.values());
  }, [reconciliationRecords]);

  const handleAnalyzeVariance = async (rec: ReconciliationRecord) => {
    setAnalyzingId(rec.id);
    setAiNote(null);
    setAiErr(null);
    try {
      const res = await runGeminiAnalysis({
        taskType: 'reconciliation',
        fast: true,
        payload: rec as unknown as Record<string, unknown>,
      });
      setAiNote(`${rec.id}: ${res.analysis}`);
    } catch (err) {
      setAiErr(err instanceof Error ? err.message : 'Unable to analyze reconciliation variance.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleExport = () => {
    downloadCSV('finsight-reconciliation-report.csv', filtered);
    showToast('Reconciliation discrepancy report exported to CSV');
  };

  const runBatchIngestion = (csvText: string, sourceLabel: string) => {
    const existingRefs = new Set(reconciliationRecords.map((r) => r.transactionRef));
    const parsed = parseReconciliationCsv(csvText, existingRefs);
    importReconciliationBatch(parsed, sourceLabel);
    setPage(1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    runBatchIngestion(text, file.name);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            AI Financial Reconciliation Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Automated bank escrow, payment gateway, and merchant settlement matching & duplicate detection
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload nodal settlement CSV"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload Settlement CSV</span>
          </button>
          <button
            type="button"
            onClick={() => runBatchIngestion(SAMPLE_RECON_CSV, 'NODAL-SAMPLE-BATCH.csv')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Run Sample Nodal Batch</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export Variance CSV</span>
          </button>
        </div>
      </div>

      {/* Benchmark Reconciliation KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Records</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {formatInteger(RECONCILIATION_SUMMARY_STATS.totalRecords)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">HDFC, ICICI, SBI & PG feeds</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Matched Transactions</div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
            {formatInteger(RECONCILIATION_SUMMARY_STATS.matchedTransactions)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Auto-cleared by Agent</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Unmatched Transactions</div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums dark:text-amber-400">
            {formatInteger(RECONCILIATION_SUMMARY_STATS.unmatchedTransactions)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {liveSampleStats.unmatched} active in queue
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Potential Duplicates</div>
          <div className="mt-1 font-display text-2xl font-bold text-red-600 tabular-nums dark:text-red-400">
            {formatInteger(RECONCILIATION_SUMMARY_STATS.potentialDuplicates)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {liveSampleStats.duplicates} flagged in batch
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Reconciliation Accuracy</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {RECONCILIATION_SUMMARY_STATS.reconciliationAccuracy}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Sample Variance: {formatINR(liveSampleStats.totalVarianceINR)}
          </div>
        </div>
      </div>

      {/* Progress & Ledger Chart */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Automated Matching Progress
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time progress across 48,920 institutional ledger rows
          </p>
          <div className="mt-4 space-y-4 text-xs">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Straight-Through UTR Match
                </span>
                <span className="font-mono font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
                  97.73%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: '97.73%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Sample Queue Match Rate ({liveSampleStats.matched}/{reconciliationRecords.length})
                </span>
                <span className="font-mono font-semibold text-sky-700 tabular-nums dark:text-sky-400">
                  {liveSampleStats.sampleMatchRate}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-600"
                  style={{ width: `${liveSampleStats.sampleMatchRate}%` }}
                />
              </div>
            </div>
          </div>

          {aiNote && (
            <div className="mt-4 whitespace-pre-line rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-xs leading-relaxed text-slate-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-slate-200">
              <div className="mb-1 font-semibold text-indigo-700 dark:text-indigo-300">
                Gemini Variance Diagnosis
              </div>
              {aiNote}
            </div>
          )}
          {aiErr && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {aiErr}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Reconciliation Status by Nodal & Gateway Feed
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Matched vs unmatched/duplicate exceptions across active batch
          </p>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ledgerBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="ledger" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="matched" name="Matched" stackId="a" fill="#16a34a" />
                <Bar dataKey="discrepancies" name="Exceptions" stackId="a" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reconciliation Records Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Discrepancy & Settlement Queue ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Run Gemini AI diagnosis or resolve unmatched & duplicate settlements
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['All', 'Unmatched', 'Potential Duplicate', 'Matched', 'Resolved'] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Recon ID</th>
                <th className="px-4 py-3 font-medium">Source Ledger</th>
                <th className="px-4 py-3 font-medium">Merchant & Ref</th>
                <th className="px-4 py-3 text-right font-medium">Expected</th>
                <th className="px-4 py-3 text-right font-medium">Variance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                    {r.id}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.sourceLedger}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {r.merchantName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {r.transactionRef} · {r.discrepancyReason}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatINR(r.expectedAmountINR)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                    <span
                      className={
                        r.varianceINR !== 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {formatINR(r.varianceINR)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={r.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {r.status !== 'Matched' && r.status !== 'Resolved' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAnalyzeVariance(r)}
                            disabled={analyzingId === r.id}
                            className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                          >
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            <span>{analyzingId === r.id ? '…' : 'Diagnose'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveReconciliation(r.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          >
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            <span>Resolve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageSize={10}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
