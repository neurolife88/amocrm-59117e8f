import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface City {
  id: number;
  city_name: string;
  airport_code: string | null;
  railway_station_name: string | null;
}

export function useCities() {
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        console.log('Loading cities from database...');
        
        const { data, error } = await supabase
          .from('cities_directory')
          .select('*')
          .order('city_name', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Cities loaded:', data);
        setCities(data || []);
      } catch (error) {
        console.error('Error loading cities:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список городов",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [toast]);

  return {
    cities,
    loading,
  };
}