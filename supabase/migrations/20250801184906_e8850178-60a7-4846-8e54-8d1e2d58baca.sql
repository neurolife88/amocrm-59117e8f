-- Создаем RPC функции для получения данных

-- Функция для получения профиля пользователя
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    role app_role,
    clinic_name TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.user_id,
        up.email,
        up.full_name,
        up.role,
        up.clinic_name,
        up.created_at,
        up.updated_at
    FROM public.user_profiles up
    WHERE up.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Функция для получения данных master view
CREATE OR REPLACE FUNCTION public.get_super_admin_master_view()
RETURNS TABLE (
    deal_id BIGINT,
    lead_id CHARACTER VARYING,
    deal_name CHARACTER VARYING,
    pipeline_name CHARACTER VARYING,
    status_name CHARACTER VARYING,
    clinic_name CHARACTER VARYING,
    deal_country CHARACTER VARYING,
    visa_city CHARACTER VARYING,
    clinic_full_name CHARACTER VARYING,
    clinic_address_chinese TEXT,
    clinic_address_english TEXT,
    patient_last_name TEXT,
    patient_first_name TEXT,
    patient_full_name TEXT,
    patient_preferred_name TEXT,
    patient_phone TEXT,
    patient_email TEXT,
    patient_birthday DATE,
    patient_country CHARACTER VARYING,
    patient_city TEXT,
    patient_passport TEXT,
    amocrm_contact_id BIGINT,
    arrival_datetime TIMESTAMP WITHOUT TIME ZONE,
    arrival_transport_type CHARACTER VARYING,
    departure_airport_code TEXT,
    arrival_city TEXT,
    arrival_flight_number TEXT,
    arrival_terminal TEXT,
    passengers_count TEXT,
    apartment_number TEXT,
    departure_transport_type TEXT,
    departure_city TEXT,
    departure_datetime TIMESTAMP WITHOUT TIME ZONE,
    departure_flight_number TEXT,
    visa_type TEXT,
    visa_days INTEGER,
    visa_entries_count CHARACTER VARYING,
    visa_corridor_start DATE,
    visa_corridor_end DATE,
    visa_expiry_date DATE,
    days_until_visa_expires INTERVAL,
    patient_status TEXT,
    visa_status TEXT,
    deal_created_at TIMESTAMP WITHOUT TIME ZONE,
    deal_updated_at TIMESTAMP WITHOUT TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- DEAL DATA
        d.id as deal_id,
        d.lead_id,
        d.deal_name,
        d.pipeline_name,
        d.status_name,
        d.clinic_name,
        d.country as deal_country,
        d.visa_city,
        
        -- CLINIC DATA
        cl.full_name as clinic_full_name,
        cl.address_chinese as clinic_address_chinese,
        cl.address_english as clinic_address_english,
        
        -- PATIENT DATA
        c.last_name as patient_last_name,
        c.first_name as patient_first_name,
        CONCAT(c.first_name, ' ', c.last_name) as patient_full_name,
        c.preferred_name as patient_preferred_name,
        c.work_phone as patient_phone,
        c.work_email as patient_email,
        c.birthday as patient_birthday,
        c.country as patient_country,
        c.city as patient_city,
        c.passport_number as patient_passport,
        c.amocrm_contact_id,
        
        -- ARRIVAL DATA (tickets_to_china)
        tc.arrival_datetime,
        tc.transport_type as arrival_transport_type,
        tc.airport_code as departure_airport_code,
        tc.arrival_city,
        tc.flight_number as arrival_flight_number,
        tc.terminal as arrival_terminal,
        tc.passengers_count,
        tc.apartment_number,
        
        -- DEPARTURE DATA (tickets_from_treatment)  
        tf.return_transport_type as departure_transport_type,
        tf.departure_city,
        tf.departure_datetime,
        tf.departure_flight_number,
        
        -- VISA DATA
        v.visa_type,
        v.visa_days,
        v.entries_count as visa_entries_count,
        v.corridor_start_date as visa_corridor_start,
        v.corridor_end_date as visa_corridor_end,
        
        -- COMPUTED FIELDS
        (tc.arrival_datetime::date + (v.visa_days || ' days')::interval)::date as visa_expiry_date,
        ((tc.arrival_datetime::date + (v.visa_days || ' days')::interval) - CURRENT_DATE) as days_until_visa_expires,
        
        -- Patient status based on dates
        CASE 
            WHEN tc.arrival_datetime > NOW() THEN 'Arriving'
            WHEN tc.arrival_datetime <= NOW() AND (tf.departure_datetime IS NULL OR tf.departure_datetime > NOW()) THEN 'In Treatment'
            WHEN tf.departure_datetime <= NOW() THEN 'Departed'
            ELSE 'Unknown'
        END as patient_status,
        
        -- Visa status based on expiry
        CASE 
            WHEN (tc.arrival_datetime::date + (v.visa_days || ' days')::interval) < CURRENT_DATE THEN 'Expired'
            WHEN ((tc.arrival_datetime::date + (v.visa_days || ' days')::interval) - CURRENT_DATE) <= interval '3 days' THEN 'Expiring Soon'
            ELSE 'Active'
        END as visa_status,
        
        -- Timestamps
        d.created_at as deal_created_at,
        d.updated_at as deal_updated_at

    FROM public.deals d
    LEFT JOIN public.contacts c ON c.deal_id = d.id
    LEFT JOIN public.tickets_to_china tc ON tc.deal_id = d.id  
    LEFT JOIN public.tickets_from_treatment tf ON tf.deal_id = d.id
    LEFT JOIN public.visas v ON v.deal_id = d.id
    LEFT JOIN public.clinics_directory cl ON cl.short_name = d.clinic_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';