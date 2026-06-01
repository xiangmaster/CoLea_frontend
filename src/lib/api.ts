/**
 * 假网络层：所有页面都调 api()，handler 内部读写对应 store。
 * 加入 150~450ms 模拟延迟 + 可选失败率，使演示更像真实请求。
 * 同时把每次调用记录进 trace 池，供右下角"API 追踪面板"展示。
 */

const DEMO_FLAGS_KEY = 'colea:demoFlags';
interface DemoFlags {
  latency: boolean;
  failureRate: number; // 0~1
}

function readFlags(): DemoFlags {
  try {
    const raw = localStorage.getItem(DEMO_FLAGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { latency: true, failureRate: 0 };
}

export function setDemoFlags(p: Partial<DemoFlags>) {
  const next = { ...readFlags(), ...p };
  localStorage.setItem(DEMO_FLAGS_KEY, JSON.stringify(next));
}

export function getDemoFlags(): DemoFlags {
  return readFlags();
}

export interface ApiTraceEntry {
  id: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  traceId: string;
  at: number;
  ok: boolean;
}

type TraceListener = (entries: ApiTraceEntry[]) => void;

const traces: ApiTraceEntry[] = [];
const listeners = new Set<TraceListener>();

function emit() {
  listeners.forEach((l) => l(traces.slice(0, 24)));
}

export function subscribeTraces(l: TraceListener): () => void {
  listeners.add(l);
  l(traces.slice(0, 24));
  return () => { listeners.delete(l); };
}

export function clearTraces() {
  traces.length = 0;
  emit();
}

function genTraceId(): string {
  // 类 W3C trace-id 短形式
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '-' + Date.now().toString(16).slice(-6);
}

function inferMethod(path: string): string {
  const p = path.toLowerCase();
  if (/(create|publish|submit|register|sendcode|reset|snapshot|add|grade|push)/.test(p)) return 'POST';
  if (/(delete|remove|clear)/.test(p)) return 'DELETE';
  if (/(update|patch|edit|resolve|markread|markall)/.test(p)) return 'PATCH';
  return 'GET';
}

export async function api<T = unknown>(path: string, fn: () => T | Promise<T>): Promise<T> {
  const flags = readFlags();
  const start = performance.now();
  const traceId = genTraceId();
  if (flags.latency) {
    // 真实后端往返感：400~950ms；个别"重"操作（包含 create/publish/submit/grade/generate）多 200~500ms
    const heavy = /(create|publish|submit|grade|generate|register|reset)/i.test(path);
    const base = 400 + Math.random() * 550;
    const extra = heavy ? 200 + Math.random() * 300 : 0;
    await new Promise((r) => setTimeout(r, base + extra));
  }
  try {
    if (flags.failureRate > 0 && Math.random() < flags.failureRate) {
      throw new Error(`[mock-api] ${path} 模拟失败`);
    }
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    traces.unshift({
      id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      method: inferMethod(path),
      path,
      status: 200,
      durationMs: duration,
      traceId,
      at: Date.now(),
      ok: true,
    });
    if (traces.length > 50) traces.length = 50;
    emit();
    return result;
  } catch (e) {
    const duration = Math.round(performance.now() - start);
    traces.unshift({
      id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      method: inferMethod(path),
      path,
      status: 500,
      durationMs: duration,
      traceId,
      at: Date.now(),
      ok: false,
    });
    emit();
    throw e;
  }
}
