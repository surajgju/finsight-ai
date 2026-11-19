import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { FunctionDeclaration, GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { INITIAL_TRANSACTIONS } from './src/data/mockTransactions';
import { MOCK_LENDING_APPLICATIONS } from './src/data/mockLending';
import { INITIAL_RECONCILIATION_RECORDS } from './src/data/mockReconciliation';
import { INITIAL_FRAUD_CASES } from './src/data/mockFraudCases';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const ROLE_INSTRUCTIONS: Record<string, string> = {
  executive:
    'You are FinSight AI Executive Copilot, advising a Bank/NBFC CEO, CTO, CFO, and CRO on enterprise financial operations, liquidity, revenue growth, fraud loss prevention, and operational automation in India (INR, Lakhs, Crores). Use the provided lookup tools whenever the user references specific transactions, borrowers, fraud cases, or reconciliation discrepancies. Keep responses crisp, structured with clear bullet points, and grounded in retrieved telemetry.',
  fraud:
    'You are FinSight AI Fraud & Risk Investigator, specializing in real-time UPI/IMPS/NEFT/Card anomaly detection, mule-account network graph analysis, device fingerprinting, and RBI fraud reporting workflows. Always use lookupTransaction or listHighRiskTransactions when checking specific IDs or clusters.',
  credit:
    'You are FinSight AI Credit Underwriting Officer, evaluating Indian MSME and corporate borrowers using GST cashflows, debt-to-revenue ratios, existing liabilities, and alternative credit telemetry. Use lookupBorrower to retrieve exact borrower figures and remind users that simulated scores are illustrative decision support.',
  compliance:
    'You are FinSight AI Compliance & AML Specialist, advising on RBI KYC master directions, FIU-IND STR/CTR thresholds, PMLA screening, and automated audit readiness. Provide concise, actionable remediation guidance.',
};

const FINSIGHT_TOOLS: FunctionDeclaration[] = [
  {
    name: 'lookupTransaction',
    description:
      'Retrieve full telemetry, risk score, customer, merchant, device/IP, and AI reasoning for a specific Transaction ID (e.g. TXN-98231).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        transactionId: {
          type: Type.STRING,
          description: 'The transaction identifier, e.g. TXN-98231',
        },
      },
      required: ['transactionId'],
    },
  },
  {
    name: 'lookupBorrower',
    description:
      'Retrieve borrower credit assessment, annual revenue, existing liabilities, credit score, and default probability by loan ID or company name (e.g. ABC Manufacturing Pvt. Ltd. or LN-8001).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Loan application ID or partial borrower name',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'listHighRiskTransactions',
    description:
      'List top high-risk or critical transactions and active fraud cases sorted by risk score.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        minRiskScore: {
          type: Type.NUMBER,
          description: 'Minimum risk score threshold (default 75)',
        },
      },
    },
  },
  {
    name: 'getReconciliationExceptions',
    description:
      'Retrieve unmatched settlement variances and potential duplicate records from the nodal and payment gateway reconciliation ledger.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        statusFilter: {
          type: Type.STRING,
          description: 'Optional status filter: Unmatched or Potential Duplicate',
        },
      },
    },
  },
];

function executeFinSightTool(name: string, args: Record<string, unknown> = {}): unknown {
  if (name === 'lookupTransaction') {
    const id = String(args.transactionId || '').trim().toUpperCase();
    const match = INITIAL_TRANSACTIONS.find((t) => t.id.toUpperCase() === id);
    if (!match) {
      return { found: false, message: `Transaction ${id} not found in simulated ledger.` };
    }
    const relatedCase = INITIAL_FRAUD_CASES.find(
      (f) => f.transactionId.toUpperCase() === id,
    );
    return { found: true, transaction: match, relatedFraudCase: relatedCase ?? null };
  }

  if (name === 'lookupBorrower') {
    const q = String(args.query || '').trim().toLowerCase();
    const match = MOCK_LENDING_APPLICATIONS.find(
      (b) => b.id.toLowerCase() === q || b.borrowerName.toLowerCase().includes(q),
    );
    if (!match) {
      return { found: false, message: `No borrower matching "${args.query}" found.` };
    }
    return {
      found: true,
      note: 'Simulated illustrative credit assessment — not an actual lending decision.',
      borrower: match,
    };
  }

  if (name === 'listHighRiskTransactions') {
    const minScore = Number(args.minRiskScore ?? 75);
    const items = [...INITIAL_TRANSACTIONS]
      .filter((t) => t.riskScore >= minScore)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 6);
    return {
      count: items.length,
      transactions: items,
      activeCriticalCases: INITIAL_FRAUD_CASES.filter((c) => c.severity === 'Critical'),
    };
  }

  if (name === 'getReconciliationExceptions') {
    const filter = String(args.statusFilter || '');
    const exceptions = INITIAL_RECONCILIATION_RECORDS.filter((r) =>
      filter
        ? r.status.toLowerCase() === filter.toLowerCase()
        : r.status === 'Unmatched' || r.status === 'Potential Duplicate',
    ).slice(0, 8);
    return {
      exceptionCount: exceptions.length,
      records: exceptions,
    };
  }

  return { error: `Unknown tool: ${name}` };
}

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  messages?: ChatTurn[];
  roleMode?: string;
  context?: {
    activePage?: string;
    orgName?: string;
    dateRange?: string;
    kpiSummary?: string;
  };
}

interface AnalyzeRequestBody {
  taskType?: 'transaction' | 'borrower' | 'insight' | 'executive' | 'reconciliation';
  fast?: boolean;
  payload?: Record<string, unknown>;
}

function buildSystemInstruction(body: ChatRequestBody): string {
  const roleKey = body.roleMode && ROLE_INSTRUCTIONS[body.roleMode] ? body.roleMode : 'executive';
  const ctx = body.context || {};
  return [
    ROLE_INSTRUCTIONS[roleKey],
    'Important: All financial figures in the FinSight AI workspace come from a simulated Indian fintech dataset for demonstration purposes. Do not invent external live banking feeds.',
    ctx.orgName ? `Active Organisation: ${ctx.orgName}` : '',
    ctx.dateRange ? `Active Date Range: ${ctx.dateRange}` : '',
    ctx.activePage ? `Current Workspace Module: ${ctx.activePage}` : '',
    ctx.kpiSummary ? `Live Workspace Snapshot:\n${ctx.kpiSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY?.trim() &&
        process.env.GEMINI_API_KEY?.trim() !== 'MY_GEMINI_API_KEY',
    );
    res.json({ status: 'ok', aiConfigured: hasKey });
  });

  app.post('/api/ai/chat/stream', async (req: Request, res: Response) => {
    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to enable live FinSight AI Copilot responses.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    const body = (req.body || {}) as ChatRequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.text?.trim()) {
      res.status(400).json({ error: 'The latest message must be a non-empty user prompt.' });
      return;
    }

    const systemInstruction = buildSystemInstruction(body);
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const writeEvent = (payload: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      // Turn 1: Check if Gemini invokes any FinSight ledger lookup tools
      const firstTurn = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: FINSIGHT_TOOLS }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const functionCalls = firstTurn.functionCalls;
      const previousContent = firstTurn.candidates?.[0]?.content;

      if (functionCalls && functionCalls.length > 0 && previousContent) {
        const invokedLabels = functionCalls.map((fc) => {
          const argVal = Object.values(fc.args ?? {})[0];
          return argVal ? `${fc.name}(${String(argVal)})` : `${fc.name}()`;
        });
        writeEvent({ type: 'tools', tools: invokedLabels });

        const responseParts = functionCalls.map((fc) => ({
          functionResponse: {
            id: fc.id,
            name: fc.name ?? 'unknownTool',
            response: {
              result: executeFinSightTool(
                fc.name ?? '',
                (fc.args as Record<string, unknown>) ?? {},
              ),
            },
          },
        }));

        const stream = await ai.models.generateContentStream({
          model: 'gemini-4-hydrogen',
          contents: [
            ...contents,
            previousContent,
            { role: 'user', parts: responseParts },
          ],
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: FINSIGHT_TOOLS }],
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            writeEvent({ type: 'chunk', text: chunk.text });
          }
        }
      } else {
        const text = firstTurn.text ?? 'No response text was generated.';
        writeEvent({ type: 'chunk', text });
      }

      writeEvent({ type: 'done', model: 'gemini-4-hydrogen' });
      res.end();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to communicate with Gemini API.';
      writeEvent({ type: 'error', error: message });
      res.end();
    }
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to enable live FinSight AI Copilot responses.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    const body = (req.body || {}) as ChatRequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (messages.length === 0) {
      res.status(400).json({ error: 'At least one message is required.' });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.text?.trim()) {
      res.status(400).json({ error: 'The latest message must be a non-empty user prompt.' });
      return;
    }

    const systemInstruction = buildSystemInstruction(body);
    const priorHistory = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        history: priorHistory,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const response = await chat.sendMessage({
        message: lastMessage.text.trim(),
      });

      res.json({
        reply: response.text ?? 'No response text was generated.',
        model: 'gemini-4-hydrogen',
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to communicate with Gemini API.';
      const status =
        message.includes('403') || message.includes('PERMISSION_DENIED')
          ? 403
          : message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
            ? 429
            : 500;
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/analyze', async (req: Request, res: Response) => {
    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to run live Gemini intelligence analysis.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    const body = (req.body || {}) as AnalyzeRequestBody;
    if (!body.taskType || !body.payload) {
      res.status(400).json({ error: 'taskType and payload are required.' });
      return;
    }

    const modelName = body.fast ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';
    const promptByTask: Record<string, string> = {
      transaction: `Analyze this flagged Indian financial transaction from our simulated monitoring ledger. Provide: 1) Risk Drivers, 2) Mule/Velocity Assessment, 3) Recommended Immediate Control Action (Hold / Escalate / Clear). Keep it under 160 words.\n\nData: ${JSON.stringify(body.payload)}`,
      borrower: `Draft a concise illustrative AI Credit Underwriting Note for this Indian MSME/corporate borrower. Highlight debt service capacity, GST/revenue health, key covenant risks, and a clear illustrative recommendation. Note that simulated scores are illustrative only. Keep it under 180 words.\n\nData: ${JSON.stringify(body.payload)}`,
      insight: `Provide a root-cause investigation brief and 3 concrete operational mitigation steps for this financial intelligence alert. Keep it under 160 words.\n\nAlert: ${JSON.stringify(body.payload)}`,
      executive: `Synthesize an executive boardroom briefing from these simulated fintech metrics across transactions, fraud prevention, lending risk, and compliance. Highlight top 2 opportunities and top 2 risks in under 160 words.\n\nMetrics: ${JSON.stringify(body.payload)}`,
      reconciliation: `Analyze this bank/gateway settlement discrepancy and recommend automated reconciliation resolution steps. Keep it under 140 words.\n\nRecord: ${JSON.stringify(body.payload)}`,
    };

    const contents = promptByTask[body.taskType] || promptByTask.executive;

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction:
            'You are FinSight AI, an enterprise financial intelligence engine for Indian banks, NBFCs, and payment gateways. Output crisp, plain-text structured bullet points using INR (₹, Lakhs, Crores). Never use markdown code blocks.',
          ...(modelName === 'gemini-4-hydrogen'
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
        },
      });

      res.json({
        analysis: response.text ?? 'Analysis completed with empty output.',
        model: modelName,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gemini analysis request failed.';
      res.status(500).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinSight AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start FinSight AI server:', err);
  process.exit(1);
});
