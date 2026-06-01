import { Outlet } from 'react-router-dom';
import { AuthHero } from '@/components/auth/AuthHero';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* 左侧：插画 + 标语 */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <AuthHero />
      </div>
      {/* 右侧：表单 */}
      <div className="flex-1 lg:flex-none lg:w-[500px] flex items-center justify-center px-6 py-10 bg-white relative">
        {/* 移动端顶部小渐变装饰 */}
        <div className="lg:hidden absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
        <div className="relative w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
