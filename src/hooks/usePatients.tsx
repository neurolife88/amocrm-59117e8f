
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PatientData, PatientFilters } from '@/types/patient';
import { useAuth } from '@/hooks/useAuth';

export function usePatients() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const loadPatients = useCallback(async (filters: PatientFilters) => {
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Using any type temporarily until Supabase types update
      let query = (supabase as any)
        .from('super_admin_master_view')
        .select('*');
        
      // Role-based filtering
      if (profile.role === 'coordinator' && profile.clinic_name) {
        query = query.eq('clinic_name', profile.clinic_name);
      }
      
      // Apply filters
      if (filters.clinic && profile.role !== 'coordinator') {
        query = query.eq('clinic_name', filters.clinic);
      }
      
      if (filters.status !== 'all') {
        const statusMap = {
          'arriving': 'Arriving',
          'in_treatment': 'In Treatment',
          'departing': 'Departed'
        };
        query = query.eq('patient_status', statusMap[filters.status]);
      }
      
      if (filters.search) {
        query = query.ilike('patient_full_name', `%${filters.search}%`);
      }

      // Date filters
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'tomorrow':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
            break;
          case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
            break;
          default:
            startDate = new Date(0);
            endDate = new Date(2100, 0, 1);
        }

        query = query
          .gte('arrival_datetime', startDate.toISOString())
          .lt('arrival_datetime', endDate.toISOString());
      }

      if (filters.urgentVisas) {
        query = query.eq('visa_status', 'Expiring Soon');
      }
      
      const { data, error: queryError } = await query.order('arrival_datetime', { ascending: true });
      
      if (queryError) throw queryError;
      setPatients((data || []) as PatientData[]);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const updatePatient = async (dealId: number, updates: Partial<PatientData>) => {
    if (!profile || profile.role !== 'coordinator') {
      throw new Error('Not authorized to update patients');
    }

    try {
      const { apartment_number, ...departureFields } = updates;
      
      // Update apartment in tickets_to_china
      if (apartment_number !== undefined) {
        const { error: arrivalError } = await supabase
          .from('tickets_to_china')
          .update({ apartment_number })
          .eq('deal_id', dealId);
        if (arrivalError) throw arrivalError;
      }
      
      // Update departure fields in tickets_from_treatment
      if (Object.keys(departureFields).length > 0) {
        const { error: departureError } = await supabase
          .from('tickets_from_treatment')
          .update(departureFields)
          .eq('deal_id', dealId);
        if (departureError) throw departureError;
      }

      // Optimistic update
      setPatients(current =>
        current.map(p =>
          p.deal_id === dealId ? { ...p, ...updates } : p
        )
      );
    } catch (err) {
      console.error('Error updating patient:', err);
      throw err;
    }
  };

  return { patients, loading, error, loadPatients, updatePatient };
}
