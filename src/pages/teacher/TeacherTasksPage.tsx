import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useCourseStore } from '@/store/courseStore';
import { Pill } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/store/toastStore';
import { classNames, formatDate } from '@/lib/format';

export function TeacherTasksPage() {
  const { courseId = 'c-se' } = useParams();
  const tasks = useTaskStore((s) => s.tasks.filter((t) => t.courseId === courseId));
  const publishTask = useTaskStore((s) => s.publishTask);
  const course = useCourseStore((s) => s.courses.find((c) => c.id === courseId));
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [stage, setStage] = useState('实现阶段');
  const [total, setTotal] = useState(4);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">任务发布 · {course?.name}</h1>
          <p className="text-slate-500 text-sm mt-1">管理课程内的所有任务与评分入口</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> 发布任务
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">任务</th>
              <th className="px-6 py-3 font-medium">截止</th>
              <th className="px-6 py-3 font-medium">状态</th>
              <th className="px-6 py-3 font-medium">进度</th>
              <th className="px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <tr key={t.id} className={classNames('hover:bg-slate-50', t.status === 'overdue' && 'bg-red-50/30')}>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800 text-sm">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(t.deadline)}</td>
                <td className="px-6 py-4">
                  <Pill color={t.status === 'done' ? 'green' : t.status === 'in_progress' ? 'blue' : t.status === 'overdue' ? 'red' : 'slate'}>
                    {{ done: '已完成', in_progress: '进行中', overdue: '已逾期', pending: '待开始' }[t.status]}
                  </Pill>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{t.completed}/{t.total}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => nav('/teacher/grading')} className="text-brand-600 hover:underline mr-3">
                    评分
                  </button>
                  <button onClick={() => nav(`/app/tasks/${t.id}`)} className="text-slate-500 hover:underline">
                    详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="发布新任务"
        width={520}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800">
              取消
            </button>
            <button
              onClick={() => {
                if (!title || !deadline) return toast.error('请填写标题与截止时间');
                publishTask({
                  courseId,
                  title,
                  description: desc,
                  deadline,
                  stage,
                  total,
                  attachments: [],
                  rubric: ['完成度 40%', '质量 30%', '协作 30%'],
                });
                toast.success('任务已发布');
                setOpen(false);
                setTitle(''); setDesc(''); setDeadline('');
              }}
              className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800"
            >
              发布
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <Row label="任务标题"><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full input" /></Row>
          <Row label="任务描述"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full input" /></Row>
          <div className="grid grid-cols-2 gap-3">
            <Row label="截止时间"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full input" /></Row>
            <Row label="阶段">
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full input">
                <option>需求阶段</option>
                <option>设计阶段</option>
                <option>实现阶段</option>
                <option>测试阶段</option>
                <option>部署阶段</option>
              </select>
            </Row>
            <Row label="参与组数"><input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} className="w-full input" /></Row>
          </div>
        </div>
        <style>{`.input{padding:.5rem .75rem;border:1px solid #e2e8f0;border-radius:.5rem;font-size:.875rem;outline:none;}.input:focus{box-shadow:0 0 0 2px rgba(37,99,235,.3);border-color:#2563eb;}`}</style>
      </Modal>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
