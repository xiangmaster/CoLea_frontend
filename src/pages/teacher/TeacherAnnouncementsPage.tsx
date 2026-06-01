import { useState } from 'react';
import { Megaphone, Pin, Trash2, Plus, X } from 'lucide-react';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useCourseStore } from '@/store/courseStore';
import { useCurrentUser } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useActivityStore } from '@/store/activityStore';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import { classNames, relativeTime } from '@/lib/format';

export function TeacherAnnouncementsPage() {
  const items = useAnnouncementStore((s) => s.items);
  const publish = useAnnouncementStore((s) => s.publish);
  const remove = useAnnouncementStore((s) => s.remove);
  const togglePin = useAnnouncementStore((s) => s.togglePin);
  const courses = useCourseStore((s) => s.courses);
  const me = useCurrentUser();
  const pushN = useNotificationStore((s) => s.pushOne);
  const pushA = useActivityStore((s) => s.push);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? 'c-se');
  const [filter, setFilter] = useState('all');

  const filtered = items
    .filter((x) => filter === 'all' || x.courseId === filter)
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  const onPublish = async () => {
    if (!title || !body) return toast.error('请填写标题与正文');
    if (!me) return;
    await api('/announce/publish', () => publish({
      courseId,
      title,
      body,
      authorName: me.name,
      authorColor: me.avatarColor,
    }));
    // 同步到学生通知 + 活动流
    pushN({
      kind: 'announce',
      title: `${me.name}发布课程公告`,
      body: title,
      link: `/app/courses/${courseId}`,
      fromName: me.name,
      fromColor: me.avatarColor,
    });
    pushA({
      kind: 'edit',
      actorName: me.name,
      actorColor: me.avatarColor,
      text: '发布了公告',
      targetLabel: title,
      link: `/app/courses/${courseId}`,
    });
    toast.success('公告已发布，学生消息中心已推送');
    setOpen(false);
    setTitle(''); setBody('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Megaphone className="w-6 h-6 text-brand-600" />课程公告</h1>
          <p className="text-slate-500 text-sm mt-1">发布课程通知；发布后学生消息中心实时收到</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
            <option value="all">全部课程</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => setOpen(true)} className="px-4 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 flex items-center gap-1">
            <Plus className="w-4 h-4" /> 发布公告
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 py-16 text-center text-slate-400">还没有公告</div>
        )}
        {filtered.map((a) => {
          const c = courses.find((x) => x.id === a.courseId);
          return (
            <div key={a.id} className={classNames('bg-white rounded-xl border p-5', a.pinned ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                    <h3 className="font-semibold text-slate-800">{a.title}</h3>
                    <span className="text-xs text-slate-400">{c?.name} · {relativeTime(a.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap">{a.body}</p>
                  <div className="text-xs text-slate-400 mt-2">— {a.authorName}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => togglePin(a.id)} className={classNames('w-8 h-8 rounded-lg flex items-center justify-center', a.pinned ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 text-slate-400')} title={a.pinned ? '取消置顶' : '置顶'}>
                    <Pin className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('删除该公告？')) { remove(a.id); toast.success('公告已删除'); } }} className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center" title="删除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="发布课程公告"
        width={560}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800">取消</button>
            <button onClick={onPublish} className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800">发布</button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-slate-500 mb-1">归属课程</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">公告标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="一句话标题" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">正文（支持换行）</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="公告正文…" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <X className="w-3 h-3" /> 发布后会自动推送到所有相关学生的消息中心
          </div>
        </div>
      </Modal>
    </div>
  );
}
