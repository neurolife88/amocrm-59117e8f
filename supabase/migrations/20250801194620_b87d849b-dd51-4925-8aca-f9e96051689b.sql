-- Add INSERT policy for user_profiles to allow profile creation during registration
CREATE POLICY "Users can insert their own profile during registration"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();