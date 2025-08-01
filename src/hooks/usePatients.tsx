
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PatientData, PatientFilters } from '@/types/patient';
import { useAuth } from '@/hooks/useAuth';

type MasterViewRow = {
  deal_id: number;
  patient_full_name: string;
  clinic_name: string;
  patient_status: 'Arriving' | 'In Treatment' | 'Departed' | 'Unknown';
  arrival_datetime: string;
  arrival_transport_type: string;
  arrival_city: string;
  arrival_flight_number: string;
  arrival_terminal: string;
  passengers_count: string;
  apartment_number: string | null;
  departure_city: string | null;
  departure_datetime: string | null;
  departure_flight_number: string | null;
  departure_transport_type: string;
  visa_type: string;
  visa_days: number;
  visa_expiry_date: string;
  visa_status: 'Active' | 'Expiring Soon' | 'Expired' | 'Unknown';
  days_until_visa_expires: number;
  visa_corridor_start: string | null;
  visa_corridor_end: string | null;
  patient_phone: string | null;
  patient_email: string | null;
  patient_country: string | null;
  patient_passport: string | null;
  deal_created_at: string;
  deal_updated_at: string;
  amocrm_contact_id: number | null;
  lead_id: string | null;
  deal_name: string | null;
  pipeline_name: string | null;
  status_name: string | null;
  deal_country: string | null;
  visa_city: string | null;
};

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
      // Use RPC call to get master view data
      let { data, error: queryError } = await supabase
        .rpc('get_super_admin_master_view');
        
      // Role-based filtering
      if (profile.role === 'coordinator' && profile.clinic_name) {
        query = query.eq('clinic_name', profile.clinic_name);
      }
      
      if (queryError) throw queryError;
      
      let filteredData = data || [];
      
      // Apply role-based filtering
      if (profile.role === 'coordinator' && profile.clinic_name) {
        filteredData = filteredData.filter(row => row.clinic_name === profile.clinic_name);
      }
      
      // Apply filters
      if (filters.clinic && profile.role !== 'coordinator') {
        filteredData = filteredData.filter(row => row.clinic_name === filters.clinic);
      }
      
      if (filters.status !== 'all') {
        const statusMap = {
          'arriving': 'Arriving',
          'in_treatment': 'In Treatment',
          'departing': 'Departed'
        };
        filteredData = filteredData.filter(row => row.patient_status === statusMap[filters.status]);
      }
      
      if (filters.search) {
        filteredData = filteredData.filter(row => 
          row.patient_full_name?.toLowerCase().includes(filters.search.toLowerCase())
        );
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

        filteredData = filteredData.filter(row => {
          const arrivalDate = new Date(row.arrival_datetime);
          return arrivalDate >= startDate && arrivalDate < endDate;
        });
      }

      if (filters.urgentVisas) {
        filteredData = filteredData.filter(row => row.visa_status === 'Expiring Soon');
      }
      
      if (queryError) throw queryError;
      
      // Transform the data to match PatientData type
      const transformedData: PatientData[] = filteredData.map((row: MasterViewRow) => ({
        deal_id: row.deal_id || 0,
        patient_full_name: row.patient_full_name || '',
        clinic_name: row.clinic_name || '',
        patient_status: row.patient_status || 'Unknown',
        arrival_datetime: row.arrival_datetime || '',
        arrival_transport_type: row.arrival_transport_type || '',
        arrival_city: row.arrival_city || '',
        arrival_flight_number: row.arrival_flight_number || '',
        arrival_terminal: row.arrival_terminal || '',
        passengers_count: row.passengers_count || '',
        apartment_number: row.apartment_number,
        departure_city: row.departure_city,
        departure_datetime: row.departure_datetime,
        departure_flight_number: row.departure_flight_number,
        departure_transport_type: row.departure_transport_type || '',
        visa_type: row.visa_type || '',
        visa_days: row.visa_days || 0,
        visa_expiry_date: row.visa_expiry_date || '',
        visa_status: row.visa_status || 'Unknown',
        days_until_visa_expires: row.days_until_visa_expires || 0,
        visa_corridor_start: row.visa_corridor_start,
        visa_corridor_end: row.visa_corridor_end,
        patient_phone: row.patient_phone,
        patient_email: row.patient_email,
        patient_country: row.patient_country,
        patient_passport: row.patient_passport,
        created_at: row.deal_created_at || '',
        updated_at: row.deal_updated_at || '',
        amocrm_contact_id: row.amocrm_contact_id,
        lead_id: row.lead_id,
        deal_name: row.deal_name,
        pipeline_name: row.pipeline_name,
        status_name: row.status_name,
        deal_country: row.deal_country,
        visa_city: row.visa_city
      }));
      
      setPatients(transformedData);
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
