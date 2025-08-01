-- Update handle_new_user function to assign coordinator role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, role, clinic_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name',
        'coordinator'::public.app_role,  -- All new users get coordinator role by default
        NEW.raw_user_meta_data ->> 'clinic_name'
    );
    RETURN NEW;
END;
$function$;