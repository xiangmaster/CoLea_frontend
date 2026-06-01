import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Tag';
import { getAllUsers } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useActivityStore } from '@/store/activityStore';
import { toast } from '@/store/toastStore';
import { Search, Check } from 'lucide-react';
import { classNames } from '@/lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  docId: string;
  docTitle: string;
}

export function InviteCollaboratorModal({ open, onClose, docId, docTitle }: Props) {
  const users = getAllUsers().filter((u) => u.role === 'student');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<'edit' | 'comment' | 'view'>('edit');
  const pushN = useNotificationStore((s) => s.pushOne);
  const pushA = useActivityStore((s) => s.push);

  const filtered = useMemo(() => {
    const kw = q.toLowerCase();
    if (!kw) return users;
    return users.filter((u) => `${u.name} ${u.studentNo ?? ''} ${u.account}`.toLowerCase().includes(kw));
  }, [q, users]);

  const toggle = (id: string) => {
    const next = new Set(picked);
    next.has(id) ? next.delete(id) : next.add(id);
    setPicked(next);
  };

  const send = () => {
    if (picked.size === 0) return toast.error('请至少选择一位协作者');
    picked.forEach((uid) => {
      const u = users.find((x) => x.id === uid);
      if (!u) return;
      pushN({
        kind: 'doc',
        title: `你被邀请协作 ${docTitle}`,
        body: `权限：${{ edit: '可编辑', comment: '可评论', view: '可查看' }[permission]}`,
        link: `/app/docs/${docId}`,
      });
    });
    pushA({
      kind: 'edit',
      actorName: '我',
      actorColor: 'bg-brand-600',
      text: `邀请 ${picked.size} 位协作者加入`,
      targetLabel: docTitle,
      link: `/app/docs/${docId}`,
    });
    toast.success(`已发送 ${picked.size} 份邀请`);
    setPicked(new Set());
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="邀请协作者"
      width={520}
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-slate-600">取消</button>
          <button onClick={send} className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800">
            发送邀请 {picked.size > 0 && `(${picked.size})`}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索用户名 / 学号 / 邮箱"
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="edit">可编辑</option>
            <option value="comment">可评论</option>
            <option value="view">可查看</option>
          </select>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1 -mx-1 px-1">
          {filtered.map((u) => {
            const on = picked.has(u.id);
            return (
              <button
                key={u.id}
                onClick={() => toggle(u.id)}
                className={classNames(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition',
                  on ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent',
                )}
              >
                <Avatar name={u.name} color={u.avatarColor} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.studentNo} · {u.account}</div>
                </div>
                {on ? (
                  <Pill color="blue"><Check className="inline w-3 h-3 mr-0.5" /> 已选</Pill>
                ) : (
                  <span className="text-xs text-slate-400">点击选择</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
