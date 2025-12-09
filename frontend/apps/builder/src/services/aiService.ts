const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');

type AiContext = Record<string, unknown>;

export type AiSuggestion = {
  title: string;
  summary: string;
  suggestion: Record<string, unknown>;
  generatedAt: string;
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function askAiGenerate(prompt: string, context: AiContext = {}): Promise<AiSuggestion> {
  const res = await fetch(`${API_BASE}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context })
  });
  return handle<AiSuggestion>(res);
}


