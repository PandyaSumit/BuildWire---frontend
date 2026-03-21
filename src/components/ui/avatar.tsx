export interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  src?: string;
  alt?: string;
  showStatus?: boolean;
  statusType?: 'online' | 'offline' | 'away';
  className?: string;
}

export function Avatar({ 
  size = 'md', 
  name, 
  src, 
  alt, 
  showStatus = false,
  statusType = 'offline',
  className = '', 
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-muted',
    away: 'bg-warning',
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeValues = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          width={sizeValues[size]}
          height={sizeValues[size]}
          className={`${sizes[size]} rounded-full object-cover border border-border ${className}`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-brand-light border border-border flex items-center justify-center font-medium text-brand ${className}`}
        >
          {name ? getInitials(name) : '?'}
        </div>
      )}
      
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[statusType]} rounded-full border-2 border-bg`}
        />
      )}
    </div>
  );
}
