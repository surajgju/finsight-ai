import { useMemo, useState } from 'react';
import { Activity, Bot, CheckCircle2, Clock, Download, Play, Sparkles } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/TableControls';
import { useFinSight } from '../../context/FinSightContext';
import { INITIAL_AGENT_EXECUTIONS, INITIAL_AI_AGENTS } from '../../data/mockAgents';
import { AIAgent, AgentExecutionRecord } from '../../types';
import { downloadCSV, formatInteger } from '../../utils/formatters';

export function AIAgentCentre() {
  const { showToast } = useFinSight();
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AI_AGENTS);
  const [executions, setExecutions] = useState<AgentExecutionRecord[]>(INITIAL_AGENT_EXECUTIONS);

  const handleRunAgent = (agent: AIAgent) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agent.id
          ? {
              ...a,
              tasksProcessed: a.tasksProcessed + 128,
              lastExecution: 'Just now',
              status: 'Active',
            }
          : a,
      ),
    );
    const newExec: AgentExecutionRecord = {
      id: `EXE-${3001 + executions.length}`,
      agentId: agent.id,
      agentName: agent.name,
      taskSummary: `Manual sweep triggered: evaluated 128 live institutional records`,
      targetEntity: 'Consolidated Institutional Batch',
      startedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      durationMs: agent.avgExecutionMs,
      outcome: 'Completed',
      recordsEvaluated: 128,
      confidence: 98.4,
    };
    setExecutions((prev) => [newExec, ...prev]);
    showToast(`${agent.name} completed on-demand sweep (128 records)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          AI Agent Monitoring Centre
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Autonomous financial intelligence agents, workload telemetry, and real-time execution activity
        </p>
      </div>

      {/* 7 Autonomous AI Agents Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {agent.name}
                    </h2>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {agent.modelTier}
                    </div>
                  </div>
                </div>
                <StatusBadge label={agent.status} />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {agent.role}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-950/60">
                <div>
                  <div className="text-[10px] text-slate-500">Processed</div>
                  <div className="font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {formatInteger(agent.tasksProcessed)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Success</div>
                  <div className="font-mono font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
                    {agent.successRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Avg Latency</div>
                  <div className="font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {agent.avgExecutionMs}ms
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Current Workload</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums dark:text-slate-200">
                    {agent.workloadPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-600"
                    style={{ width: `${agent.workloadPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>{agent.lastExecution}</span>
              </span>
              <button
                type="button"
                onClick={() => handleRunAgent(agent)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Play className="h-3 w-3" aria-hidden="true" />
                <span>Run Sweep</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Agent Activity Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent Agent Activity Timeline
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          {executions.slice(0, 8).map((ex) => (
            <div
              key={ex.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                    {ex.id}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {ex.agentName}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400">{ex.startedAt}</span>
                </div>
                <div className="mt-1 text-slate-600 dark:text-slate-300">
                  {ex.taskSummary} ({ex.targetEntity})
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                  {ex.recordsEvaluated} rows · {ex.durationMs}ms
                </span>
                <StatusBadge label={ex.outcome} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AgentExecutionHistory() {
  const { showToast } = useFinSight();
  const [agentFilter, setAgentFilter] = useState<string>('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      INITIAL_AGENT_EXECUTIONS.filter(
        (e) => agentFilter === 'All' || e.agentName === agentFilter,
      ),
    [agentFilter],
  );

  const paginated = filtered.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Agent Execution History
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Auditable execution log across all 7 autonomous FinSight AI agents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter execution logs by AI agent"
            value={agentFilter}
            onChange={(e) => {
              setAgentFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All AI Agents</option>
            {INITIAL_AI_AGENTS.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              downloadCSV('finsight-agent-execution-history.csv', filtered);
              showToast('Agent execution history exported to CSV');
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Execution ID</th>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Task Summary</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 text-right font-medium">Records</th>
                <th className="px-4 py-3 text-right font-medium">Latency</th>
                <th className="px-5 py-3 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono font-medium text-indigo-700 dark:text-indigo-400">
                    {ex.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {ex.agentName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-slate-200">{ex.taskSummary}</div>
                    <div className="text-[11px] text-slate-500">{ex.targetEntity}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 tabular-nums dark:text-slate-400">
                    {ex.startedAt}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {formatInteger(ex.recordsEvaluated)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {ex.durationMs}ms
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={ex.outcome} />
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

export function AIRecommendations() {
  const { recommendations, updateRecommendationStatus, openCopilotWithPrompt } = useFinSight();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          AI Operational Recommendations
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          High-impact policy optimizations proposed by FinSight AI across fraud, lending, reconciliation, and compliance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                  {rec.module} · {rec.confidence}% model confidence
                </span>
                <StatusBadge label={rec.status} />
              </div>
              <h2 className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {rec.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {rec.description}
              </p>
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                Projected Impact: {rec.impactMetric} · Implementation Effort: {rec.effort}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  openCopilotWithPrompt(
                    `Evaluate the trade-offs and rollout plan for AI Recommendation ${rec.id}: "${rec.title}" (${rec.impactMetric}).`,
                  )
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Simulate with Copilot</span>
              </button>

              <div className="flex items-center gap-2">
                {rec.status === 'Pending Review' && (
                  <button
                    type="button"
                    onClick={() => updateRecommendationStatus(rec.id, 'Approved')}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
                  >
                    Approve Policy
                  </button>
                )}
                {rec.status === 'Approved' && (
                  <button
                    type="button"
                    onClick={() => updateRecommendationStatus(rec.id, 'Deployed')}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Deploy Rule</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
