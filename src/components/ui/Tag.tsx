import { type ReactNode } from 'react';
import { classNames } from '@/lib/format';

interface TagProps {
  children: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'slate' | 'yellow';
  className?: string;
}

const MAP = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  slate: 'bg-slate-100 text-slate-600',
  yellow: 'bg-yellow-50 text-yellow-700',
};

export function Tag({ children, color = 'slate', className }: TagProps) {
  return (
    <span className={classNames('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', MAP[color], className)}>
      {children}
    </span>
  );
}

interface PillProps extends TagProps {}

export function Pill({ children, color = 'slate', className }: PillProps) {
  return (
    <span className={classNames('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', MAP[color], className)}>
      {children}
    </span>
  );
}
