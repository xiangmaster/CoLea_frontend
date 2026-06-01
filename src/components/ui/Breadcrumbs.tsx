import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { classNames } from '@/lib/format';

interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  items: Crumb[];
  /** API 风格端点，紧贴在面包屑下显示 */
  apiPath?: string;
  className?: string;
}

export function Breadcrumbs({ items, apiPath, className }: Props) {
  return (
    <div className={classNames('mb-4', className)}>
      <nav className="flex items-center gap-1 text-xs text-slate-500">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {c.to && !last ? (
                <Link to={c.to} className="hover:text-brand-600 transition">{c.label}</Link>
              ) : (
                <span className={last ? 'text-slate-700 font-medium' : ''}>{c.label}</span>
              )}
              {!last && <ChevronRight className="w-3 h-3 text-slate-300" />}
            </span>
          );
        })}
      </nav>
      {apiPath && (
        <div className="text-[10px] text-slate-400 font-mono mt-1">{apiPath}</div>
      )}
    </div>
  );
}
