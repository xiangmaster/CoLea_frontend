import { useState } from 'react';
import { useCurrentUser } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useCourseStore } from '@/store/courseStore';
import { toast } from '@/store/toastStore';
import { Mail, Hash, GraduationCap, Phone } from 'lucide-react';

export function ProfilePage() {
  const user = useCurrentUser();
  const kpi = useAnalyticsStore((s) => s.kpi);
  const courses = useCourseStore((s) => s.courses);
  const [bio, setBio] = useState('热爱代码与协作，正在认真完成本学期的软件工程项目。');

  if (!user) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-5">
          <Avatar name={user.name} color={user.avatarColor} size={72} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{user.name}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {user.role === 'teacher' ? '教师' : '学生'} · {user.studentNo ?? user.staffNo}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={<Mail className="w-4 h-4" />} label="账号">{user.account}</Field>
          <Field icon={<Hash className="w-4 h-4" />} label={user.role === 'teacher' ? '工号' : '学号'}>{user.studentNo ?? user.staffNo}</Field>
          <Field icon={<GraduationCap className="w-4 h-4" />} label="参与课程">{courses.length} 门</Field>
          <Field icon={<Phone className="w-4 h-4" />} label="联系方式">未填写</Field>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">个人简介</h3>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <Stat label="协作评分" value={kpi.collaborationScore} />
          <Stat label="活跃天数" value={kpi.activeDays} />
          <Stat label="累计提交" value={kpi.totalSubmissions} />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => toast.success('已保存')}
            className="px-5 py-2 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-lg px-4 py-3">
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">{icon} {label}</div>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-brand-50 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-brand-700">{value}</div>
      <div className="text-xs text-brand-500 mt-1">{label}</div>
    </div>
  );
}
