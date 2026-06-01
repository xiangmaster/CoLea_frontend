import { classNames, initialOf } from '@/lib/format';

interface AvatarProps {
  name: string;
  color?: string; // tailwind bg class
  size?: number;
  online?: boolean;
  ring?: boolean;
  className?: string;
}

export function Avatar({ name, color = 'bg-slate-500', size = 32, online, ring, className }: AvatarProps) {
  return (
    <div
      className={classNames(
        'rounded-full flex items-center justify-center text-white font-medium relative flex-shrink-0',
        color,
        ring && 'border-2 border-white',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.4) }}
      title={name}
    >
      {initialOf(name)}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{ name: string; color: string }>;
  max?: number;
  size?: number;
}

export function AvatarGroup({ users, max = 4, size = 28 }: AvatarGroupProps) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <Avatar key={i} name={u.name} color={u.color} size={size} ring />
      ))}
      {rest > 0 && (
        <div
          className="bg-slate-300 rounded-full border-2 border-white flex items-center justify-center text-xs text-slate-600 font-medium"
          style={{ width: size, height: size }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
