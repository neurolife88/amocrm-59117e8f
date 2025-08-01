
-- 1. Создаем enum для ролей пользователей
CREATE TYPE public.app_role AS ENUM ('super_admin', 'director', 'coordinator');

-- 2. Создаем таблицу user_profiles
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    role app_role NOT NULL DEFAULT 'coordinator',
    clinic_name TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- 3. Включаем RLS для user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Создаем функцию для получения роли текущего пользователя (предотвращает рекурсию RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
    SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 5. Создаем функцию для получения клиники текущего пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_clinic()
RETURNS TEXT AS $$
    SELECT clinic_name FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 6. RLS политики для user_profiles
CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles" 
    ON public.user_profiles 
    FOR SELECT 
    USING (public.get_current_user_role() = 'super_admin');

-- 7. Создаем представление super_admin_master_view
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
    END as visa_status,
    
    -- Timestamps
    d.created_at as deal_created_at,
    d.updated_at as deal_updated_at

FROM deals d
LEFT JOIN contacts c ON c.deal_id = d.id
LEFT JOIN tickets_to_china tc ON tc.deal_id = d.id  
LEFT JOIN tickets_from_treatment tf ON tf.deal_id = d.id
LEFT JOIN visas v ON v.deal_id = d.id
LEFT JOIN clinics_directory cl ON cl.short_name = d.clinic_name;

-- 8. RLS для представления super_admin_master_view
ALTER VIEW public.super_admin_master_view SET (security_invoker = true);

-- 9. Создаем триггер для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, role, clinic_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name',
        COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'coordinator'),
        NEW.raw_user_meta_data ->> 'clinic_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Создаем триггер
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Добавляем тестовых пользователей в user_profiles (если они не существуют)
-- Сначала проверим, существуют ли пользователи в auth.users, и создадим профили только для существующих
INSERT INTO public.user_profiles (user_id, email, full_name, role, clinic_name)
SELECT 
    au.id,
    au.email,
    CASE 
        WHEN au.email = 'superadmin@test.com' THEN 'Super Admin'
        WHEN au.email = 'director@test.com' THEN 'Director User'
        WHEN au.email = 'coordinator1@test.com' THEN 'Coordinator One'
        WHEN au.email = 'coordinator2@test.com' THEN 'Coordinator Two'
        ELSE 'Test User'
    END as full_name,
    CASE 
        WHEN au.email = 'superadmin@test.com' THEN 'super_admin'::app_role
        WHEN au.email = 'director@test.com' THEN 'director'::app_role
        WHEN au.email LIKE 'coordinator%@test.com' THEN 'coordinator'::app_role
        ELSE 'coordinator'::app_role
    END as role,
    CASE 
        WHEN au.email = 'coordinator1@test.com' THEN 'Clinic A'
        WHEN au.email = 'coordinator2@test.com' THEN 'Clinic B'
        ELSE NULL
    END as clinic_name
FROM auth.users au
WHERE au.email IN ('superadmin@test.com', 'director@test.com', 'coordinator1@test.com', 'coordinator2@test.com')
ON CONFLICT (user_id) DO NOTHING;
