import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';

export function ResetPasswordPage() {
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const nav = useNavigate();

  const sendCode = async () => {
    if (!account) return toast.error('请先输入账号');
    await api('/auth/sendCode', () => null);
    setCodeSent(true);
    toast.success('验证码已发送（演示用：123456）');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return toast.error('请输入验证码');
    if (pwd !== pwd2 || !pwd) return toast.error('两次密码不一致');
    setLoading(true);
    const ok = await api('/auth/resetPassword', () => resetPassword(account, pwd));
    setLoading(false);
    if (!ok) return toast.error('账号不存在');
    toast.success('密码重置成功');
    nav('/login');
  };

  return (
    <div>
      <div className="mb-7">
        <Logo size={36} />
        <h2 className="text-2xl font-bold text-slate-800 mt-6">重置密码</h2>
        <p className="text-sm text-slate-500 mt-1.5">通过验证码找回你的账号</p>
      </div>

      <form className="space-y-3.5" onSubmit={onSubmit}>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">账号</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="邮箱 / 学号 / 工号"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">验证码</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 位验证码"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
              />
            </div>
            <button
              type="button"
              onClick={sendCode}
              className="px-4 py-2.5 rounded-xl text-sm bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium whitespace-nowrap"
            >
              {codeSent ? '重新发送' : '获取验证码'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">新密码</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">确认新密码</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:from-brand-700 hover:to-blue-800 mt-2 disabled:opacity-60 shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
        >
          {loading ? '提交中…' : (
            <>
              确认重置 <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
          ← 返回登录
        </Link>
      </div>
    </div>
  );
}
