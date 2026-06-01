import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';
import { useDocStore } from '@/store/docStore';
import { useCourseStore } from '@/store/courseStore';
import { useCurrentUser } from '@/store/authStore';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import { relativeTime } from '@/lib/format';
import type { Doc } from '@/mocks/docs';

export function DocsListPage() {
  const docs = useDocStore((s) => s.docs);
  const courses = useCourseStore((s) => s.courses);
  const me = useCurrentUser();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? 'c-se');

  const filtered = docs.filter((d) => {
    if (filter !== 'all' && d.courseId !== filter) return false;
    if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!title) return toast.error('请输入文档标题');
    const newDoc: Doc = {
      id: `d-new-${Date.now()}`,
      courseId,
      title,
      version: 'v1.0',
      updatedAt: new Date().toISOString(),
      contentHtml: `<h1>${title}</h1><p>由 ${me?.name ?? '我'} 创建于 ${new Date().toLocaleString('zh-CN')}。开始编辑你的协作文档…</p>`,
      // 新建文档默认沿用需求模板，方便 OnlyOffice 立刻可编辑
      docxPath: '/sample/colea-requirements.docx',
    };
    await api('/docs/create', () => {
      useDocStore.setState((s) => ({ docs: [newDoc, ...s.docs] }));
    });
    toast.success('文档已创建');
    setOpen(false);
    setTitle('');
    nav(`/app/docs/${newDoc.id}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">协作文档</h1>
          <p className="text-slate-500 text-sm mt-1">UC4 · 多人实时文档协作</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索文档…"
              className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
          >
            <option value="all">全部课程</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> 新建文档
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-16 text-center text-slate-400">
          没有匹配的文档
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const c = courses.find((x) => x.id === d.courseId);
            const chars = d.contentHtml.replace(/<[^>]*>/g, '').length;
            return (
              <Link
                key={d.id}
                to={`/app/docs/${d.id}`}
                className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5 card-hover block"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 text-sm truncate">{d.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c?.name} · {d.version}</div>
                    <div className="text-xs text-slate-400 mt-1">{chars} 字 · 更新于 {relativeTime(d.updatedAt)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="新建协作文档"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800">取消</button>
            <button onClick={handleCreate} className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800">创建并打开</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">文档标题</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              placeholder="例如：测试用例汇总 v1.0"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">归属课程</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
