import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Plus, CheckCircle2, Loader2, Users, ChevronRight } from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { useCourseStore } from '@/store/courseStore';
import { Pill, Tag } from '@/components/ui/Tag';
import { AvatarGroup } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { getAllUsers } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { ROLE_COLOR_MAP } from '@/mocks/groups';
import { classNames } from '@/lib/format';

export function TeacherGroupsPage() {
  const { courseId = 'c-se' } = useParams();
  const groups = useGroupStore((s) => s.groups.filter((g) => g.courseId === courseId));
  const recommendations = useGroupStore((s) => s.recommendations);
  const generating = useGroupStore((s) => s.generating);
  const generate = useGroupStore((s) => s.generate);
  const apply = useGroupStore((s) => s.applyRecommendations);
  const create = useGroupStore((s) => s.createGroup);
  const course = useCourseStore((s) => s.courses.find((c) => c.id === courseId));
  const users = getAllUsers();
  const nav = useNavigate();
  const [algo, setAlgo] = useState('K-Means 互补匹配');
  const [size, setSize] = useState(5);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const totalStudents = users.filter((u) => u.role === 'student' && u.courseIds?.includes(courseId)).length;
  const ungrouped = users.filter((u) =>
    u.role === 'student' &&
    u.courseIds?.includes(courseId) &&
    !groups.some((g) => g.memberIds.includes(u.id)),
  );
  const avgSize = groups.length ? Math.round(groups.reduce((s, g) => s + g.memberIds.length, 0) / groups.length) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">小组管理 · {course?.name}</h1>
          <p className="text-slate-500 text-sm mt-1">查看 / 编辑成员 · 智能互补分组推荐 · 风险监控</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <KpiCell value={totalStudents} label="选课学生" />
        <KpiCell value={groups.length} label="已建小组" color="text-brand-600" />
        <KpiCell value={avgSize} label="平均组员数" color="text-green-600" />
        <KpiCell value={ungrouped.length} label="未分组学生" color={ungrouped.length > 0 ? 'text-orange-600' : 'text-slate-400'} />
        <KpiCell value="87%" label="技能覆盖率" color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">小组列表</h3>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> 创建小组
            </button>
          </div>

          <div className="space-y-3">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => nav(`/teacher/groups/${courseId}/${g.id}`)}
                className="w-full bg-white rounded-2xl shadow-sm border border-slate-100/80 hover:border-brand-200 hover:shadow-md transition p-5 text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800">{g.name}</h4>
                    <Pill color={g.health === 'healthy' ? 'green' : g.health === 'medium' ? 'yellow' : 'red'}>
                      {g.health === 'healthy' ? '健康' : g.health === 'medium' ? '中等' : '预警'}
                    </Pill>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center">
                    管理详情 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <AvatarGroup
                    users={g.memberIds
                      .map((id) => users.find((u) => u.id === id))
                      .filter((u): u is NonNullable<typeof u> => !!u)
                      .map((u) => ({ name: u.name, color: u.avatarColor }))}
                    size={28}
                    max={6}
                  />
                  <div className="flex-1 flex gap-1.5 flex-wrap">
                    {g.roles.map((r, i) => (
                      <Tag key={i} color={r.color as any}>{r.label}</Tag>
                    ))}
                  </div>
                  <div className="text-right text-xs text-slate-400 flex-shrink-0">
                    <div>协作 <strong className="text-slate-700">{g.collaborationScore}</strong></div>
                    <div>活跃 <strong className={g.activity === 'high' ? 'text-green-600' : g.activity === 'medium' ? 'text-yellow-600' : 'text-red-600'}>{{ high: '高', medium: '中', low: '低' }[g.activity]}</strong></div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {ungrouped.length > 0 && (
            <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-800">{ungrouped.length} 位学生尚未分组</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ungrouped.map((u) => (
                  <span key={u.id} className="text-xs px-2 py-1 bg-white rounded-md border border-orange-200 text-slate-600">
                    {u.name} · {u.studentNo}
                  </span>
                ))}
              </div>
              <p className="text-xs text-orange-700 mt-2">建议使用右侧"AI 智能分组"快速分组，或手动添加到现有小组。</p>
            </div>
          )}
        </div>

        <div>
          <div className="bg-gradient-to-br from-brand-50 via-sky-50 to-blue-50 rounded-xl p-6 border border-brand-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-800">AI 智能分组</h4>
                <p className="text-xs text-brand-500">基于技能向量的互补匹配</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">分组算法</label>
                <select value={algo} onChange={(e) => setAlgo(e.target.value)} className="w-full px-3 py-2 bg-white border border-brand-200 rounded-lg text-sm">
                  <option>K-Means 互补匹配</option>
                  <option>随机均匀分组</option>
                  <option>技能优先匹配</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">每组人数</label>
                <input type="number" min={2} max={8} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-brand-200 rounded-lg text-sm" />
              </div>
            </div>

            <button
              disabled={generating}
              onClick={() => generate({ algorithm: algo, sizePerGroup: size, courseId })}
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? '正在计算最优分组…' : '生成推荐方案'}
            </button>

            {recommendations.length > 0 && (
              <div className="mt-5 pt-5 border-t border-brand-200">
                <h5 className="text-sm font-semibold text-brand-800 mb-3">推荐方案预览</h5>
                <div className="space-y-2">
                  {recommendations.map((r, i) => (
                    <div key={r.id} className="bg-white rounded-lg p-3 border border-brand-100">
                      <div className="text-xs font-medium text-slate-700 mb-1">推荐组 {i + 1}</div>
                      <div className="flex gap-1 flex-wrap">
                        {r.rolesSummary.map((role, idx) => (
                          <span key={idx} className={classNames('px-1.5 py-0.5 rounded text-xs', ROLE_COLOR_MAP[Object.keys(ROLE_COLOR_MAP)[idx % 5]] ?? 'bg-slate-50 text-slate-600')}>
                            {role}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-green-600 mt-1">互补度: {r.complementarity}%</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { apply(courseId); toast.success('已应用推荐方案'); }}
                  className="w-full mt-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200 hover:bg-green-100 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 确认并应用方案
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="创建小组"
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800">取消</button>
            <button
              onClick={() => {
                if (!newName) return toast.error('请填写组名');
                create({
                  courseId,
                  name: newName,
                  memberIds: [],
                  roles: [],
                  collaborationScore: 80,
                  activity: 'medium',
                  health: 'medium',
                });
                toast.success('小组已创建');
                setNewName('');
                setCreateOpen(false);
              }}
              className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800"
            >创建</button>
          </>
        }
      >
        <label className="block text-xs text-slate-500 mb-1">小组名称</label>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="例如：Epsilon 组"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </Modal>
    </div>
  );
}

function KpiCell({ value, label, color = 'text-slate-800' }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

