-- Drop ALL existing policies for user_profiles to start fresh
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can delete user profiles" ON public.user_profiles;

-- Update get_current_user_role function to be completely safe
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT COALESCE(
        (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()),
        'coordinator'::app_role
    );
$function$;

-- Create safe helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin'::app_role
    );
$function$;

-- Create completely new, safe RLS policies
CREATE POLICY "allow_own_profile_select"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "allow_super_admin_select_all"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "allow_own_profile_insert"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_own_profile_update"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "allow_super_admin_update_all"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "allow_super_admin_delete"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (public.is_super_admin());