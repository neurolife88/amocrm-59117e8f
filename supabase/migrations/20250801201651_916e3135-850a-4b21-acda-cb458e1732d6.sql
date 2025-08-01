-- Grant basic permissions on user_profiles table to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- Also grant usage on the sequence if it exists
GRANT USAGE ON SEQUENCE public.user_profiles_id_seq TO authenticated;

-- Update the function to be simpler and avoid potential recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT COALESCE(
        (SELECT role = 'super_admin'::public.app_role 
         FROM public.user_profiles 
         WHERE user_id = auth.uid()),
        false
    );
$function$;