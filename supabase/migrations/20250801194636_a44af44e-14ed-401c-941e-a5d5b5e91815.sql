-- Add INSERT policy for user_profiles to allow profile creation during registration
CREATE POLICY "Users can insert their own profile during registration"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);