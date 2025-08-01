import { Badge } from '@/components/ui/badge';
import { AppRole } from '@/types/auth';

interface RoleBadgeProps {
  role: AppRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getVariant = (role: AppRole) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'director':
        return 'default';
      case 'coordinator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getDisplayName = (role: AppRole) => {
    switch (role) {
      case 'super_admin':
        return 'Супер админ';
      case 'director':
        return 'Директор';
      case 'coordinator':
        return 'Координатор';
      default:
        return role;
    }
  };

  return (
    <Badge variant={getVariant(role)}>
      {getDisplayName(role)}
    </Badge>
  );
}