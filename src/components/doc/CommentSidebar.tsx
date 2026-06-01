import { useState } from 'react';
import { useDocStore } from '@/store/docStore';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Tag';
import { relativeTime, classNames } from '@/lib/format';
import { useCurrentUser } from '@/store/authStore';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  docId: string;
  selectedText: string;
  onClearSelection?: () => void;
}

export function CommentSidebar({ docId, selectedText, onClearSelection }: Props) {
  const comments = useDocStore((s) => s.comments.filter((c) => c.docId === docId));
  const addComment = useDocStore((s) => s.addComment);
  const addReply = useDocStore((s) => s.addReply);
  const resolve = useDocStore((s) => s.resolveComment);
  const me = useCurrentUser();
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const submit = () => {
    if (!draft || !me) return;
    addComment({
      docId,
      authorId: me.id,
      authorName: me.name,
      authorColor: me.avatarColor,
      body: draft,
      quotedText: selectedText || undefined,
    });
    setDraft('');
    onClearSelection?.();
  };

  return (
    <div className="w-[300px] border-l border-slate-100 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-slate-700">评论 ({comments.length})</h4>

      <div className="bg-white rounded-lg p-3 border border-brand-100 shadow-sm">
        {selectedText && (
          <div className="text-xs text-slate-500 mb-2 bg-yellow-50 border-l-2 border-yellow-300 pl-2 py-1 italic line-clamp-2">
            "{selectedText.slice(0, 80)}{selectedText.length > 80 && '…'}"
          </div>
        )}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={selectedText ? '对选中的内容评论…' : '添加评论（先在正文选中文本可定位）'}
          rows={2}
          className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <div className="flex justify-end gap-1 mt-2">
          <button onClick={() => { setDraft(''); onClearSelection?.(); }} className="text-xs px-2 py-1 text-slate-500 hover:text-slate-700">
            取消
          </button>
          <button
            onClick={submit}
            disabled={!draft}
            className="text-xs px-3 py-1 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50"
          >
            评论
          </button>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {comments.map((c) => (
          <div
            key={c.id}
            className={classNames(
              'bg-white rounded-lg p-3 shadow-sm border',
              c.resolved ? 'border-green-200 opacity-70' : 'border-slate-100',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Avatar name={c.authorName} color={c.authorColor} size={22} />
              <span className="text-xs font-medium text-slate-700">{c.authorName}</span>
              <span className="text-xs text-slate-400 ml-auto">{relativeTime(c.createdAt)}</span>
              {c.resolved && <Pill color="green">已解决</Pill>}
            </div>
            {c.quotedText && (
              <div className="text-xs text-slate-400 mb-1 bg-slate-50 px-2 py-1 rounded border-l-2 border-slate-200">
                "{c.quotedText.slice(0, 60)}{c.quotedText.length > 60 && '…'}"
              </div>
            )}
            <p className={classNames('text-xs', c.resolved ? 'text-slate-400 line-through' : 'text-slate-600')}>{c.body}</p>

            {c.replies?.map((r) => (
              <div key={r.id} className="mt-2 bg-slate-50 rounded p-2 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Avatar name={r.authorName} color="bg-blue-500" size={18} />
                  <span className="text-xs text-slate-600">{r.authorName}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{relativeTime(r.createdAt)}</span>
                </div>
                <div className="text-xs text-slate-600">{r.body}</div>
              </div>
            ))}

            {!c.resolved && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  回复
                </button>
                <button
                  onClick={() => resolve(c.id)}
                  className="text-xs text-slate-400 hover:text-green-600 flex items-center gap-0.5"
                >
                  <CheckCircle2 className="w-3 h-3" /> 标记已解决
                </button>
              </div>
            )}

            {replyTo === c.id && (
              <div className="mt-2 flex gap-1">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="回复…"
                  className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded"
                />
                <button
                  onClick={() => {
                    if (!replyText || !me) return;
                    addReply(c.id, { authorId: me.id, authorName: me.name, body: replyText });
                    setReplyText('');
                    setReplyTo(null);
                  }}
                  className="text-xs px-2 py-1 bg-brand-600 text-white rounded"
                >
                  发送
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
