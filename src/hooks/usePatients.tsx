// src/hooks/usePatients.tsx
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
      console.log('Loading patients for profile:', profile);
      
      // Используем прямое обращение к представлению
      const { data: allData, error: fetchError } = await supabase
        .from('super_admin_master_view')
        .select('*');
        
      if (fetchError) {
        console.error('View query error:', fetchError);
        throw new Error(`Ошибка загрузки данных: ${fetchError.message}`);
      }

      console.log('View query successful, data count:', allData?.length);
      console.log('Sample data from filtered view:', allData?.slice(0, 2));
      
      let filteredData = allData || [];
      
      // Apply client-side filters (только дополнительные фильтры)
      if (filters.clinic && profile.role !== 'coordinator') {
        filteredData = filteredData.filter((patient: any) => 
          patient.clinic_name === filters.clinic
        );
      }
      
      // Фильтрация по статусу удалена - теперь используется только status_name из AmoCRM
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((patient: any) => 
          patient.patient_full_name?.toLowerCase().includes(searchLower) ||
          patient.patient_email?.toLowerCase().includes(searchLower) ||
          patient.patient_phone?.toLowerCase().includes(searchLower)
        );
      }




      
      // Sort by arrival_datetime
      filteredData.sort((a: any, b: any) => {
        const dateA = a.arrival_datetime ? new Date(a.arrival_datetime).getTime() : 0;
        const dateB = b.arrival_datetime ? new Date(b.arrival_datetime).getTime() : 0;
        return dateA - dateB;
      });
      
      // Log raw data for debugging
      console.log('Raw data from filtered view:', allData?.slice(0, 3));
      console.log('Filtered data sample:', filteredData?.slice(0, 3));
      

      
      // Transform the data to match PatientData type
      const transformedData: PatientData[] = filteredData.map((row: any) => ({
        deal_id: row.deal_id || 0,
        lead_id: row.lead_id,
        deal_name: row.deal_name,
        patient_full_name: row.patient_full_name || '',
        clinic_name: row.clinic_name || '',
        // patient_status удален - теперь используется только status_name из AmoCRM
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
        patient_position: row.patient_position,
        amocrm_contact_id: row.amocrm_contact_id,
        arrival_datetime: row.arrival_datetime,
        arrival_transport_type: row.arrival_transport_type,
        departure_airport_code: row.departure_airport_code,
        arrival_city: row.arrival_city,
        arrival_flight_number: row.arrival_flight_number,
        arrival_terminal: row.arrival_terminal,
        passengers_count: row.passengers_count,
        apartment_number: row.apartment_number,
        departure_transport_type: row.departure_transport_type,
        departure_city: row.departure_city,
        departure_datetime: row.departure_datetime,
        departure_flight_number: row.departure_flight_number,
        visa_type: row.visa_type,
        visa_days: row.visa_days,
        visa_entries_count: row.visa_entries_count,
        visa_corridor_start: row.visa_corridor_start,
        visa_corridor_end: row.visa_corridor_end,
        visa_expiry_date: row.visa_expiry_date,
        days_until_visa_expires: row.days_until_visa_expires,
        visa_status: (row.visa_status as 'Active' | 'Expiring Soon' | 'Expired') || null,
      }));
      
      setPatients(transformedData);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const updatePatient = async (dealId: number, updates: Partial<PatientData>) => {
    try {
      setLoading(true);
      setError(null);

      // Обновляем только поля из таблицы deals
      const { error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', dealId);

      if (error) {
        throw error;
      }

      // Refresh the data
      await loadPatients({ search: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadPatients({ search: '' });
    }
  }, [profile, loadPatients]);

  return {
    patients,
    loading,
    error,
    loadPatients,
    updatePatient
  };
}