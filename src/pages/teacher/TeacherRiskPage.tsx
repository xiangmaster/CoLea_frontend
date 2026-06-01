import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { classNames, relativeTime } from '@/lib/format';
import { fakeType, llmConfigured, streamChat } from '@/lib/llm';
import { TEACHER_RISK_SUGGESTIONS } from '@/mocks/aiCanned';
import type { GroupRiskMetrics } from '@/mocks/analytics';

export function TeacherRiskPage() {
  const risks = useAnalyticsStore((s) => s.risks);
  const [lastUpdated] = useState(Date.now() - 5 * 60 * 1000);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI 风险预警</h1>
        <p className="text-slate-500 text-sm mt-1">UC7 · 教师视图 — 监控各小组协作健康度</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h4 className="font-semibold text-white">AI 风险监控</h4>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
              {risks.filter((r) => r.level !== 'low').length} 个预警
            </span>
          </div>
          <span className="text-xs text-slate-400">最后更新: {relativeTime(lastUpdated)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {risks.map((r) => (
            <RiskCard key={r.groupId} r={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskCard({ r }: { r: GroupRiskMetrics }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctl = new AbortController();
    const start = async () => {
      const fallback = TEACHER_RISK_SUGGESTIONS[r.groupId] ?? r.suggestion;
      const userPrompt = `小组：${r.groupName}\n风险等级：${r.level}\n指标：\n${r.bullets.map((b) => `- ${b}`).join('\n')}\n请用一段话给出可执行的改进建议（中文，<= 100 字）。`;
      const systemPrompt = '你是协作学习平台的 AI 教学顾问，根据小组协作指标给出具体可执行的干预建议。';
      if (llmConfigured()) {
        await streamChat({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          signal: ctl.signal,
          onDelta: (d) => setSuggestion((p) => p + d),
          onDone: () => setLoading(false),
          onError: async () => {
            await fakeType(fallback, (d) => setSuggestion((p) => p + d), 18, ctl.signal);
            setLoading(false);
          },
        });
      } else {
        await fakeType(fallback, (d) => setSuggestion((p) => p + d), 18, ctl.signal);
        setLoading(false);
      }
    };
    start();
    return () => ctl.abort();
  }, [r.groupId]);

  const riskClass = r.level === 'high' ? 'risk-high' : r.level === 'medium' ? 'risk-medium' : 'risk-low';
  const labelBg = r.level === 'high' ? 'bg-red-500/20 text-red-400' : r.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400';
  const cueColor = r.level === 'low' ? 'text-green-300' : 'text-amber-300';

  return (
    <div className={classNames('bg-slate-700/50 rounded-xl p-4', riskClass)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">{r.groupName}</span>
        <span className={classNames('px-2 py-0.5 rounded-full text-xs font-medium', labelBg)}>
          {{ high: '高风险', medium: '中风险', low: '健康' }[r.level]}
        </span>
      </div>
      <div className="text-xs text-slate-400 space-y-1 mb-3">
        {r.bullets.map((b, i) => (
          <div key={i}>• {b}</div>
        ))}
      </div>
      <div className="bg-slate-600/50 rounded-lg p-2.5">
        <div className={`text-xs ${cueColor} font-medium mb-1`}>
          {r.level === 'low' ? '✅ 状态良好' : '🤖 AI 改进建议'}
        </div>
        <div className="text-xs text-slate-300 whitespace-pre-wrap">
          {suggestion}
          {loading && <span className="inline-block w-1 h-3 bg-slate-300 ml-0.5 cursor-blink align-middle" />}
        </div>
      </div>
    </div>
  );
}
