-- Security Enhancement Migration
-- Fix critical security issues identified in security review

-- 1. Add proper RLS policy for super_admin_master_view
CREATE POLICY "Only authenticated users with proper roles can access master view"
ON public.super_admin_master_view
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['director'::app_role, 'super_admin'::app_role])
  OR 
  (get_current_user_role() = 'coordinator'::app_role AND clinic_name = get_current_user_clinic())
);

-- 2. Create input validation functions for sensitive data
CREATE OR REPLACE FUNCTION public.validate_passport_number(passport_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Basic passport validation - alphanumeric, 6-12 characters
  IF passport_text IS NULL OR LENGTH(passport_text) < 6 OR LENGTH(passport_text) > 12 THEN
    RETURN false;
  END IF;
  
  -- Check for basic format (letters and numbers only)
  IF NOT passport_text ~ '^[A-Za-z0-9]+$' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 3. Create function to sanitize and validate email addresses
CREATE OR REPLACE FUNCTION public.validate_email(email_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Basic email validation
  IF email_text IS NULL OR LENGTH(email_text) < 5 OR LENGTH(email_text) > 254 THEN
    RETURN false;
  END IF;
  
  -- Check for basic email format
  IF NOT email_text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 4. Create function to validate phone numbers
CREATE OR REPLACE FUNCTION public.validate_phone(phone_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Basic phone validation - remove spaces and special chars for validation
  IF phone_text IS NULL OR LENGTH(REGEXP_REPLACE(phone_text, '[^0-9+]', '', 'g')) < 10 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 5. Add audit trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive patient data
  INSERT INTO public.audit_log (
    action, 
    user_id, 
    target_user_id, 
    timestamp,
    ip_address
  ) VALUES (
    'sensitive_data_access',
    auth.uid(),
    NULL,
    now(),
    NULL
  );
  
  RETURN NULL;
END;
$$;

-- 6. Create trigger for master view access auditing
CREATE OR REPLACE FUNCTION public.log_master_view_access()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This will be called when master view is accessed
  -- Note: Event triggers have limitations, this is a placeholder for enhanced logging
  RAISE LOG 'Master view accessed by user: %', auth.uid();
END;
$$;

-- 7. Add function to mask sensitive data for coordinators
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(data_text text, user_role app_role)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only show full data to directors and super admins
  IF user_role = ANY (ARRAY['director'::app_role, 'super_admin'::app_role]) THEN
    RETURN data_text;
  END IF;
  
  -- Mask data for coordinators (show only first 2 and last 2 characters)
  IF data_text IS NULL OR LENGTH(data_text) < 4 THEN
    RETURN '***';
  END IF;
  
  RETURN LEFT(data_text, 2) || REPEAT('*', LENGTH(data_text) - 4) || RIGHT(data_text, 2);
END;
$$;

-- 8. Create enhanced data access logging
CREATE TABLE IF NOT EXISTS public.data_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  accessed_table text NOT NULL,
  accessed_record_id bigint,
  access_type text NOT NULL, -- 'read', 'write', 'delete'
  timestamp timestamp without time zone DEFAULT now(),
  ip_address text,
  user_agent text,
  clinic_context text
);

-- Enable RLS on data access log
ALTER TABLE public.data_access_log ENABLE ROW LEVEL SECURITY;

-- Policy for data access log - only super admins can view
CREATE POLICY "Super admins can view data access logs"
ON public.data_access_log
FOR SELECT
TO authenticated
USING (is_super_admin());

-- 9. Add constraint to ensure email validation
ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_email_format 
CHECK (validate_email(email));

-- 10. Add comment for security documentation
COMMENT ON FUNCTION public.mask_sensitive_data IS 'Masks sensitive data based on user role - only directors and super admins see full data';
COMMENT ON FUNCTION public.validate_passport_number IS 'Validates passport number format for data integrity';
COMMENT ON TABLE public.data_access_log IS 'Logs access to sensitive data for audit purposes';