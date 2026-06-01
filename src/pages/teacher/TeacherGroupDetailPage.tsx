import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  Trash2,
  Edit3,
  Activity,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { useCourseStore } from '@/store/courseStore';
import { getAllUsers } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Pill, Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { Radar } from '@/components/charts/Radar';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import { classNames } from '@/lib/format';

const SKILL_LABELS = ['前端', '后端', '设计', 'PM', '测试'];

function inferRole(skills?: [number, number, number, number, number]): string {
  if (!skills) return '未知';
  let maxI = 0;
  for (let i = 1; i < skills.length; i++) if (skills[i] > skills[maxI]) maxI = i;
  return SKILL_LABELS[maxI];
}

export function TeacherGroupDetailPage() {
  const { courseId = 'c-se', groupId = '' } = useParams();
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const allGroups = useGroupStore((s) => s.groups);
  const removeMember = useGroupStore((s) => s.removeMember);
  const addMember = useGroupStore((s) => s.addMember);
  const moveMember = useGroupStore((s) => s.moveMember);
  const updateGroup = useGroupStore((s) => s.updateGroup);
  const deleteGroup = useGroupStore((s) => s.deleteGroup);
  const course = useCourseStore((s) => s.courses.find((c) => c.id === courseId));
  const users = getAllUsers();
  const nav = useNavigate();

  const [addOpen, setAddOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ userId: string; userName: string } | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(group?.name ?? '');

  if (!group) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Link to={`/teacher/groups/${courseId}`} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 返回小组列表
        </Link>
        <div className="mt-6 bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400">小组不存在或已被删除</div>
      </div>
    );
  }

  const members = group.memberIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u);

  const candidates = users.filter(
    (u) => u.role === 'student' && u.courseIds?.includes(courseId) && !group.memberIds.includes(u.id),
  );

  const otherGroups = allGroups.filter((g) => g.courseId === courseId && g.id !== groupId);

  const radarData = useMemo(() => {
    const sum = [0, 0, 0, 0, 0];
    members.forEach((m) => {
      const s = m.skills ?? [0, 0, 0, 0, 0];
      for (let i = 0; i < 5; i++) sum[i] += s[i] * 100;
    });
    const n = Math.max(1, members.length);
    return SKILL_LABELS.map((axis, i) => ({ axis, value: Math.round(sum[i] / n) }));
  }, [members]);

  const roleDistribution = useMemo(() => {
    const cnt: Record<string, number> = {};
    members.forEach((m) => {
      const r = inferRole(m.skills);
      cnt[r] = (cnt[r] ?? 0) + 1;
    });
    return Object.entries(cnt);
  }, [members]);

  const handleRemove = async (userId: string, userName: string) => {
    if (!confirm(`确认将 ${userName} 移出 ${group.name}？`)) return;
    await api(`/groups/${groupId}/removeMember`, () => removeMember(groupId, userId));
    toast.success(`${userName} 已从 ${group.name} 移出`);
  };

  const handleAdd = async (userId: string, userName: string) => {
    await api(`/groups/${groupId}/addMember`, () => addMember(groupId, userId));
    toast.success(`${userName} 已加入 ${group.name}`);
  };

  const handleMove = async (userId: string, userName: string, toGroupId: string) => {
    const dst = otherGroups.find((g) => g.id === toGroupId);
    if (!dst) return;
    await api(`/groups/move`, () => moveMember(userId, groupId, toGroupId));
    setMoveTarget(null);
    toast.success(`${userName} 已转入 ${dst.name}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <Link to={`/teacher/groups/${courseId}`} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 返回小组列表
        </Link>
        <div className="text-xs text-slate-400">{course?.name}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{group.name}</h1>
              <Pill color={group.health === 'healthy' ? 'green' : group.health === 'medium' ? 'yellow' : 'red'}>
                {group.health === 'healthy' ? '健康' : group.health === 'medium' ? '中等' : '预警'}
              </Pill>
              <button onClick={() => { setNewName(group.name); setRenameOpen(true); }} className="text-slate-400 hover:text-brand-600">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-500">{members.length} 位成员 · 协作评分 {group.collaborationScore}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" /> 添加成员
            </button>
            <button
              onClick={() => {
                if (!confirm(`确认解散 ${group.name}？此操作不可恢复，成员将变为未分组状态。`)) return;
                deleteGroup(group.id);
                toast.success('小组已解散');
                nav(`/teacher/groups/${courseId}`);
              }}
              className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> 解散小组
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={<TrendingUp className="w-4 h-4 text-green-500" />} label="协作评分" value={group.collaborationScore} bg="bg-green-50" />
          <Metric icon={<Activity className="w-4 h-4 text-brand-600" />} label="活跃度" value={{ high: '高', medium: '中', low: '低' }[group.activity]} bg="bg-brand-50" />
          <Metric icon={<Award className="w-4 h-4 text-amber-500" />} label="角色齐全度" value={`${Math.round((roleDistribution.length / 5) * 100)}%`} bg="bg-amber-50" />
          <Metric icon={<UserPlus className="w-4 h-4 text-purple-500" />} label="成员数" value={`${members.length} / 6`} bg="bg-purple-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800 flex items-center justify-between">
            <span>成员列表</span>
            <span className="text-xs text-slate-400 font-normal">{members.length} 人</span>
          </div>
          {members.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">还没有成员，点右上"添加成员"开始</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium">成员</th>
                  <th className="px-5 py-3 font-medium">学号</th>
                  <th className="px-5 py-3 font-medium">主导角色</th>
                  <th className="px-5 py-3 font-medium">技能向量</th>
                  <th className="px-5 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const skills = m.skills ?? [0.5, 0.5, 0.5, 0.5, 0.5];
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} color={m.avatarColor} size={32} />
                          <div>
                            <div className="font-medium text-slate-800">{m.name}</div>
                            <div className="text-xs text-slate-400">{m.account}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{m.studentNo}</td>
                      <td className="px-5 py-3">
                        <Tag color={['blue', 'green', 'purple', 'orange', 'cyan'][SKILL_LABELS.indexOf(inferRole(m.skills))] as any}>
                          {inferRole(m.skills)}
                        </Tag>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-0.5">
                          {skills.map((v, i) => (
                            <div key={i} className="w-5" title={`${SKILL_LABELS[i]} ${Math.round(v * 100)}`}>
                              <div className="h-8 bg-slate-100 rounded relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 bg-brand-500" style={{ height: `${v * 100}%` }} />
                              </div>
                              <div className="text-[9px] text-slate-400 text-center mt-0.5">{SKILL_LABELS[i][0]}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setMoveTarget({ userId: m.id, userName: m.name })}
                            className="text-xs px-2 py-1 text-brand-600 hover:bg-brand-50 rounded flex items-center gap-1"
                            disabled={otherGroups.length === 0}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> 转组
                          </button>
                          <button
                            onClick={() => handleRemove(m.id, m.name)}
                            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded flex items-center gap-1"
                          >
                            <UserMinus className="w-3.5 h-3.5" /> 移除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">小组能力雷达</h3>
            {members.length > 0 ? <Radar data={radarData} height={220} /> : <div className="text-xs text-slate-400 text-center py-12">无数据</div>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">角色分布</h3>
            {roleDistribution.length === 0 ? (
              <div className="text-xs text-slate-400">暂无</div>
            ) : (
              <div className="space-y-2">
                {roleDistribution.map(([role, n]) => (
                  <div key={role} className="flex items-center justify-between">
                    <Tag color={['blue', 'green', 'purple', 'orange', 'cyan'][SKILL_LABELS.indexOf(role)] as any}>{role}</Tag>
                    <span className="text-sm text-slate-700">{n} 人</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加成员 */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`添加成员到 ${group.name}`}
        width={500}
      >
        {candidates.length === 0 ? (
          <div className="text-sm text-slate-400 py-6 text-center">本课程内没有可添加的学生</div>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto -mx-1 px-1">
            {candidates.map((u) => {
              const inOther = allGroups.find((g) => g.id !== groupId && g.memberIds.includes(u.id));
              return (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <Avatar name={u.name} color={u.avatarColor} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800">{u.name}</div>
                    <div className="text-xs text-slate-400">
                      {u.studentNo} · {inOther ? `当前在 ${inOther.name}` : '未分组'}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (inOther) {
                        await api('/groups/move', () => moveMember(u.id, inOther.id, groupId));
                        toast.success(`${u.name} 已从 ${inOther.name} 转入 ${group.name}`);
                      } else {
                        await handleAdd(u.id, u.name);
                      }
                    }}
                    className={classNames(
                      'text-xs px-3 py-1.5 rounded-lg font-medium',
                      inOther ? 'border border-brand-200 text-brand-700 hover:bg-brand-50' : 'bg-brand-600 text-white hover:from-brand-700 hover:to-blue-800',
                    )}
                  >
                    {inOther ? '转入' : '+ 添加'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* 转组 */}
      <Modal
        open={!!moveTarget}
        onClose={() => setMoveTarget(null)}
        title={`将 ${moveTarget?.userName} 转到…`}
        width={420}
      >
        <div className="space-y-2">
          {otherGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => moveTarget && handleMove(moveTarget.userId, moveTarget.userName, g.id)}
              className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition text-left"
            >
              <div>
                <div className="text-sm font-medium text-slate-800">{g.name}</div>
                <div className="text-xs text-slate-400">{g.memberIds.length} 位成员 · 协作评分 {g.collaborationScore}</div>
              </div>
              <Pill color={g.health === 'healthy' ? 'green' : g.health === 'medium' ? 'yellow' : 'red'}>
                {g.health === 'healthy' ? '健康' : g.health === 'medium' ? '中等' : '预警'}
              </Pill>
            </button>
          ))}
        </div>
      </Modal>

      {/* 重命名 */}
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="重命名小组"
        footer={
          <>
            <button onClick={() => setRenameOpen(false)} className="px-3 py-1.5 text-sm text-slate-600">取消</button>
            <button
              onClick={() => {
                if (!newName.trim()) return toast.error('请输入名称');
                updateGroup(group.id, { name: newName.trim() });
                toast.success('已更新组名');
                setRenameOpen(false);
              }}
              className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800"
            >保存</button>
          </>
        }
      >
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </Modal>
    </div>
  );
}

function Metric({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className={`${bg} rounded-lg p-3`}>
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className="text-lg font-bold text-slate-800 mt-1">{value}</div>
    </div>
  );
}
