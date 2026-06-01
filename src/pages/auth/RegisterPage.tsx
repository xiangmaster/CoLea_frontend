import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Hash, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import type { Role } from '@/mocks/users';
import { classNames } from '@/lib/format';

export function RegisterPage() {
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [no, setNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const registerUser = useAuthStore((s) => s.registerUser);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !account || !password) return toast.error('请填写完整信息');
    if (password !== confirm) return toast.error('两次密码不一致');
    if (!agree) return toast.error('请先同意用户协议');
    setLoading(true);
    await api('/auth/register', () =>
      registerUser({
        name,
        account,
        password,
        role,
        studentNo: role === 'student' ? no || undefined : undefined,
        staffNo: role === 'teacher' ? no || undefined : undefined,
      }),
    );
    toast.success('注册成功，已自动登录');
    setLoading(false);
    nav(role === 'teacher' ? '/teacher/dashboard' : '/app/dashboard');
  };

  return (
    <div>
      <div className="mb-7">
        <Logo size={36} />
        <h2 className="text-2xl font-bold text-slate-800 mt-6">创建账号</h2>
        <p className="text-sm text-slate-500 mt-1.5">加入 CoLea，与你的小组一起协作</p>
      </div>

      <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
        {(['student', 'teacher'] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={classNames(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
              role === r ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {r === 'student' ? '🎓 学生' : '👩‍🏫 教师'}
          </button>
        ))}
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <Field icon={<UserIcon className="w-4 h-4" />} label="姓名" value={name} onChange={setName} placeholder="请输入姓名" />
        <Field icon={<Mail className="w-4 h-4" />} label="账号 / 邮箱" value={account} onChange={setAccount} placeholder="例如 student@colea" />
        <Field
          icon={<Hash className="w-4 h-4" />}
          label={role === 'teacher' ? '工号' : '学号'}
          value={no}
          onChange={setNo}
          placeholder={role === 'teacher' ? '例如 T2026001' : '例如 2024001'}
        />
        <Field icon={<Lock className="w-4 h-4" />} label="密码" type="password" value={password} onChange={setPassword} placeholder="至少 6 位" />
        <Field icon={<Lock className="w-4 h-4" />} label="确认密码" type="password" value={confirm} onChange={setConfirm} />

        <label className="flex items-start gap-2 text-xs text-slate-500 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 mt-0.5"
          />
          <span>
            我已阅读并同意 <a className="text-brand-600 hover:underline">《CoLea 用户协议》</a> 与{' '}
            <a className="text-brand-600 hover:underline">《隐私政策》</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:from-brand-700 hover:to-blue-800 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? '提交中…' : (
            <>
              注 册 <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        已有账号？{' '}
        <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
          去登录
        </Link>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
        />
      </div>
    </div>
  );
}
