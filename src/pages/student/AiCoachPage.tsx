import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { StreamCard } from '@/components/ai/StreamCard';
import { ClipboardList, BookOpen, CalendarClock, RefreshCcw } from 'lucide-react';
import { llmStatus } from '@/lib/llm';
import { STUDENT_RESOURCES_FALLBACK, STUDENT_SUBTASK_FALLBACK, STUDENT_TIMELINE_FALLBACK } from '@/mocks/aiCanned';
import { classNames } from '@/lib/format';

export function AiCoachPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const defaultTask = tasks.find((t) => t.status === 'in_progress') ?? tasks[0];
  const [taskId, setTaskId] = useState(defaultTask?.id ?? '');
  const [regenKey, setRegenKey] = useState(0);
  const task = tasks.find((t) => t.id === taskId);
  const llm = llmStatus();

  if (!task) return <div className="p-8 text-slate-500">暂无任务可分析</div>;

  const baseUser = `当前任务：${task.title}\n描述：${task.description}\n截止时间：${task.deadline}\n阶段：${task.stage}\n请基于此任务生成结构化的建议，使用中文，控制在 5 行以内。`;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI 导学反馈</h1>
          <p className="text-slate-500 text-sm mt-1">UC7 · 学生视图 — 基于当前任务给出 AI 建议</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={classNames(
              'text-xs px-2 py-1 rounded-full flex items-center gap-1.5',
              llm === 'online' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500',
            )}
          >
            <span className={classNames('w-1.5 h-1.5 rounded-full', llm === 'online' ? 'bg-green-500' : 'bg-slate-400')} />
            AI 服务{llm === 'online' ? '在线' : '离线'}
          </span>
          <select
            value={taskId}
            onChange={(e) => { setTaskId(e.target.value); setRegenKey((k) => k + 1); }}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <button
            onClick={() => setRegenKey((k) => k + 1)}
            className="px-3 py-1.5 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm flex items-center gap-1 hover:from-brand-700 hover:to-blue-800"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> 重新生成
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <StreamCard
          key={`subtask-${regenKey}`}
          systemPrompt="你是高校协作学习平台的 AI 助教，擅长把学生小组任务拆解成可执行子步骤。"
          userPrompt={`${baseUser}\n请把任务拆成 4 个可执行子步骤，每步一句，输出编号列表。`}
          fallback={STUDENT_SUBTASK_FALLBACK.map((s, i) => `${i + 1}. ${s}`).join('\n')}
          title="子任务拆分建议"
          icon={<ClipboardList className="w-4 h-4" />}
          toneClass="border-blue-100"
          iconBg="bg-blue-100 text-blue-600"
        />
        <StreamCard
          key={`res-${regenKey}`}
          systemPrompt="你是高校协作学习平台的 AI 助教，擅长根据任务推荐高质量的学习资源。"
          userPrompt={`${baseUser}\n请推荐 3 个高质量的学习资源（文档/视频/教程），每条包含标题与一句简短适配说明。`}
          fallback={STUDENT_RESOURCES_FALLBACK.map((r) => `${r.icon} ${r.title} — ${r.desc}`).join('\n')}
          title="学习资源推荐"
          icon={<BookOpen className="w-4 h-4" />}
          toneClass="border-green-100"
          iconBg="bg-green-100 text-green-600"
          delay={300}
        />
        <StreamCard
          key={`tl-${regenKey}`}
          systemPrompt="你是高校协作学习平台的 AI 助教，擅长基于截止时间倒推合理的学习时间线。"
          userPrompt={`${baseUser}\n基于剩余时间，给出 3 段时间区间和每段需要完成的内容，最后用一行预估能否按时完成。`}
          fallback={STUDENT_TIMELINE_FALLBACK.map((t) => `${t.range}  ${t.text}`).join('\n') + '\n预计可按时完成 ✓'}
          title="时间线建议"
          icon={<CalendarClock className="w-4 h-4" />}
          toneClass="border-purple-100"
          iconBg="bg-purple-100 text-purple-600"
          delay={600}
        />
      </div>

      <div className="mt-8 bg-brand-50/50 border border-brand-100 rounded-xl p-4 text-xs text-brand-800 flex items-center gap-2">
        <span>💡</span>
        <span>AI 建议基于你当前所属小组的协作数据与课程时间线生成；如果你对建议有反馈，可在每张卡片上点 👍 / 👎 提交。</span>
      </div>
    </div>
  );
}
