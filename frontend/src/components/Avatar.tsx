interface AvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-xl',
};

function getInitials(first?: string | null, last?: string | null): string {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (!f && !l) return '?';
  return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || f.charAt(0).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  size = 'sm',
  className = '',
  onClick,
}) => {
  const initials = getInitials(firstName, lastName);
  const base =
    'inline-flex items-center justify-center rounded-full bg-[#CC5500] text-white font-semibold ring-2 ring-white shadow-sm select-none';
  const interactive = onClick ? 'cursor-pointer hover:opacity-90 transition' : '';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Account menu"
        className={`${base} ${sizeClasses[size]} ${interactive} ${className}`.trim()}
      >
        {initials}
      </button>
    );
  }

  return (
    <span className={`${base} ${sizeClasses[size]} ${className}`.trim()}>{initials}</span>
  );
};

export default Avatar;
