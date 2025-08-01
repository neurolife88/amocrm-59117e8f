import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

export function useUserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [toast]);

  const updateUserRole = useCallback(async (userId: string, newRole: string, clinicName?: string) => {
    setUpdatingUser(userId);
    try {
      const updateData: any = { role: newRole };
      
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
  }, [toast]);

  const deleteUser = useCallback(async (userId: string) => {
    setDeletingUser(userId);
    try {
      const { error } = await supabase.rpc('delete_user_safely', {
        user_uuid: userId
      });

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.user_id !== userId));

      toast({
        title: "Успех",
        description: "Пользователь удален",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить пользователя",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  }, [toast]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.clinic_name && user.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  return {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    updatingUser,
    deletingUser,
    filteredUsers,
    loadUsers,
    updateUserRole,
    deleteUser,
  };
}