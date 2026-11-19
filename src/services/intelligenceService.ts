import { ChatMessage } from '../types';
import {
  generateDemoAnalysis,
  generateDemoCopilotResponse,
} from './demoIntelligenceEngine';

export interface AIChatContext {
  activePage: string;
  orgName: string;
  dateRange: string;
  kpiSummary: string;
}

export async function sendCopilotMessage(params: {
  messages: Pick<ChatMessage, 'role' | 'text'>[];
  roleMode: string;
  context: AIChatContext;
}): Promise<{ reply: string; model: string; timestamp: string }> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Fall back to demo mode on network or static hosting
  }

  const lastUserMsg = params.messages[params.messages.length - 1]?.text || '';
  const { responseText } = generateDemoCopilotResponse(
    lastUserMsg,
    params.roleMode,
    params.context,
  );
  return {
    reply: responseText,
    model: 'gemini-4-hydrogen (demo)',
    timestamp: new Date().toISOString(),
  };
}

export async function streamCopilotMessage(
  params: {
    messages: Pick<ChatMessage, 'role' | 'text'>[];
    roleMode: string;
    context: AIChatContext;
  },
  callbacks: {
    onTools?: (tools: string[]) => void;
    onChunk: (text: string) => void;
  },
): Promise<void> {
  try {
    const res = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';

    // Only process as SSE stream if server explicitly returned text/event-stream
    if (res.ok && contentType.includes('text/event-stream') && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const evt of events) {
          const dataLine = evt
            .split('\n')
            .find((line) => line.startsWith('data: '));
          if (!dataLine) continue;

          const parsed = JSON.parse(dataLine.slice(6)) as {
            type: 'tools' | 'chunk' | 'done' | 'error';
            tools?: string[];
            text?: string;
            error?: string;
          };

          if (parsed.type === 'tools' && parsed.tools) {
            callbacks.onTools?.(parsed.tools);
          } else if (parsed.type === 'chunk' && parsed.text) {
            callbacks.onChunk(parsed.text);
          } else if (parsed.type === 'error') {
            throw new Error(parsed.error || 'Gemini streaming error.');
          }
        }
      }
      return;
    }
  } catch {
    // If backend is not running or failed, smoothly fall back to static demo mode
  }

  // Static demo fallback with realistic streaming simulation
  const lastUserMsg = params.messages[params.messages.length - 1]?.text || '';
  const { tools, responseText } = generateDemoCopilotResponse(
    lastUserMsg,
    params.roleMode,
    params.context,
  );

  if (tools.length > 0) {
    callbacks.onTools?.(tools);
    // Slight pause to simulate tool retrieval
    await new Promise((r) => setTimeout(r, 400));
  }

  // Stream text in small chunks for a natural AI typing effect
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    callbacks.onChunk(chunk);
    // Fast simulated typing
    await new Promise((r) => setTimeout(r, 20));
  }
}

export async function runGeminiAnalysis(params: {
  taskType: 'transaction' | 'borrower' | 'insight' | 'executive' | 'reconciliation';
  fast?: boolean;
  payload: Record<string, unknown>;
}): Promise<{ analysis: string; model: string; generatedAt: string }> {
  try {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Fall back to demo mode
  }

  const demoText = generateDemoAnalysis(params.taskType, params.payload);
  return {
    analysis: demoText,
    model: 'gemini-4-hydrogen (demo)',
    generatedAt: new Date().toISOString(),
  };
}

export async function checkAiHealth(): Promise<{ status: string; aiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Offline or static demo UI mode
  }
  return { status: 'demo', aiConfigured: true };
}
