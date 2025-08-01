import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'director' | 'coordinator';
  clinic_name: string | null;
  created_at: string;
  updated_at: string;
}

export default function UserManagement() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  // Защита доступа - только супер админ
  if (!authLoading && profile?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      loadUsers();
    }
  }, [profile]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string, clinicName?: string) => {
    setUpdatingUser(userId);
    try {
      const updateData: any = { role: newRole };
      
      // Если роль координатор и указана клиника, добавляем clinic_name
      if (newRole === 'coordinator' && clinicName) {
        updateData.clinic_name = clinicName;
      } else if (newRole !== 'coordinator') {
        updateData.clinic_name = null;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      // Обновляем локальное состояние
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, role: newRole as any, clinic_name: updateData.clinic_name }
          : user
      ));

      toast({
        title: "Успех",
        description: "Роль пользователя обновлена",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя",
        variant: "destructive",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
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

  const getRoleDisplayName = (role: string) => {
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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.clinic_name && user.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <p className="text-muted-foreground">Управление ролями и правами доступа пользователей</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Пользователи системы
          </CardTitle>
          <CardDescription>
            Просмотр и изменение ролей пользователей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Поиск */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по email, имени или клинике..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Таблица пользователей */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Клиника</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onUpdateRole={updateUserRole}
                  isUpdating={updatingUser === user.user_id}
                  getRoleBadgeVariant={getRoleBadgeVariant}
                  getRoleDisplayName={getRoleDisplayName}
                />
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Пользователи не найдены
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface UserRowProps {
  user: UserProfile;
  onUpdateRole: (userId: string, newRole: string, clinicName?: string) => void;
  isUpdating: boolean;
  getRoleBadgeVariant: (role: string) => any;
  getRoleDisplayName: (role: string) => string;
}

function UserRow({ user, onUpdateRole, isUpdating, getRoleBadgeVariant, getRoleDisplayName }: UserRowProps) {
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'director' | 'coordinator'>(user.role);
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
        <div>
          <div className="font-medium">{user.full_name || 'Не указано'}</div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {isEditing ? (
          <Select value={selectedRole} onValueChange={(value: 'super_admin' | 'director' | 'coordinator') => setSelectedRole(value)}>
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
          <Badge variant={getRoleBadgeVariant(user.role)}>
            {getRoleDisplayName(user.role)}
          </Badge>
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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
          >
            Изменить
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}