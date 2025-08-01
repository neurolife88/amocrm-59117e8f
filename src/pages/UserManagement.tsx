import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile } from '@/types/auth';
import { UserRow } from '@/components/users/UserRow';
import { useUserManagement } from '@/hooks/useUserManagement';

export default function UserManagement() {
  const { profile, loading: authLoading } = useAuth();
  const {
    loading,
    searchTerm,
    setSearchTerm,
    updatingUser,
    deletingUser,
    filteredUsers,
    clinics,
    clinicsLoading,
    loadUsers,
    updateUserRole,
    deleteUser,
  } = useUserManagement();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Защита доступа - только супер админ
  if (!authLoading && profile?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      loadUsers();
    }
  }, [profile, loadUsers]);

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete.user_id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const canDeleteUser = (user: UserProfile) => {
    // Нельзя удалять самого себя
    if (user.user_id === profile?.user_id) return false;
    // Нельзя удалять других супер админов
    if (user.role === 'super_admin') return false;
    return true;
  };


  if (authLoading) {
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
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onUpdateRole={updateUserRole}
                    onDeleteUser={handleDeleteClick}
                    isUpdating={updatingUser === user.user_id}
                    isDeleting={deletingUser === user.user_id}
                    canDelete={canDeleteUser(user)}
                    clinics={clinics}
                    clinicsLoading={clinicsLoading}
                  />
                ))
              )}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Пользователи не найдены
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Удалить пользователя"
        description={`Вы уверены, что хотите удалить пользователя ${userToDelete?.full_name || userToDelete?.email}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отменить"
        onConfirm={handleDeleteConfirm}
        destructive={true}
      />
    </div>
  );
}
