import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import type { Role } from '@/mocks/users';
import { classNames } from '@/lib/format';

export function LoginPage() {
  const [role, setRole] = useState<Role>('student');
  const [account, setAccount] = useState('student@colea');
  const [password, setPassword] = useState('123456');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.loginByAccount);
  const failedAttempts = useAuthStore((s) => s.failedAttempts);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api('/auth/login', () => login(account, password, role));
      if (!user) {
        setError('账号或密码错误，请检查后重试');
        toast.error('登录失败');
        return;
      }
      toast.success(`欢迎回来，${user.name}`);
      nav(user.role === 'teacher' ? '/teacher/dashboard' : '/app/dashboard');
    } catch {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const setSampleAccount = (r: Role) => {
    setRole(r);
    if (r === 'teacher') {
      setAccount('teacher@colea');
      setPassword('123456');
    } else {
      setAccount('student@colea');
      setPassword('123456');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Logo size={36} />
        <h2 className="text-2xl font-bold text-slate-800 mt-6">欢迎回来 👋</h2>
        <p className="text-sm text-slate-500 mt-1.5">登录你的账号，继续与小组协作</p>
      </div>

      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        {(['student', 'teacher'] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSampleAccount(r)}
            className={classNames(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
              role === r ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {r === 'student' ? '🎓 学生' : '👩‍🏫 教师'}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            {role === 'teacher' ? '账号 / 工号' : '账号 / 学号'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
              placeholder="请输入登录标识符"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">密码</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
              placeholder="请输入密码"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            记住我
          </label>
          <Link to="/reset-password" className="text-brand-600 hover:text-brand-700 font-medium">
            忘记密码？
          </Link>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:from-brand-700 hover:to-blue-800 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>登录中…</>
          ) : (
            <>
              登 录 <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 text-center text-sm text-slate-500">
        还没有账号？{' '}
        <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">
          立即注册
        </Link>
      </div>
      <div className="mt-4 text-center text-[11px] text-slate-400">
        {failedAttempts > 0 && failedAttempts < 5 && <span>已失败 {failedAttempts} 次 · </span>}
        连续 5 次密码错误将锁定账户 15 分钟
      </div>
    </div>
  );
}
