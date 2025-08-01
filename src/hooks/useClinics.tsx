import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clinic } from '@/types/clinic';
import { useToast } from '@/hooks/use-toast';

export function useClinics() {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clinics_directory')
          .select('*')
          .order('full_name', { ascending: true });

        if (error) throw error;
        setClinics(data || []);
      } catch (error) {
        console.error('Error loading clinics:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список клиник",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadClinics();
  }, [toast]);

  return {
    clinics,
    loading,
  };
}