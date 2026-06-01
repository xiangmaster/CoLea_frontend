import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Save, History as HistoryIcon, Sparkles, Eye, X, FileText } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useCourseStore } from '@/store/courseStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useActivityStore } from '@/store/activityStore';
import { useCurrentUser } from '@/store/authStore';
import { Pill } from '@/components/ui/Tag';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import { classNames, formatDate, relativeTime } from '@/lib/format';
import { OnlyOfficeEditor } from '@/components/doc/OnlyOfficeEditor';
import type { SubmissionFile } from '@/mocks/tasks';

type RubricRow = { key: string; label: string; weight: number; score: number };

function parseRubric(rubric: string[]): RubricRow[] {
  return rubric.map((s, i) => {
    const m = s.match(/(.+?)\s*(\d+)\s*%/);
    if (m) return { key: `r-${i}`, label: m[1].trim(), weight: Number(m[2]), score: 85 };
    return { key: `r-${i}`, label: s, weight: Math.floor(100 / rubric.length), score: 85 };
  });
}

const DRAFT_KEY = (sid: string) => `colea:gradeDraft:${sid}`;

export function TeacherGradingPage() {
  const { submissionId } = useParams();
  const submissions = useTaskStore((s) => s.submissions);
  const tasks = useTaskStore((s) => s.tasks);
  const courses = useCourseStore((s) => s.courses);
  const grade = useTaskStore((s) => s.gradeSubmission);
  const pushN = useNotificationStore((s) => s.pushOne);
  const pushA = useActivityStore((s) => s.push);
  const me = useCurrentUser();
  const nav = useNavigate();

  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded'>('submitted');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(
    submissionId ?? submissions.find((s) => s.status === 'submitted')?.id ?? submissions[0]?.id,
  );
  const sel = submissions.find((s) => s.id === selectedId);
  const selTask = tasks.find((t) => t.id === sel?.taskId);
  const previewFile = sel?.files.find((f) => f.docxPath);

  const filteredSubs = useMemo(() => {
    return submissions.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      const t = tasks.find((x) => x.id === s.taskId);
      if (courseFilter !== 'all' && t?.courseId !== courseFilter) return false;
      return true;
    });
  }, [submissions, filter, courseFilter, tasks]);

  const [rows, setRows] = useState<RubricRow[]>([]);
  const [feedback, setFeedback] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFileTarget, setPreviewFileTarget] = useState<SubmissionFile | undefined>(undefined);

  useEffect(() => {
    if (!sel || !selTask) return;
    try {
      const draft = localStorage.getItem(DRAFT_KEY(sel.id));
      if (draft) {
        const obj = JSON.parse(draft);
        setRows(obj.rows);
        setFeedback(obj.feedback ?? '');
        return;
      }
    } catch {}
    const rubric = parseRubric(selTask.rubric ?? []);
    if (sel.score) rubric.forEach((r) => (r.score = sel.score!));
    setRows(rubric);
    setFeedback(sel.feedback ?? '');
  }, [selectedId, sel?.id, selTask?.id]);

  const total = useMemo(() => {
    if (!rows.length) return 0;
    const sumW = rows.reduce((s, r) => s + r.weight, 0) || 1;
    return Math.round(rows.reduce((s, r) => s + (r.score * r.weight) / sumW, 0));
  }, [rows]);

  const saveDraft = () => {
    if (!sel) return;
    localStorage.setItem(DRAFT_KEY(sel.id), JSON.stringify({ rows, feedback }));
    toast.success('草稿已保存');
  };

  const submit = async () => {
    if (!sel || !me) return;
    await api('/grading/submit', () => grade(sel.id, total, feedback));
    localStorage.removeItem(DRAFT_KEY(sel.id));
    pushN({
      kind: 'grade',
      title: `${selTask?.title} 已评分`,
      body: `${me.name} 给 ${sel.groupName} 打了 ${total} 分${feedback ? '：' + feedback.slice(0, 40) : ''}`,
      link: `/app/tasks/${sel.taskId}`,
      fromName: me.name,
      fromColor: me.avatarColor,
    });
    pushA({
      kind: 'grade',
      actorName: me.name,
      actorColor: me.avatarColor,
      text: '评分了',
      targetLabel: `${sel.groupName} ${selTask?.title} (${total})`,
      link: '/teacher/grading',
    });
    toast.success(`已为 ${sel.groupName} 评分 ${total}`);
    nav('/teacher/grading');
  };

  const aiSuggestScore = () => {
    setRows((rs) => rs.map((r) => ({ ...r, score: Math.max(60, Math.min(95, Math.round(78 + Math.random() * 14))) })));
    if (!feedback) {
      setFeedback('整体提交完成度良好，建议在以下两方面继续深化：1) 关键模块的接口契约写得更细；2) 数据持久层的事务边界明确化。');
    }
    toast.info('AI 已生成参考评分与评语，请人工复核');
  };

  const openPreview = (f: SubmissionFile) => {
    if (!f.docxPath) return toast.error('该附件无法在线预览');
    setPreviewFileTarget(f);
    setPreviewOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">评分中心</h1>
          <p className="text-slate-500 text-sm mt-1">查看原始提交文档 + Rubric 多维评分 + 推送学生</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg">
            <option value="submitted">待评分</option>
            <option value="graded">已评分</option>
            <option value="all">全部</option>
          </select>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg">
            <option value="all">全部课程</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800 flex items-center justify-between">
            <span>提交列表</span>
            <span className="text-xs text-slate-400 font-normal">{filteredSubs.length} 条</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {filteredSubs.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">没有提交</div>}
            {filteredSubs.map((s) => {
              const t = tasks.find((x) => x.id === s.taskId);
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={classNames('w-full text-left px-5 py-3 hover:bg-slate-50', s.id === selectedId && 'bg-brand-50')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{s.groupName}</span>
                    <Pill color={s.status === 'graded' ? 'green' : 'blue'}>{s.status === 'graded' ? `已评 ${s.score}` : '待评分'}</Pill>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">{t?.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{relativeTime(s.submittedAt)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-9 space-y-5">
          {sel && selTask ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h2 className="text-lg font-semibold text-slate-800">{selTask.title}</h2>
                  <div className="flex items-center gap-2">
                    {previewFile && (
                      <button
                        onClick={() => openPreview(previewFile)}
                        className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-medium hover:bg-brand-100 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> 查看原始文档
                      </button>
                    )}
                    <Pill color={sel.status === 'graded' ? 'green' : 'blue'}>{sel.status === 'graded' ? `已评 ${sel.score}` : '待评分'}</Pill>
                  </div>
                </div>
                <div className="text-sm text-slate-500 mb-3 flex items-center gap-2 flex-wrap">
                  <Avatar name={sel.groupName[0]} color="bg-blue-400" size={20} />
                  <strong>{sel.groupName}</strong> · 提交于 {formatDate(sel.submittedAt)} · 截止 {formatDate(selTask.deadline)}
                </div>
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 whitespace-pre-wrap">{sel.content}</div>
                {sel.files.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-slate-400 mb-1">附件 ({sel.files.length})</div>
                    <div className="space-y-1">
                      {sel.files.map((f) => (
                        <div key={f.id} className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg group">
                          <span className="flex items-center gap-1.5 truncate">
                            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            {f.name}
                            <span className="text-xs text-slate-400">· {f.size} · {f.uploader}</span>
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {f.docxPath && (
                              <button onClick={() => openPreview(f)} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> 预览
                              </button>
                            )}
                            <button
                              onClick={() => { toast.success(`已开始下载 ${f.name}`); }}
                              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> 下载
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800">Rubric 多维评分</h3>
                  <button
                    onClick={aiSuggestScore}
                    className="text-xs px-2.5 py-1.5 bg-gradient-to-r from-brand-50 to-sky-50 border border-brand-100 rounded-lg text-brand-700 hover:from-brand-100 hover:to-sky-100 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI 参考评分
                  </button>
                </div>

                <div className="space-y-4">
                  {rows.map((r, i) => (
                    <div key={r.key} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-3 text-sm text-slate-700">{r.label}</div>
                      <div className="col-span-2 text-xs text-slate-400">权重 {r.weight}%</div>
                      <div className="col-span-5">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={r.score}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setRows((rs) => rs.map((x, idx) => (idx === i ? { ...x, score: v } : x)));
                          }}
                          className="w-full accent-brand-600"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={r.score}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(100, Number(e.target.value)));
                            setRows((rs) => rs.map((x, idx) => (idx === i ? { ...x, score: v } : x)));
                          }}
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-sm text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm text-slate-500">加权总分</div>
                  <div className={classNames('text-3xl font-bold', total >= 85 ? 'text-green-600' : total >= 70 ? 'text-brand-600' : total >= 60 ? 'text-amber-600' : 'text-red-600')}>
                    {total}<span className="text-base text-slate-400 font-normal">/100</span>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs text-slate-500 mb-1">评语（学生可见）</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="写下针对本次提交的评语…"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={saveDraft} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                    <Save className="w-4 h-4" /> 保存草稿
                  </button>
                  <button onClick={submit} className="px-5 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800">
                    提交评分并通知学生
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-brand-600" /> 提交时间线
                </h3>
                <div className="space-y-3 text-sm">
                  <TLItem time={relativeTime(sel.submittedAt)} actor={sel.groupName} action={`提交了 ${selTask.title}`} />
                  {sel.status === 'graded' && (
                    <TLItem time={relativeTime(sel.submittedAt)} actor={me?.name ?? '教师'} action={`评分 ${sel.score}：${sel.feedback ?? ''}`} accent />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400">请从左侧选择一个提交</div>
          )}
        </div>
      </div>

      {previewOpen && previewFileTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col" style={{ height: '90vh' }}>
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">{previewFileTarget.name}</div>
                  <div className="text-xs text-slate-400">{previewFileTarget.uploader} 上传 · {previewFileTarget.size} · 只读视图</div>
                </div>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 onlyoffice-shell">
              <OnlyOfficeEditor
                docId={`grade-preview-${previewFileTarget.id}`}
                docTitle={previewFileTarget.name.replace(/\.[^.]+$/, '')}
                docxPath={previewFileTarget.docxPath!}
                userId={me?.id ?? 'reviewer'}
                userName={me?.name ?? '评审'}
                mode="view"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TLItem({ time, actor, action, accent }: { time: string; actor: string; action: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={classNames('w-2 h-2 rounded-full mt-1.5', accent ? 'bg-brand-600' : 'bg-slate-300')} />
      <div className="flex-1">
        <div className="text-sm text-slate-700"><span className="font-medium">{actor}</span> {action}</div>
        <div className="text-xs text-slate-400 mt-0.5">{time}</div>
      </div>
    </div>
  );
}
