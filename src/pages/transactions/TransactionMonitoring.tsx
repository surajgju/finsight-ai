import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  Filter,
  Pause,
  Play,
  Radio,
  Search,
  Upload,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, Pagination } from '../../components/common/TableControls';
import { useFinSight } from '../../context/FinSightContext';
import {
  createSimulatedLiveTransaction,
  parseTransactionCsv,
  sortTransactions,
} from '../../services/analyticsService';
import { PaymentRail, TransactionStatus } from '../../types';
import { downloadCSV, formatINR } from '../../utils/formatters';

const STATUS_OPTIONS: ('All' | TransactionStatus)[] = [
  'All',
  'Critical',
  'High',
  'Flagged',
  'Normal',
  'Cleared',
  'Blocked',
];

const RAIL_OPTIONS: ('All' | PaymentRail)[] = [
  'All',
  'UPI Switch',
  'IMPS Core',
  'NEFT / RTGS',
  'Corporate Card',
  'Razorpay PG',
];

const SAMPLE_TRANSACTION_CSV = [
  'id,customer,merchant,rail,amount,city,category',
  'TXN-IMP-9901,Harshad Patel,Zaveri Bullion & Jewellers,IMPS Core,645000,Surat,B2B Settlement',
  'TXN-IMP-9902,Harshad Patel,Zaveri Bullion & Jewellers,IMPS Core,645000,Surat,B2B Settlement',
  'TXN-IMP-9903,Neha Kapoor,Indica FinTech Payouts,Razorpay PG,215000,Bhopal,Vendor Payout',
  'TXN-IMP-9904,Priya Sharma,Swadeshi Mart Retail,UPI Switch,18400,Bengaluru,Retail Merchant',
  'TXN-IMP-9905,Aarav Mehta,Deccan Pharma Distributors,NEFT / RTGS,420000,Mumbai,B2B Settlement',
].join('\n');

export function TransactionMonitoring() {
  const {
    scopedTransactions,
    setSelectedTransactionId,
    selectedOrg,
    importTransactionBatch,
    pushLiveTransaction,
    showToast,
  } = useFinSight();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TransactionStatus>('All');
  const [railFilter, setRailFilter] = useState<'All' | PaymentRail>('All');
  const [sortKey, setSortKey] = useState<'recent' | 'timestamp' | 'amountINR' | 'riskScore' | 'id'>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [liveStreaming, setLiveStreaming] = useState(false);
  const [latestLiveId, setLatestLiveId] = useState<string | null>(null);
  const [importPanelOpen, setImportPanelOpen] = useState(false);
  const streamSeqRef = useRef(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 12;

  useEffect(() => {
    if (!liveStreaming) return;
    const emitTick = () => {
      const seq = streamSeqRef.current;
      streamSeqRef.current += 1;
      const txn = createSimulatedLiveTransaction(seq);
      pushLiveTransaction(txn);
      setLatestLiveId(`${txn.id} (${txn.status}, Risk ${txn.riskScore})`);
    };
    emitTick();
    const timer = window.setInterval(emitTick, 3500);
    return () => window.clearInterval(timer);
  }, [liveStreaming, pushLiveTransaction]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scopedTransactions.filter((t) => {
      const matchesQuery =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.merchantName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesRail = railFilter === 'All' || t.rail === railFilter;
      return matchesQuery && matchesStatus && matchesRail;
    });
    return sortTransactions(list, sortKey, sortDir);
  }, [scopedTransactions, query, statusFilter, railFilter, sortKey, sortDir]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('All');
    setRailFilter('All');
    setPage(1);
  };

  const handleExport = () => {
    downloadCSV(
      `finsight-transactions-${selectedOrg.id}.csv`,
      filtered.map((t) => ({
        TransactionID: t.id,
        Timestamp: t.timestamp,
        Customer: t.customerName,
        Merchant: t.merchantName,
        Category: t.category,
        Rail: t.rail,
        AmountINR: t.amountINR,
        RiskScore: t.riskScore,
        Status: t.status,
        City: t.city,
      })),
    );
    showToast(`Exported ${filtered.length} transactions to CSV`);
  };

  const targetOrgForImport = selectedOrg.id === 'org-apex' ? 'org-bharatpay' : selectedOrg.id;

  const handleCsvTextIngest = (csvText: string, label: string) => {
    const parsed = parseTransactionCsv(csvText, targetOrgForImport);
    importTransactionBatch(parsed, label);
    setImportPanelOpen(false);
    setSortKey('recent');
    setSortDir('desc');
    setPage(1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    handleCsvTextIngest(text, file.name);
    e.target.value = '';
  };

  const handleToggleLiveStream = () => {
    const next = !liveStreaming;
    setLiveStreaming(next);
    if (next) {
      setSortKey('recent');
      setSortDir('desc');
      setPage(1);
    }
    showToast(
      next
        ? 'Live transaction telemetry stream activated'
        : 'Live transaction telemetry stream paused',
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Transaction Monitoring Ledger
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time simulated ledger across {scopedTransactions.length} scoped Indian financial transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleLiveStream}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              liveStreaming
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {liveStreaming ? (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{liveStreaming ? 'Pause Live Stream' : 'Simulate Live Stream'}</span>
          </button>

          <button
            type="button"
            onClick={() => setImportPanelOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Import CSV Batch</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {liveStreaming && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
          <div className="flex items-center gap-2 font-medium">
            <Radio className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>
              Simulated NPCI / PG Live Stream Active — scoring incoming payment instructions every 3.5 seconds
            </span>
          </div>
          <span className="font-mono text-[11px]">
            {latestLiveId ? `Latest: ${latestLiveId}` : `${scopedTransactions.length} rows in scope`}
          </span>
        </div>
      )}

      {importPanelOpen && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Automated CSV Batch Risk Triage
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                Upload any CSV with columns <code className="font-mono">id, customer, merchant, rail, amount, city, category</code> or load a sample batch for instant scoring.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload transaction batch CSV file"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Choose Local CSV</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCsvTextIngest(SAMPLE_TRANSACTION_CSV, 'SAMPLE-UPI-IMPS-BATCH.csv')
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Load Sample UPI/IMPS CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by TXN ID, customer, merchant, or city..."
            aria-label="Filter transactions"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Status:</span>
          </div>
          <select
            aria-label="Filter by transaction status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'All' | TransactionStatus);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by payment rail"
            value={railFilter}
            onChange={(e) => {
              setRailFilter(e.target.value as 'All' | PaymentRail);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {RAIL_OPTIONS.map((rail) => (
              <option key={rail} value={rail}>
                {rail === 'All' ? 'All Payment Rails' : rail}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No matching transactions found"
          description="Try clearing your search term or widening your status and payment rail filters."
          actionLabel="Clear All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('id')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Transaction ID</span>
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('timestamp')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Timestamp</span>
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">Customer & City</th>
                  <th className="px-4 py-3 font-medium">Merchant</th>
                  <th className="px-4 py-3 font-medium">Rail</th>
                  <th className="px-4 py-3 text-right font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('amountINR')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Amount</span>
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('riskScore')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Risk Score</span>
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((txn) => (
                  <tr
                    key={txn.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                      {txn.id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                      {txn.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {txn.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{txn.city}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
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
                    <td className="px-4 py-3">
                      <StatusBadge label={txn.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTransactionId(txn.id)}
                        aria-label={`Inspect transaction ${txn.id}`}
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
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
