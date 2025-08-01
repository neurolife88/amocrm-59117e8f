-- Create profile for existing user
INSERT INTO public.user_profiles (user_id, email, full_name, role, clinic_name)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data ->> 'full_name', email),
    'super_admin'::public.app_role,
    raw_user_meta_data ->> 'clinic_name'
FROM auth.users 
WHERE email = 'cdmasev@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
);