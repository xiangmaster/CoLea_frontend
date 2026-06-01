import { classNames } from '@/lib/format';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 40, showText = true, className }: LogoProps) {
  return (
    <div className={classNames('inline-flex items-center gap-2', className)}>
      <div
        className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white"
        style={{ width: size, height: size }}
      >
        <svg className="w-3/5 h-3/5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      {showText && <span className="text-xl font-bold text-slate-800">CoLea</span>}
    </div>
  );
}
