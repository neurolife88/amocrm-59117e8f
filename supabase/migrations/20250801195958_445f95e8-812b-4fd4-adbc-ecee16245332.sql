-- Add DELETE policy for user_profiles (only super-admin can delete)
CREATE POLICY "Super admins can delete user profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (get_current_user_role() = 'super_admin'::public.app_role);

-- Create function to safely delete a user from both auth.users and user_profiles
CREATE OR REPLACE FUNCTION public.delete_user_safely(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    target_user_role public.app_role;
    current_user_role public.app_role;
BEGIN
    -- Get current user's role
    SELECT get_current_user_role() INTO current_user_role;
    
    -- Only super admins can delete users
    IF current_user_role != 'super_admin'::public.app_role THEN
        RAISE EXCEPTION 'Only super admins can delete users';
    END IF;
    
    -- Prevent self-deletion
    IF user_uuid = auth.uid() THEN
        RAISE EXCEPTION 'Cannot delete your own account';
    END IF;
    
    -- Get target user's role
    SELECT role INTO target_user_role
    FROM public.user_profiles
    WHERE user_id = user_uuid;
    
    -- Prevent deletion of other super admins
    IF target_user_role = 'super_admin'::public.app_role THEN
        RAISE EXCEPTION 'Cannot delete other super admin accounts';
    END IF;
    
    -- Delete from auth.users (this will cascade to user_profiles)
    DELETE FROM auth.users WHERE id = user_uuid;
    
    -- Return success
    RETURN true;
END;
$function$;