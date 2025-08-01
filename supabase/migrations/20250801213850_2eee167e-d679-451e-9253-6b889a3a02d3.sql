-- Drop and recreate get_filtered_master_view function with correct data types
DROP FUNCTION IF EXISTS public.get_filtered_master_view();

CREATE OR REPLACE FUNCTION public.get_filtered_master_view()
 RETURNS TABLE(deal_id bigint, lead_id character varying, deal_name character varying, pipeline_name character varying, status_name character varying, clinic_name character varying, deal_country character varying, visa_city character varying, clinic_full_name character varying, clinic_address_chinese text, clinic_address_english text, patient_last_name text, patient_first_name text, patient_full_name text, patient_preferred_name text, patient_phone text, patient_email text, patient_birthday date, patient_country character varying, patient_city text, patient_passport text, amocrm_contact_id bigint, arrival_datetime timestamp without time zone, arrival_transport_type character varying, departure_airport_code text, arrival_city text, arrival_flight_number text, arrival_terminal text, passengers_count text, apartment_number text, departure_transport_type text, departure_city text, departure_datetime timestamp without time zone, departure_flight_number text, visa_type text, visa_days integer, visa_entries_count character varying, visa_corridor_start date, visa_corridor_end date, visa_expiry_date timestamp without time zone, days_until_visa_expires interval, patient_status text, visa_status text, deal_created_at timestamp without time zone, deal_updated_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    current_role public.app_role;
    current_clinic text;
BEGIN
    -- Get current user's role and clinic with explicit schema references
    SELECT public.get_current_user_role() INTO current_role;
    SELECT public.get_current_user_clinic() INTO current_clinic;
    
    -- Return filtered results based on role
    IF current_role = 'coordinator' THEN
        -- Coordinators see only their clinic's patients
        RETURN QUERY
        SELECT * FROM public.super_admin_master_view samv
        WHERE samv.clinic_name = current_clinic;
    ELSE
        -- Directors and Super Admins see all patients
        RETURN QUERY
        SELECT * FROM public.super_admin_master_view;
    END IF;
END;
$function$;