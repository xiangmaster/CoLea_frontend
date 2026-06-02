import { useParams } from 'react-router-dom';
import { Users, TrendingUp, Activity, Award, Crown, Layers } from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { Pill, Tag } from '@/components/ui/Tag';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { getAllUsers, useCurrentUser } from '@/store/authStore';
import { Radar } from '@/components/charts/Radar';
import { classNames } from '@/lib/format';
import { useMemo } from 'react';

const DIMENSIONS = ['资料检索', '内容创作', '协作沟通', '分析归纳', '汇报展示'];

interface Props {
  courseId?: string;
  embedded?: boolean;
}

export function GroupsPage({ courseId = 'c-se', embedded }: Props) {
  const params = useParams();
  const cid = params.courseId ?? courseId;
  const groups = useGroupStore((s) => s.groups.filter((g) => g.courseId === cid));
  const users = getAllUsers();
  const me = useCurrentUser();

  const myGroup = groups.find((g) => me && g.memberIds.includes(me.id));
  const otherGroups = groups.filter((g) => g.id !== myGroup?.id);

  const myMembers = useMemo(
    () =>
      myGroup
        ? myGroup.memberIds
            .map((id) => users.find((u) => u.id === id))
            .filter((u): u is NonNullable<typeof u> => !!u)
        : [],
    [myGroup, users],
  );

  const myRadar = useMemo(() => {
    if (!myGroup || !myMembers.length) return [];
    const sum = [0, 0, 0, 0, 0];
    myMembers.forEach((m) => {
      const s = m.skills ?? [0, 0, 0, 0, 0];
      for (let i = 0; i < 5; i++) sum[i] += s[i] * 100;
    });
    return DIMENSIONS.map((axis, i) => ({ axis, value: Math.round(sum[i] / myMembers.length) }));
  }, [myGroup, myMembers]);

  return (
    <div className={classNames(!embedded && 'p-8 max-w-7xl mx-auto')}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">我的小组</h1>
          <p className="text-slate-500 text-sm mt-1">UC8 · 查看你所在小组和课程内其他小组</p>
        </div>
      )}

      {/* 我的小组 */}
      {myGroup ? (
        <div className="bg-gradient-to-br from-brand-50 via-white to-sky-50 rounded-2xl border border-brand-100 p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">我的小组</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{myGroup.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{myMembers.length} 位成员 · 协作评分 {myGroup.collaborationScore}</p>
              </div>
              <Pill color={myGroup.health === 'healthy' ? 'green' : myGroup.health === 'medium' ? 'yellow' : 'red'}>
                {myGroup.health === 'healthy' ? '健康' : myGroup.health === 'medium' ? '中等' : '预警'}
              </Pill>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Metric icon={<TrendingUp className="w-4 h-4 text-green-500" />} label="协作评分" value={myGroup.collaborationScore} />
              <Metric icon={<Activity className="w-4 h-4 text-brand-600" />} label="活跃度" value={{ high: '高', medium: '中', low: '低' }[myGroup.activity]} />
              <Metric icon={<Award className="w-4 h-4 text-amber-500" />} label="组员数" value={myMembers.length} />
              <Metric icon={<Layers className="w-4 h-4 text-purple-500" />} label="当前阶段" value={myGroup.stage ?? '—'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 成员列表 */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">小组成员</h3>
                <div className="space-y-2">
                  {myMembers.map((m) => {
                    const isMe = m.id === me?.id;
                    return (
                      <div
                        key={m.id}
                        className={classNames(
                          'flex items-center gap-3 p-3 rounded-xl border',
                          isMe ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-100',
                        )}
                      >
                        <Avatar name={m.name} color={m.avatarColor} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                            {m.name}
                            {isMe && <Pill color="blue">我</Pill>}
                          </div>
                          <div className="text-xs text-slate-400">{m.studentNo} · {m.account}</div>
                        </div>
                        <Tag color="slate">{m.skills ? DIMENSIONS[m.skills.indexOf(Math.max(...m.skills))] : '—'}</Tag>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 雷达图 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">小组能力雷达</h3>
                <div className="bg-white rounded-xl border border-slate-100 p-3">
                  {myRadar.length > 0 ? <Radar data={myRadar} height={200} /> : <div className="text-xs text-slate-400 text-center py-12">无数据</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-800">你还没有加入该课程的小组</div>
            <p className="text-xs text-amber-700 mt-1">教师会根据 AI 互补分组算法把你分配到合适的小组，或你可以在确认分组方案后等候通知。</p>
          </div>
        </div>
      )}

      {/* 课程内其他小组 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">课程内其他小组</h3>
        <span className="text-xs text-slate-400">{otherGroups.length} 个</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherGroups.map((g) => {
          const hours = g.lastActiveHoursAgo ?? 24;
          const lastActiveText =
            hours < 1 ? '刚刚有人活动' : hours < 24 ? `${Math.round(hours)} 小时前` : `${Math.round(hours / 24)} 天前`;
          return (
            <div key={g.id} className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">{g.name}</h4>
                <Pill color={g.health === 'healthy' ? 'green' : g.health === 'medium' ? 'yellow' : 'red'}>
                  {g.health === 'healthy' ? '健康' : g.health === 'medium' ? '中等' : '预警'}
                </Pill>
              </div>
              <div className="mb-3">
                <AvatarGroup
                  users={g.memberIds
                    .map((id) => users.find((u) => u.id === id))
                    .filter((u): u is NonNullable<typeof u> => !!u)
                    .map((u) => ({ name: u.name, color: u.avatarColor }))}
                  size={28}
                  max={5}
                />
              </div>
              {g.stage && (
                <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> 当前阶段：{g.stage}
                  {typeof g.progress === 'number' && (
                    <span className="ml-1">· 进度 {g.progress}%</span>
                  )}
                </div>
              )}
              {g.recentHighlight && (
                <div className="text-xs text-slate-500 mb-3 line-clamp-1 italic">"{g.recentHighlight}"</div>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span>协作评分 <strong className="text-slate-700">{g.collaborationScore}</strong></span>
                <span>·</span>
                <span>提交 <strong className="text-slate-700">{g.totalSubmissions ?? '—'}</strong> 次</span>
                <span>·</span>
                <span>上次活动 <strong className={hours < 24 ? 'text-emerald-600' : hours < 72 ? 'text-amber-600' : 'text-red-500'}>{lastActiveText}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-100/80">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">{icon} {label}</div>
      <div className="text-lg font-bold text-slate-800 mt-1">{value}</div>
    </div>
  );
}
