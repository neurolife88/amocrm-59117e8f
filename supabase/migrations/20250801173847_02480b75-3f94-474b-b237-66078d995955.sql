
-- Создаем таблицу профилей пользователей с ролями
CREATE TABLE public.user_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('super_admin', 'director', 'coordinator')) NOT NULL DEFAULT 'coordinator',
    clinic_name TEXT, -- Для координаторов указывает их клинику
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для таблицы профилей
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свой профиль
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Политика: пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Создаем представление для объединения всех данных пациентов (как указано в документации)
CREATE VIEW public.super_admin_master_view AS
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
    d.created_at as deal_created_at,
    
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
    tc.apartment_number, -- EDITABLE by coordinator
    
    -- DEPARTURE DATA (tickets_from_treatment)  
    tf.return_transport_type as departure_transport_type,
    tf.departure_city, -- EDITABLE by coordinator
    tf.departure_datetime, -- EDITABLE by coordinator
    tf.departure_flight_number, -- EDITABLE by coordinator
    
    -- VISA DATA
    v.visa_type,
    v.visa_days,
    v.entries_count as visa_entries_count,
    v.corridor_start_date as visa_corridor_start,
    v.corridor_end_date as visa_corridor_end,
    
    -- COMPUTED FIELDS
    (tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) as visa_expiry_date,
    ((tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) - CURRENT_DATE) as days_until_visa_expires,
    
    -- Patient status based on dates
    CASE 
        WHEN tc.arrival_datetime > NOW() THEN 'Arriving'
        WHEN tc.arrival_datetime <= NOW() AND (tf.departure_datetime IS NULL OR tf.departure_datetime > NOW()) THEN 'In Treatment'
        WHEN tf.departure_datetime <= NOW() THEN 'Departed'
        ELSE 'Unknown'
    END as patient_status,
    
    -- Visa status based on expiry
    CASE 
        WHEN (tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) < CURRENT_DATE THEN 'Expired'
        WHEN (tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) - CURRENT_DATE <= 3 THEN 'Expiring Soon'
        ELSE 'Active'
    END as visa_status

FROM deals d
LEFT JOIN contacts c ON c.deal_id = d.id
LEFT JOIN tickets_to_china tc ON tc.deal_id = d.id  
LEFT JOIN tickets_from_treatment tf ON tf.deal_id = d.id
LEFT JOIN visas v ON v.deal_id = d.id
LEFT JOIN clinics_directory cl ON cl.short_name = d.clinic_name;

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  RETURN new;
END;
$$;

-- Триггер для создания профиля при регистрации
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
