import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile } from '@/types/auth';

interface UserAvatarProps {
  user: UserProfile;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const getInitials = (fullName: string | null, email: string) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback>
        {getInitials(user.full_name, user.email)}
      </AvatarFallback>
    </Avatar>
  );
}