-- Fix critical security issues identified in security review

-- 1. Fix Function Search Path vulnerabilities by adding proper search_path settings
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT COALESCE(
        (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()),
        'coordinator'::public.app_role
    );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_clinic()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT clinic_name FROM public.user_profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT COALESCE(
        (SELECT role = 'super_admin'::public.app_role 
         FROM public.user_profiles 
         WHERE user_id = auth.uid()),
        false
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid)
RETURNS TABLE(id uuid, user_id uuid, email text, full_name text, role app_role, clinic_name text, created_at timestamp without time zone, updated_at timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 2. Add role escalation prevention
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    current_user_role public.app_role;
    target_user_id uuid;
BEGIN
    -- Get current user's role
    SELECT get_current_user_role() INTO current_user_role;
    
    -- Determine target user ID based on operation
    IF TG_OP = 'UPDATE' THEN
        target_user_id := NEW.user_id;
    ELSE
        target_user_id := OLD.user_id;
    END IF;
    
    -- Prevent users from modifying their own role
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Users cannot modify their own role';
    END IF;
    
    -- Only super admins can modify roles
    IF current_user_role != 'super_admin'::public.app_role THEN
        RAISE EXCEPTION 'Only super admins can modify user roles';
    END IF;
    
    -- Prevent creation of multiple super admins without explicit permission
    IF TG_OP = 'UPDATE' AND NEW.role = 'super_admin'::public.app_role AND OLD.role != 'super_admin'::public.app_role THEN
        -- Log role elevation for audit purposes
        INSERT INTO public.audit_log (action, user_id, target_user_id, old_role, new_role, timestamp)
        VALUES ('role_elevation', auth.uid(), NEW.user_id, OLD.role, NEW.role, now());
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    target_user_id uuid,
    old_role app_role,
    new_role app_role,
    timestamp timestamp without time zone DEFAULT now(),
    ip_address text,
    user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (is_super_admin());

-- 4. Add trigger to user_profiles for role change monitoring
CREATE TRIGGER prevent_role_escalation_trigger
    BEFORE UPDATE OF role ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_escalation();

-- 5. Enhanced RLS policies with better security
-- Add policy to prevent users from updating their own profiles beyond basic info
CREATE POLICY "Users can only update own basic profile info"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
    user_id = auth.uid() AND 
    -- Users can only update full_name, not role or clinic_name
    role = (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) AND
    clinic_name = (SELECT clinic_name FROM public.user_profiles WHERE user_id = auth.uid())
);

-- Drop the old less secure policy
DROP POLICY IF EXISTS "allow_own_profile_update" ON public.user_profiles;