import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Database, Send, Sparkles, Trash2, User, X } from 'lucide-react';
import { useFinSight } from '../../context/FinSightContext';
import { ChatMessage } from '../../types';
import { streamCopilotMessage } from '../../services/intelligenceService';
import { getDateRangeLabel } from '../../services/analyticsService';

const ROLE_MODES = [
  { id: 'executive', label: 'Executive CFO Advisor' },
  { id: 'fraud', label: 'Fraud & Risk Investigator' },
  { id: 'credit', label: 'Credit Underwriting Officer' },
  { id: 'compliance', label: 'Compliance & AML Specialist' },
];

const SUGGESTED_PROMPTS = [
  'Inspect TXN-98231 and explain its mule network cluster and containment steps.',
  'Assess ABC Manufacturing Pvt. Ltd. credit profile and debt-to-revenue ratio.',
  'List today’s high-risk transactions above score 80 and open reconciliation exceptions.',
  'Which RBI KYC & AML priorities require immediate analyst action?',
];

export function CopilotDrawer() {
  const {
    copilotOpen,
    setCopilotOpen,
    copilotSeedPrompt,
    clearCopilotSeedPrompt,
    activePage,
    selectedOrg,
    dateRange,
    kpis,
  } = useFinSight();

  const [roleMode, setRoleMode] = useState<string>('executive');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: 'Hello, I am FinSight AI Copilot powered by Gemini with live institutional ledger lookup tools. Ask me to inspect any Transaction ID (e.g. TXN-98231), evaluate MSME credit files, or diagnose nodal reconciliation variances.',
      timestamp: 'Ready',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, copilotOpen]);

  const kpiSummary = kpis.map((k) => `${k.label}: ${k.formattedValue} (${k.deltaPercent}%)`).join(' | ');

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const modelId = `m-${Date.now() + 1}`;
    const placeholderMsg: ChatMessage = {
      id: modelId,
      role: 'model',
      text: '',
      toolCalls: [],
      timestamp: 'Streaming…',
    };

    const nextThread = [...messages, userMsg];
    setMessages([...nextThread, placeholderMsg]);
    if (!overrideText) setInput('');
    setLoading(true);

    try {
      const apiHistory = nextThread
        .filter((m) => m.id !== 'welcome-msg' && !m.error)
        .map((m) => ({ role: m.role, text: m.text }));

      await streamCopilotMessage(
        {
          messages: apiHistory,
          roleMode,
          context: {
            activePage,
            orgName: selectedOrg.name,
            dateRange: getDateRangeLabel(dateRange),
            kpiSummary,
          },
        },
        {
          onTools: (tools) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === modelId ? { ...m, toolCalls: tools } : m)),
            );
          },
          onChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === modelId ? { ...m, text: m.text + chunk } : m)),
            );
          },
        },
      );

      const doneTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === modelId
            ? {
                ...m,
                text: m.text || 'Completed tool inspection.',
                timestamp: doneTime,
              }
            : m,
        ),
      );
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : 'Unable to reach FinSight AI Copilot.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === modelId
            ? {
                ...m,
                text: errorText,
                timestamp: 'Error',
                error: true,
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (copilotOpen && copilotSeedPrompt) {
      const seeded = copilotSeedPrompt;
      clearCopilotSeedPrompt();
      void handleSend(seeded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copilotOpen, copilotSeedPrompt]);

  if (!copilotOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="FinSight AI Copilot Chat"
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                FinSight AI Copilot
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Streaming Gemini + Ledger Tools · {selectedOrg.shortName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMessages((prev) => prev.slice(0, 1))}
              aria-label="Clear chat history"
              title="Clear conversation"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setCopilotOpen(false)}
              aria-label="Close FinSight AI Copilot"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950/60">
          <label
            htmlFor="copilot-role-select"
            className="block text-[11px] font-medium text-slate-500 dark:text-slate-400"
          >
            Advisor Role Persona
          </label>
          <select
            id="copilot-role-select"
            value={roleMode}
            onChange={(e) => setRoleMode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {ROLE_MODES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : msg.error
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                ) : msg.error ? (
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </div>
              <div
                className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : msg.error
                      ? 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
                      : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100'
                }`}
              >
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {msg.toolCalls.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                      >
                        <Database className="h-2.5 w-2.5" aria-hidden="true" />
                        <span>Lookup: {tool}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap">
                  {msg.text || (loading && !msg.error ? 'Querying institutional telemetry…' : '')}
                </div>
                <div
                  className={`mt-1 text-[10px] ${
                    msg.role === 'user'
                      ? 'text-sky-100'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.slice(0, 2).map((q) => (
              <button
                key={q}
                type="button"
                disabled={loading}
                onClick={() => handleSend(q)}
                className="max-w-full truncate rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:text-sky-300"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FinSight AI about TXN-98231, borrowers, or recon..."
              aria-label="Ask FinSight AI Copilot"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message to FinSight AI Copilot"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
