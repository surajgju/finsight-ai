import { useMemo, useState } from 'react';
import { Download, Search, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, Pagination } from '../../components/common/TableControls';
import { useFinSight } from '../../context/FinSightContext';
import { COMPLIANCE_SUMMARY_STATS } from '../../data/mockCompliance';
import { KycRecord } from '../../types';
import { downloadCSV, formatInteger } from '../../utils/formatters';

export function KycAml() {
  const { kycRecords, updateKycStatus, showToast } = useFinSight();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | KycRecord['verificationStatus']>('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return kycRecords.filter((k) => {
      const matchesQ =
        !q ||
        k.customerId.toLowerCase().includes(q) ||
        k.customerName.toLowerCase().includes(q) ||
        k.city.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || k.verificationStatus === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [kycRecords, query, statusFilter]);

  const paginated = filtered.slice((page - 1) * 10, page * 10);

  const handleExport = () => {
    downloadCSV('finsight-kyc-aml-ledger.csv', filtered);
    showToast('KYC & AML compliance records exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            AI Compliance & KYC / AML Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Identity verification status, PMLA sanctions screening, and regulatory risk queue
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Export KYC Register CSV</span>
        </button>
      </div>

      {/* Prompt Benchmark KYC / AML Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Customers Verified</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {formatInteger(COMPLIANCE_SUMMARY_STATS.totalCustomersVerified)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">CKYC & V-KYC synced</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Pending KYC</div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums dark:text-amber-400">
            {formatInteger(COMPLIANCE_SUMMARY_STATS.pendingKyc)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">342 high-turnover &lt; 7d</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">AML Alerts</div>
          <div className="mt-1 font-display text-2xl font-bold text-red-600 tabular-nums dark:text-red-400">
            {COMPLIANCE_SUMMARY_STATS.amlAlerts}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">6 queued for FIU-IND STR</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Verification Success Rate</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {COMPLIANCE_SUMMARY_STATS.verificationSuccessRate}%
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">OCR + liveness pass</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Compliance Score</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {COMPLIANCE_SUMMARY_STATS.complianceScore}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">RBI Master Direction aligned</div>
        </div>
      </div>

      {/* Filters */}
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
            placeholder="Search customer ID, name, or city..."
            aria-label="Search KYC records"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-9 text-xs text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['All', 'Verified', 'Pending KYC', 'AML Flagged', 'Document Expired'] as const).map(
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

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No KYC records match your filter"
          description="Reset your search or status filter to view all 32 simulated customer KYC profiles."
          actionLabel="Reset Filters"
          onAction={() => {
            setQuery('');
            setStatusFilter('All');
          }}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              KYC & AML Verification Register ({filtered.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <th className="px-5 py-3 font-medium">Customer ID</th>
                  <th className="px-4 py-3 font-medium">Customer & Entity</th>
                  <th className="px-4 py-3 font-medium">Verification Status</th>
                  <th className="px-4 py-3 font-medium">Risk Class</th>
                  <th className="px-4 py-3 text-right font-medium">Doc Score</th>
                  <th className="px-4 py-3 font-medium">Last Verification</th>
                  <th className="px-5 py-3 text-right font-medium">Update Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3 font-mono font-medium text-sky-700 dark:text-sky-400">
                      {rec.customerId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {rec.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {rec.entityType} · {rec.city}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={rec.verificationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={rec.riskClassification} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {rec.documentScore}%
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 tabular-nums dark:text-slate-400">
                      {rec.lastVerifiedDate}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <select
                        aria-label={`Update KYC status for ${rec.customerId}`}
                        value={rec.verificationStatus}
                        onChange={(e) =>
                          updateKycStatus(
                            rec.id,
                            e.target.value as KycRecord['verificationStatus'],
                          )
                        }
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <option value="Verified">Verified</option>
                        <option value="Pending KYC">Pending KYC</option>
                        <option value="AML Flagged">AML Flagged</option>
                        <option value="Document Expired">Document Expired</option>
                      </select>
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
      )}
    </div>
  );
}
