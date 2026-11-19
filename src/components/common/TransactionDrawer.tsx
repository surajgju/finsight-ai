import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Globe,
  History,
  MessageSquare,
  ShieldBan,
  Smartphone,
  X,
} from 'lucide-react';
import { useFinSight } from '../../context/FinSightContext';
import { formatINR } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { runGeminiAnalysis } from '../../services/intelligenceService';

export function TransactionDrawer() {
  const {
    selectedTransaction,
    setSelectedTransactionId,
    updateTransactionStatus,
    openCopilotWithPrompt,
    auditLogs,
    activeActor,
  } = useFinSight();

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setAiReport(null);
    setAiError(null);
    setAnalyzing(false);
  }, [selectedTransaction?.id]);

  if (!selectedTransaction) return null;

  const txnAuditHistory = auditLogs.filter((a) => a.entityId === selectedTransaction.id);
  const requiresCheckerHold =
    activeActor.governanceRole === 'Maker' && selectedTransaction.amountINR >= 100000;

  const handleRunGemini = async () => {
    setAnalyzing(true);
    setAiError(null);
    try {
      const result = await runGeminiAnalysis({
        taskType: 'transaction',
        payload: selectedTransaction as unknown as Record<string, unknown>,
      });
      setAiReport(result.analysis);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach Gemini intelligence service.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Inspect transaction ${selectedTransaction.id}`}
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
                {selectedTransaction.id}
              </h2>
              <StatusBadge label={selectedTransaction.status} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {selectedTransaction.timestamp} · {selectedTransaction.rail}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTransactionId(null)}
            aria-label="Close transaction inspection"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Transaction Amount</div>
                <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
                  {formatINR(selectedTransaction.amountINR)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Composite Risk Score</div>
                <div
                  className={`mt-1 font-mono text-xl font-bold tabular-nums ${
                    selectedTransaction.riskScore >= 80
                      ? 'text-red-600 dark:text-red-400'
                      : selectedTransaction.riskScore >= 55
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {selectedTransaction.riskScore} / 100
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Customer Profile</div>
              <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {selectedTransaction.customerName}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {selectedTransaction.customerId} · {selectedTransaction.city}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Merchant / Counterparty</div>
              <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {selectedTransaction.merchantName}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {selectedTransaction.merchantId} · {selectedTransaction.category}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Device & Network Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span className="font-mono">{selectedTransaction.ipAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span className="font-mono">{selectedTransaction.deviceId}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-500 dark:text-slate-400">
              <span>
                Duplicate Check:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {selectedTransaction.duplicateFlag ? 'Duplicate Signature Flagged' : 'Unique UTR Hash'}
                </strong>
              </span>
              {selectedTransaction.muleNetworkCluster && (
                <span>
                  · Cluster:{' '}
                  <strong className="font-mono text-red-600 dark:text-red-400">
                    {selectedTransaction.muleNetworkCluster}
                  </strong>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>AI Risk Assessment</span>
              </div>
              <button
                type="button"
                onClick={handleRunGemini}
                disabled={analyzing}
                className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {analyzing ? 'Analyzing…' : 'Run Gemini Deep Analysis'}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {selectedTransaction.aiReason}
            </p>
            {aiReport && (
              <div className="mt-2 whitespace-pre-line rounded-lg border border-indigo-200 bg-white p-3 text-xs leading-relaxed text-slate-800 dark:border-indigo-800 dark:bg-slate-900 dark:text-slate-200">
                {aiReport}
              </div>
            )}
            {aiError && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {aiError}
              </div>
            )}
          </div>

          {/* Governance Audit History */}
          <div className="space-y-2.5 rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <History className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>Governance Audit History</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {txnAuditHistory.length} event{txnAuditHistory.length === 1 ? '' : 's'}
              </span>
            </div>

            {txnAuditHistory.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                No manual analyst or Maker-Checker state transitions recorded for {selectedTransaction.id}.
              </p>
            ) : (
              <div className="space-y-2">
                {txnAuditHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {entry.action}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {entry.timestamp}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {entry.actorName} ({entry.actorTitle}) ·{' '}
                      <span className="font-mono">
                        {entry.previousValue} → {entry.newValue}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {entry.note}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
          {requiresCheckerHold && (
            <div className="mb-2.5 text-[11px] text-amber-700 dark:text-amber-300">
              Maker Mode ({activeActor.name}): Blocking transactions ≥ ₹1,00,000 routes to Checker dual-control approval.
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const prompt = `Investigate transaction ${selectedTransaction.id} (${formatINR(selectedTransaction.amountINR)} via ${selectedTransaction.rail}, Risk Score ${selectedTransaction.riskScore}, Customer ${selectedTransaction.customerName}, Merchant ${selectedTransaction.merchantName}). What immediate containment and compliance steps are recommended?`;
                setSelectedTransactionId(null);
                openCopilotWithPrompt(prompt);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ask Copilot</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updateTransactionStatus(selectedTransaction.id, 'Cleared', 'Cleared by analyst')
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  updateTransactionStatus(selectedTransaction.id, 'Flagged', 'Queued for L2 review')
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Flag</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  updateTransactionStatus(selectedTransaction.id, 'Blocked', 'Rail blocked immediately')
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                <ShieldBan className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{requiresCheckerHold ? 'Request Block' : 'Block'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
