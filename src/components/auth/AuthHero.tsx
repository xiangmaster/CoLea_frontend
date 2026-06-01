import {
  GraduationCap,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  FileText,
  PencilLine,
  Users,
  TrendingUp,
} from 'lucide-react';

/** 登录/注册页左侧的插画区。组合多个浮层模拟"高保真协作面板预览" */
export function AuthHero() {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-10 xl:p-16">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />
      {/* 模糊光斑 */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-brand-200/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-16 w-[28rem] h-[28rem] bg-sky-300/40 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 bg-indigo-200/40 rounded-full blur-2xl" />
      {/* 细网格 */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 顶部标语 */}
      <div className="relative z-10 max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs text-brand-700 font-medium shadow-sm border border-brand-100 mb-5">
          <GraduationCap className="w-4 h-4" />
          高校协作学习平台 · CoLea
        </div>
        <h1 className="text-4xl xl:text-5xl font-bold text-slate-800 leading-tight tracking-tight">
          让小组协作<br />
          <span className="bg-gradient-to-r from-brand-600 to-blue-700 bg-clip-text text-transparent">更高效、更可见</span>
        </h1>
        <p className="text-slate-500 text-sm xl:text-base mt-4 leading-relaxed">
          从智能互补分组、实时文档共创、过程追踪到 AI 导学反馈，<br />
          把课程小组的每一环都串成一条主线。
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          {['智能互补分组', '实时文档协作', 'AI 导学反馈', '协作可视化'].map((t) => (
            <span
              key={t}
              className="px-3 py-1 bg-white/85 backdrop-blur-sm rounded-full text-xs text-brand-700 font-medium shadow-sm border border-brand-100/60"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 中部：组合插画 */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-10">
        <div className="relative w-[420px] h-[340px]">
          {/* 底层文档卡 */}
          <div className="absolute left-0 top-6 w-64 h-72 bg-white rounded-2xl shadow-2xl shadow-brand-300/30 border border-slate-100 -rotate-6 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">系统设计文档</div>
                <div className="text-[10px] text-slate-400">v1.2 · 4 人协作</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-slate-200 rounded-full" />
              <div className="h-2.5 w-5/6 bg-slate-100 rounded-full" />
              <div className="h-2.5 w-4/6 bg-slate-100 rounded-full" />
              <div className="h-2.5 w-full bg-slate-100 rounded-full" />
              <div className="h-2.5 w-3/4 bg-slate-100 rounded-full" />
            </div>
            <div className="mt-4 bg-brand-50 rounded-lg p-2.5 border-l-2 border-brand-500">
              <div className="text-[10px] text-brand-700 font-medium">UC3 任务状态机</div>
              <div className="text-[9px] text-slate-500 mt-0.5">已完成 / 进行中 / 已逾期 / 待开始</div>
            </div>
          </div>

          {/* 中层文档卡 */}
          <div className="absolute right-0 top-0 w-64 h-72 bg-white rounded-2xl shadow-2xl shadow-blue-300/30 border border-slate-100 rotate-3 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-700">需求分析报告</div>
                  <div className="text-[10px] text-slate-400">v2.3 · 已评分 92</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-slate-200 rounded-full" />
              <div className="h-2.5 w-4/5 bg-slate-100 rounded-full" />
              <div className="h-2.5 w-full bg-slate-100 rounded-full" />
              <div className="h-2.5 w-3/5 bg-slate-100 rounded-full" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Alpha 组 · 完整性 30/30
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                清晰度 24/25 · 可行性 23/25
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                排版 15/20 · 可优化
              </div>
            </div>
          </div>

          {/* 顶层在线协作卡（前景） */}
          <div className="absolute left-12 -bottom-2 w-80 bg-white rounded-2xl shadow-2xl shadow-blue-400/30 border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">张</div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">李</div>
                  <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">王</div>
                  <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">陈</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-700">Alpha 组 · 4 人在线</div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    正在编辑文档
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">协作评分 92</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium text-slate-700">李同学</div>
                <div className="text-[10px] text-slate-500 truncate">UC3 状态机需要补充逾期触发条件</div>
              </div>
              <div className="text-[10px] text-slate-400">刚刚</div>
            </div>
          </div>

          {/* 浮动小徽章：AI 建议 */}
          <div className="absolute -top-4 -right-4 px-3 py-2 bg-gradient-to-br from-brand-600 to-blue-700 text-white rounded-xl shadow-lg shadow-brand-500/40 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">AI 建议</span>
          </div>

          {/* 浮动小徽章：评分通知 */}
          <div className="absolute top-32 -right-8 bg-white rounded-xl shadow-lg border border-emerald-100 p-2.5 flex items-center gap-2 max-w-[180px]">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-700">协作评分 +3</div>
              <div className="text-[9px] text-slate-400">本周进入前 15%</div>
            </div>
          </div>

          {/* 浮动小徽章：小组 */}
          <div className="absolute -bottom-6 -left-4 bg-white rounded-xl shadow-lg border border-slate-100 p-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-700">智能分组完成</div>
              <div className="text-[9px] text-slate-400">互补度 95%</div>
            </div>
          </div>

          {/* 浮动笔形装饰 */}
          <div className="absolute top-20 left-44 w-9 h-9 rounded-xl bg-white shadow-lg flex items-center justify-center rotate-12">
            <PencilLine className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      {/* 底部留白：让插画呼吸 */}
      <div className="relative z-10 text-xs text-slate-400">
        © {new Date().getFullYear()} CoLea · 专业方向综合项目
      </div>
    </div>
  );
}
