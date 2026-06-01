import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText, History, ArrowLeft, UserPlus, Save, MessageSquare } from 'lucide-react';
import { useDocStore } from '@/store/docStore';
import { CommentSidebar } from '@/components/doc/CommentSidebar';
import { VersionHistoryDrawer } from '@/components/doc/VersionHistoryDrawer';
import { InviteCollaboratorModal } from '@/components/doc/InviteCollaboratorModal';
import { OnlyOfficeEditor } from '@/components/doc/OnlyOfficeEditor';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useCurrentUser } from '@/store/authStore';
import { useActivityStore } from '@/store/activityStore';
import { relativeTime } from '@/lib/format';
import { toast } from '@/store/toastStore';

const ONLINE_USERS = [
  { name: '张同学', color: 'bg-blue-500' },
  { name: '李同学', color: 'bg-green-500' },
  { name: '王同学', color: 'bg-purple-500' },
];

export function DocEditorPage() {
  const { docId = 'd-req-v2' } = useParams();
  const doc = useDocStore((s) => s.docs.find((d) => d.id === docId));
  const snapshot = useDocStore((s) => s.snapshotVersion);
  const comments = useDocStore((s) => s.comments.filter((c) => c.docId === docId));
  const pushA = useActivityStore((s) => s.push);
  const me = useCurrentUser();
  const [versionOpen, setVersionOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saveVerOpen, setSaveVerOpen] = useState(false);
  const [verSummary, setVerSummary] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [lastSavedTs] = useState<number>(Date.now() - 120_000);
  const [, force] = useState(0);

  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  const stats = useMemo(() => {
    if (!doc) return { chars: 0, hanCount: 0, wordCount: 0, eta: 1 };
    const text = doc.contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const chars = text.length;
    const hanCount = (text.match(/[一-龥]/g) ?? []).length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return { chars, hanCount, wordCount, eta: Math.max(1, Math.ceil(chars / 300)) };
  }, [doc]);

  if (!doc) return <div className="p-8 text-slate-500">文档不存在</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/app/docs" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 返回文档列表
        </Link>
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
          <span>{stats.chars} 字符</span>
          <span>·</span>
          <span>{stats.hanCount} 汉字</span>
          <span>·</span>
          <span>约 {stats.eta} 分钟阅读</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                {doc.title}
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                  {(doc.fileType ?? 'docx').toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                由 OnlyOffice Document Server 托管 · 实时协同 · 上次保存 {relativeTime(lastSavedTs)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex -space-x-2">
              {ONLINE_USERS.map((u, i) => (
                <Avatar key={i} name={u.name} color={u.color} size={28} online ring />
              ))}
            </div>
            <span className="text-xs text-slate-400">{ONLINE_USERS.length} 人在线编辑</span>
            <button
              onClick={() => setCommentsOpen((v) => !v)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" /> 评论 ({comments.length})
            </button>
            <button
              onClick={() => setInviteOpen(true)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> 邀请协作
            </button>
            <button
              onClick={() => setVersionOpen(true)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" /> 版本历史
            </button>
            <button
              onClick={() => setSaveVerOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-xs font-medium hover:from-brand-700 hover:to-blue-800 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" /> 保存版本
            </button>
          </div>
        </div>

        <div className="flex" style={{ height: 'calc(100vh - 230px)', minHeight: 560 }}>
          <div className="flex-1 min-w-0">
            <OnlyOfficeEditor
              docId={doc.id}
              docTitle={doc.title}
              docxPath={doc.docxPath}
              fileType={doc.fileType}
              userId={me?.id ?? 'anon'}
              userName={me?.name ?? '匿名'}
            />
          </div>
          {commentsOpen && (
            <CommentSidebar docId={doc.id} selectedText="" onClearSelection={() => {}} />
          )}
        </div>

        <div className="px-5 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              已与 OnlyOffice DS 连接
            </span>
            <span>·</span>
            <span>{doc.docxPath}</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">doc/{doc.id}</div>
        </div>
      </div>

      <VersionHistoryDrawer docId={doc.id} open={versionOpen} onClose={() => setVersionOpen(false)} />
      <InviteCollaboratorModal open={inviteOpen} onClose={() => setInviteOpen(false)} docId={doc.id} docTitle={doc.title} />

      <Modal
        open={saveVerOpen}
        onClose={() => setSaveVerOpen(false)}
        title="保存为新版本"
        footer={
          <>
            <button onClick={() => setSaveVerOpen(false)} className="px-3 py-1.5 text-sm text-slate-600">取消</button>
            <button
              onClick={() => {
                snapshot({ docId: doc.id, authorName: me?.name ?? '我', summary: verSummary || '手动保存的快照' });
                pushA({ kind: 'edit', actorName: me?.name ?? '我', actorColor: me?.avatarColor ?? 'bg-brand-600', text: '保存了新版本', targetLabel: doc.title });
                toast.success('已创建新版本');
                setVerSummary('');
                setSaveVerOpen(false);
              }}
              className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800"
            >确认保存</button>
          </>
        }
      >
        <label className="block text-xs text-slate-500 mb-1">这次版本做了什么？（可选）</label>
        <input
          value={verSummary}
          onChange={(e) => setVerSummary(e.target.value)}
          placeholder="例如：补充 UC3 状态机说明"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </Modal>
    </div>
  );
}
