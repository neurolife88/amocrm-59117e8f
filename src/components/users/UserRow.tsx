import { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { UserProfile, AppRole } from '@/types/auth';
import { RoleBadge } from '@/components/common/RoleBadge';
import { UserAvatar } from '@/components/common/UserAvatar';

interface UserRowProps {
  user: UserProfile;
  onUpdateRole: (userId: string, newRole: string, clinicName?: string) => void;
  onDeleteUser: (user: UserProfile) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  canDelete: boolean;
}

export function UserRow({ 
  user, 
  onUpdateRole, 
  onDeleteUser, 
  isUpdating, 
  isDeleting, 
  canDelete 
}: UserRowProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole>(user.role);
  const [clinicName, setClinicName] = useState(user.clinic_name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateRole(user.user_id, selectedRole, clinicName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedRole(user.role);
    setClinicName(user.clinic_name || '');
    setIsEditing(false);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="sm" />
          <div>
            <div className="font-medium">{user.full_name || 'Не указано'}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {isEditing ? (
          <Select value={selectedRole} onValueChange={(value: AppRole) => setSelectedRole(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coordinator">Координатор</SelectItem>
              <SelectItem value="director">Директор</SelectItem>
              <SelectItem value="super_admin">Супер админ</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={user.role} />
        )}
      </TableCell>
      <TableCell>
        {isEditing && selectedRole === 'coordinator' ? (
          <Input
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            placeholder="Название клиники"
            className="w-40"
          />
        ) : (
          user.clinic_name || '-'
        )}
      </TableCell>
      <TableCell>
        {new Date(user.created_at).toLocaleDateString('ru-RU')}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isUpdating}
            >
              Сохранить
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Отмена
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              disabled={isUpdating || isDeleting}
            >
              Изменить
            </Button>
            {canDelete && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDeleteUser(user)}
                disabled={isUpdating || isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}