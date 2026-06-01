import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Upload, Paperclip, Trash2, FileText, Calendar, Target, Users as UsersIcon } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useCourseStore } from '@/store/courseStore';
import { useGroupStore } from '@/store/groupStore';
import { useCurrentUser } from '@/store/authStore';
import { Pill } from '@/components/ui/Tag';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import { classNames, formatDate, relativeTime } from '@/lib/format';
import type { SubmissionFile } from '@/mocks/tasks';

export function TaskDetailPage() {
  const { taskId = '' } = useParams();
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === taskId));
  const submissions = useTaskStore((s) => s.submissions.filter((x) => x.taskId === taskId));
  const submitWork = useTaskStore((s) => s.submitWork);
  const course = useCourseStore((s) => s.courses.find((c) => c.id === task?.courseId));
  const myGroup = useGroupStore((s) => s.groups.find((g) => g.courseId === task?.courseId));
  const me = useCurrentUser();

  const [content, setContent] = useState('');
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const overdue = task?.status === 'overdue';

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const newFiles: SubmissionFile[] = Array.from(list).map((f) => ({
      id: `f-${Date.now()}-${f.name}`,
      name: f.name,
      size: `${Math.round(f.size / 1024)} KB`,
      uploadedAt: new Date().toISOString(),
      uploader: me?.name ?? '我',
    }));
    setFiles((p) => [...p, ...newFiles]);
  };

  const onSubmit = async () => {
    if (!task || !myGroup) return;
    if (!content && files.length === 0) return toast.error('请填写提交说明或上传文件');
    setSubmitting(true);
    await api('/task/submit', () =>
      submitWork({
        taskId: task.id,
        groupId: myGroup.id,
        groupName: myGroup.name,
        content,
        files,
        submitterName: me?.name ?? '匿名',
      }),
    );
    setSubmitting(false);
    setContent('');
    setFiles([]);
    toast.success('提交成功');
  };

  const daysToDeadline = useMemo(() => {
    if (!task) return 0;
    return Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (24 * 3600 * 1000));
  }, [task]);

  if (!task) return <div className="p-8 text-slate-500">任务不存在</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-4 text-sm text-slate-500">
        <Link to="/app/dashboard" className="hover:underline">仪表盘</Link>
        <span className="mx-2 opacity-50">/</span>
        <Link to={`/app/courses/${task.courseId}`} className="hover:underline">{course?.name}</Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-slate-700">{task.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-slate-800">{task.title}</h1>
              <Pill color={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'blue' : task.status === 'overdue' ? 'red' : 'slate'}>
                {{ done: '已完成', in_progress: '进行中', overdue: '已逾期', pending: '待开始' }[task.status]}
              </Pill>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Info icon={<Calendar className="w-4 h-4" />} label="截止时间" value={`${formatDate(task.deadline)}（${overdue ? '已逾期' : `${daysToDeadline} 天后`}）`} highlight={overdue} />
              <Info icon={<Target className="w-4 h-4" />} label="阶段" value={task.stage} />
              <Info icon={<UsersIcon className="w-4 h-4" />} label="完成进度" value={`${task.completed} / ${task.total} 组`} />
              <Info icon={<FileText className="w-4 h-4" />} label="评分标准" value={task.rubric.join(' · ')} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">附件资料</h3>
            {task.attachments.length === 0 ? (
              <div className="text-sm text-slate-400">教师未提供附件</div>
            ) : (
              <div className="space-y-2">
                {task.attachments.map((f) => (
                  <FileLine key={f.id} f={f} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">提交作业</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="对本次提交做一些说明…"
              rows={4}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-3 border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 rounded-xl py-8 text-center cursor-pointer text-sm text-slate-500"
            >
              <Upload className="w-5 h-5 mx-auto text-brand-500 mb-1" />
              点击选择文件，或将文件拖放到此处
              <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                onChange={(e) => onPickFiles(e.target.files)}
              />
            </div>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f) => (
                  <FileLine
                    key={f.id}
                    f={f}
                    onDelete={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
                  />
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setContent(''); setFiles([]); }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                清空
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 disabled:opacity-60"
              >
                {submitting ? '提交中…' : '提交作业'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">所属小组</h3>
            {myGroup ? (
              <div className="text-sm text-slate-600">
                <div className="font-medium text-slate-800">{myGroup.name}</div>
                <div className="text-xs text-slate-400 mt-1">{myGroup.memberIds.length} 位成员 · 协作评分 {myGroup.collaborationScore}</div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">未分组</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">提交记录</h3>
            {submissions.length === 0 ? (
              <div className="text-sm text-slate-400">暂无提交</div>
            ) : (
              <div className="space-y-3">
                {submissions.map((s) => (
                  <div key={s.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{s.groupName}</span>
                      <Pill color={s.status === 'graded' ? 'green' : 'blue'}>
                        {s.status === 'graded' ? `已评分 ${s.score}` : '待评分'}
                      </Pill>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{relativeTime(s.submittedAt)}</div>
                    {s.feedback && <div className="text-xs text-slate-500 mt-2 italic">"{s.feedback}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileLine({ f, onDelete }: { f: SubmissionFile; onDelete?: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-2.5">
      <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-700 truncate">{f.name}</div>
        <div className="text-xs text-slate-400">{f.size} · {f.uploader}</div>
      </div>
      {onDelete && (
        <button onClick={onDelete} className="text-slate-400 hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function Info({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={classNames('bg-slate-50 rounded-lg px-3 py-2.5', highlight && 'bg-red-50')}>
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
        {icon} {label}
      </div>
      <div className={classNames('text-sm', highlight ? 'text-red-700 font-medium' : 'text-slate-700')}>{value}</div>
    </div>
  );
}
