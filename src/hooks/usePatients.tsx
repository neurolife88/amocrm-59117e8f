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
      // Use the new filtered function that handles role-based access via RLS
      const { data: allData, error: rpcError } = await supabase
        .rpc('get_filtered_master_view');
        
      if (rpcError) throw rpcError;
      
      let filteredData = allData || [];
      
      // Apply client-side filters
      if (filters.clinic && profile.role !== 'coordinator') {
        filteredData = filteredData.filter((patient: any) => 
          patient.clinic_name === filters.clinic
        );
      }
      
      if (filters.status !== 'all') {
        const statusMap = {
          'arriving': 'Arriving',
          'in_treatment': 'In Treatment',
          'departing': 'Departed'
        };
        filteredData = filteredData.filter((patient: any) => 
          patient.patient_status === statusMap[filters.status]
        );
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((patient: any) => 
          patient.patient_full_name?.toLowerCase().includes(searchLower) ||
          patient.patient_email?.toLowerCase().includes(searchLower) ||
          patient.patient_phone?.toLowerCase().includes(searchLower)
        );
      }

      // Date filters
      if (filters.dateRange !== 'all') {
        const now = new Date();
        filteredData = filteredData.filter((patient: any) => {
          if (!patient.arrival_datetime) return false;
          
          const arrivalDate = new Date(patient.arrival_datetime);
          
          switch (filters.dateRange) {
            case 'today':
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
              return arrivalDate >= todayStart && arrivalDate < todayEnd;
              
            case 'tomorrow':
              const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
              const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
              return arrivalDate >= tomorrowStart && arrivalDate < tomorrowEnd;
              
            case 'week':
              const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
              return arrivalDate >= weekStart && arrivalDate < weekEnd;
              
            default:
              return true;
          }
        });
      }

      if (filters.urgentVisas) {
        filteredData = filteredData.filter((patient: any) => 
          patient.visa_status === 'Expiring Soon'
        );
      }
      
      // Sort by arrival_datetime
      filteredData.sort((a: any, b: any) => {
        const dateA = a.arrival_datetime ? new Date(a.arrival_datetime).getTime() : 0;
        const dateB = b.arrival_datetime ? new Date(b.arrival_datetime).getTime() : 0;
        return dateA - dateB;
      });
      
      // Log raw data for debugging
      console.log('Raw data from database:', allData?.slice(0, 3));
      console.log('Filtered data sample:', filteredData?.slice(0, 3));
      
      // Transform the data to match PatientData type
      const transformedData: PatientData[] = filteredData.map((row: any) => ({
        deal_id: row.deal_id || 0,
        lead_id: row.lead_id,
        deal_name: row.deal_name,
        patient_full_name: row.patient_full_name || '',
        clinic_name: row.clinic_name || '',
        patient_status: (row.patient_status as 'Arriving' | 'In Treatment' | 'Departed') || 'Unknown',
        pipeline_name: row.pipeline_name,
        status_name: row.status_name,
        deal_country: row.deal_country,
        visa_city: row.visa_city,
        deal_created_at: row.deal_created_at || '',
        clinic_full_name: row.clinic_full_name,
        clinic_address_chinese: row.clinic_address_chinese,
        clinic_address_english: row.clinic_address_english,
        patient_first_name: row.patient_first_name,
        patient_last_name: row.patient_last_name,
        patient_preferred_name: row.patient_preferred_name,
        patient_phone: row.patient_phone,
        patient_email: row.patient_email,
        patient_birthday: row.patient_birthday,
        patient_country: row.patient_country,
        patient_city: row.patient_city,
        patient_passport: row.patient_passport,
        amocrm_contact_id: row.amocrm_contact_id,
        arrival_datetime: row.arrival_datetime || '',
        arrival_transport_type: row.arrival_transport_type || '',
        departure_airport_code: row.departure_airport_code,
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
        visa_entries_count: row.visa_entries_count,
        visa_corridor_start: row.visa_corridor_start,
        visa_corridor_end: row.visa_corridor_end,
        visa_expiry_date: row.visa_expiry_date || '',
        days_until_visa_expires: row.days_until_visa_expires || 0,
        visa_status: (row.visa_status as 'Active' | 'Expiring Soon' | 'Expired') || null
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
    if (!profile) {
      throw new Error('User profile not loaded');
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