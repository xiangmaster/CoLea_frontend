/**
 * yunwu (OpenAI 兼容) 流式 chat 客户端。
 * 未配置 key 时返回 'offline'，由调用方走 canned fallback。
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function llmConfigured(): boolean {
  return !!import.meta.env.VITE_LLM_API_KEY && !!import.meta.env.VITE_LLM_BASE_URL;
}

export function llmStatus(): 'online' | 'offline' {
  return llmConfigured() ? 'online' : 'offline';
}

interface StreamArgs {
  messages: ChatMessage[];
  onDelta: (chunk: string) => void;
  onDone?: (full: string) => void;
  onError?: (e: Error) => void;
  signal?: AbortSignal;
}

export async function streamChat({ messages, onDelta, onDone, onError, signal }: StreamArgs): Promise<void> {
  if (!llmConfigured()) {
    onError?.(new Error('LLM not configured'));
    return;
  }
  const base = String(import.meta.env.VITE_LLM_BASE_URL).replace(/\/$/, '');
  const url = `${base}/chat/completions`;
  const model = String(import.meta.env.VITE_LLM_MODEL || 'gpt-4o');
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_LLM_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: 0.7 }),
      signal,
    });
  } catch (e) {
    onError?.(e as Error);
    return;
  }
  if (!res.ok || !res.body) {
    onError?.(new Error(`HTTP ${res.status}`));
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const raw of lines) {
        const line = raw.trim();
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
          /* keepalive frame */
        }
      }
    }
    onDone?.(full);
  } catch (e) {
    onError?.(e as Error);
  }
}

/** 用于离线兜底：把一段文本按字符打字机式输出 */
export async function fakeType(text: string, onDelta: (s: string) => void, msPerChar = 18, signal?: AbortSignal): Promise<void> {
  for (const ch of text) {
    if (signal?.aborted) return;
    onDelta(ch);
    await new Promise((r) => setTimeout(r, msPerChar));
  }
}
