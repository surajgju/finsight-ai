import { useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFinSight } from '../../context/FinSightContext';
import { runGeminiAnalysis } from '../../services/intelligenceService';
import { AIInsight } from '../../types';

const FRAUD_PROBABILITY_HISTOGRAM = [
  { band: '0–20%', count: 1184200 },
  { band: '21–40%', count: 78400 },
  { band: '41–60%', count: 18200 },
  { band: '61–80%', count: 2940 },
  { band: '81–100%', count: 850 },
];

const HISTORICAL_RISK_TREND = [
  { week: 'W1 Oct', score: 22.4, highRiskCount: 1580 },
  { week: 'W2 Oct', score: 21.8, highRiskCount: 1510 },
  { week: 'W3 Oct', score: 20.9, highRiskCount: 1465 },
  { week: 'W4 Oct', score: 20.1, highRiskCount: 1412 },
  { week: 'W1 Nov', score: 19.4, highRiskCount: 1360 },
  { week: 'W2 Nov', score: 18.8, highRiskCount: 1318 },
  { week: 'W3 Nov', score: 18.4, highRiskCount: 1284 },
];

export function AIIntelligenceCentre() {
  const {
    insights,
    acknowledgeInsight,
    setActivePage,
    kpis,
    selectedOrg,
    openCopilotWithPrompt,
  } = useFinSight();

  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [execBrief, setExecBrief] = useState<string | null>(null);
  const [execBriefError, setExecBriefError] = useState<string | null>(null);
  const [execLoading, setExecLoading] = useState(false);

  const [insightDeepAnalysis, setInsightDeepAnalysis] = useState<string | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const handleGenerateExecutiveBrief = async () => {
    setExecLoading(true);
    setExecBriefError(null);
    try {
      const res = await runGeminiAnalysis({
        taskType: 'executive',
        payload: {
          organisation: selectedOrg.name,
          kpis: kpis.map((k) => ({ label: k.label, value: k.formattedValue, delta: k.deltaPercent })),
          openInsightsCount: insights.filter((i) => !i.acknowledged).length,
        },
      });
      setExecBrief(res.analysis);
    } catch (err) {
      setExecBriefError(err instanceof Error ? err.message : 'Unable to generate Gemini summary.');
    } finally {
      setExecLoading(false);
    }
  };

  const handleAnalyzeInsight = async (insight: AIInsight) => {
    setInsightLoading(true);
    setInsightError(null);
    setInsightDeepAnalysis(null);
    try {
      const res = await runGeminiAnalysis({
        taskType: 'insight',
        fast: true,
        payload: insight as unknown as Record<string, unknown>,
      });
      setInsightDeepAnalysis(res.analysis);
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : 'Unable to analyze insight with Gemini.');
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            AI Intelligence Centre
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Contextual anomaly synthesis, risk intelligence, and Gemini-powered root-cause analysis
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            openCopilotWithPrompt(
              'Walk me through the 6 active AI intelligence insights and prioritize which ones need immediate treasury or fraud team action.',
            )
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Discuss in AI Copilot</span>
        </button>
      </div>

      {/* AI Executive Summary */}
      <section className="rounded-xl border border-indigo-200 bg-white p-6 dark:border-indigo-900/60 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
              <BrainCircuit className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                AI Executive Summary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedOrg.name} · Synthesized from simulated operational ledgers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateExecutiveBrief}
            disabled={execLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{execLoading ? 'Synthesizing with Gemini…' : 'Generate Live Gemini Brief'}</span>
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          Financial operations are performing positively this month. Transaction volume increased by{' '}
          <strong className="font-semibold text-slate-900 dark:text-white">12.8%</strong>, while
          suspicious transaction activity decreased by{' '}
          <strong className="font-semibold text-slate-900 dark:text-white">8.4%</strong>. Three
          high-priority fraud patterns require investigation — led by the Surat–Mumbai bullion
          mule-account ring (CLUSTER-SRT-04) and duplicate payout retries on Razorpay PG. Overall
          financial risk remains within the acceptable institutional threshold at{' '}
          <strong className="font-mono font-semibold text-slate-900 dark:text-white">18.4 / 100</strong>.
        </p>

        {execBrief && (
          <div className="mt-4 whitespace-pre-line rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 text-xs leading-relaxed text-slate-800 dark:border-indigo-800/70 dark:bg-indigo-950/30 dark:text-slate-200">
            <div className="mb-1.5 font-semibold text-indigo-700 dark:text-indigo-300">
              Live Gemini Synthesis
            </div>
            {execBrief}
          </div>
        )}

        {execBriefError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {execBriefError}
          </div>
        )}
      </section>

      {/* Contextual AI Insights */}
      <section aria-label="Contextual AI Insights">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Contextual AI Insights ({insights.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {insights.filter((i) => !i.acknowledged).length} active ·{' '}
            {insights.filter((i) => i.acknowledged).length} acknowledged
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge label={ins.severity} />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {ins.detectedAt}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {ins.title}
                </h3>

                <div className="mt-2.5 flex items-baseline justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950/70">
                  <span className="text-slate-500 dark:text-slate-400">{ins.metricLabel}</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {ins.metricValue}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {ins.explanation}
                </p>

                <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Recommended:{' '}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {ins.recommendedAction}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInsight(ins);
                    setInsightDeepAnalysis(null);
                    setInsightError(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {ins.acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Acknowledged</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => acknowledgeInsight(ins.id)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Risk Intelligence Panel */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                AI Risk Intelligence Panel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Composite institutional risk posture, fraud probability distribution, and historical trend
              </p>
            </div>
          </div>
          <StatusBadge label="Risk Classification: Low-Moderate (Controlled)" tone="success" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">Overall Financial Risk Score</div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
              18.4 / 100
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
              -4.6% improvement vs 30d ago
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">High-Risk Transaction Count</div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
              1,284
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              0.10% of 1,284,590 total txns
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">Emerging Fraud Pattern #1</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              UPI Mule Fan-In Rings
            </div>
            <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
              Surat & Mumbai corridors · 14 nodes
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">Emerging Fraud Pattern #2</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              PG Duplicate Replay Bursts
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Triggered during issuer 3DS latency
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Fraud Probability Distribution (Transaction Count)
            </h3>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FRAUD_PROBABILITY_HISTOGRAM}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} scale="log" domain={[100, 'auto']} />
                  <Tooltip />
                  <Bar dataKey="count" name="Transactions" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Historical Composite Risk Trend
            </h3>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORICAL_RISK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[15, 25]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Risk Score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.14}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insight Detail Modal */}
      {selectedInsight && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Insight details: ${selectedInsight.title}`}
        >
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge label={selectedInsight.severity} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedInsight.category} · {selectedInsight.detectedAt}
                  </span>
                </div>
                <h3 className="mt-2.5 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {selectedInsight.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInsight(null)}
                aria-label="Close insight details"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="text-slate-500 dark:text-slate-400">{selectedInsight.metricLabel}</div>
                <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedInsight.metricValue}
                </div>
              </div>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedInsight.explanation}
              </p>
              <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
                <strong>Recommended Action:</strong> {selectedInsight.recommendedAction}
              </div>

              {insightDeepAnalysis && (
                <div className="whitespace-pre-line rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 leading-relaxed text-slate-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-slate-200">
                  <div className="mb-1 font-semibold text-indigo-700 dark:text-indigo-300">
                    Gemini Root-Cause Brief
                  </div>
                  {insightDeepAnalysis}
                </div>
              )}

              {insightError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {insightError}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleAnalyzeInsight(selectedInsight)}
                disabled={insightLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{insightLoading ? 'Running Gemini…' : 'Analyze Root Cause (Gemini)'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedInsight.relatedPage;
                    setSelectedInsight(null);
                    setActivePage(target);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Open Related Module
                </button>
                <button
                  type="button"
                  onClick={() => {
                    acknowledgeInsight(selectedInsight.id);
                    setSelectedInsight(null);
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
                >
                  Acknowledge & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
