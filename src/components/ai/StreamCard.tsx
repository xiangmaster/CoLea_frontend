import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { llmConfigured, streamChat, fakeType } from '@/lib/llm';

interface Props {
  systemPrompt: string;
  userPrompt: string;
  fallback: string;
  title: string;
  icon: ReactNode;
  toneClass: string; // e.g. 'border-blue-100'
  iconBg: string; // e.g. 'bg-blue-100 text-blue-600'
  autoStart?: boolean;
  delay?: number;
}

export function StreamCard({ systemPrompt, userPrompt, fallback, title, icon, toneClass, iconBg, autoStart = true, delay = 0 }: Props) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!autoStart) return;
    const ctl = new AbortController();
    abortRef.current = ctl;
    let cancelled = false;

    const start = async () => {
      if (delay) await new Promise((r) => setTimeout(r, delay));
      if (cancelled) return;
      if (llmConfigured()) {
        await streamChat({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          signal: ctl.signal,
          onDelta: (d) => setText((p) => p + d),
          onDone: () => setDone(true),
          onError: async (e) => {
            setError(e.message);
            await fakeType(fallback, (s) => setText((p) => p + s), 18, ctl.signal);
            setDone(true);
          },
        });
      } else {
        await fakeType(fallback, (s) => setText((p) => p + s), 22, ctl.signal);
        setDone(true);
      }
    };
    start();

    return () => {
      cancelled = true;
      ctl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border slide-in ${toneClass}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
        <h4 className="font-semibold text-slate-700 text-sm">{title}</h4>
      </div>
      <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[120px]">
        {text}
        {!done && <span className="inline-block w-1 h-3 bg-brand-500 ml-0.5 cursor-blink align-middle" />}
      </div>
      {!done && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-brand-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> AI 正在生成建议…
        </div>
      )}
      {done && error && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-amber-500">
          已切换离线兜底（{error}）
        </div>
      )}
    </div>
  );
}
