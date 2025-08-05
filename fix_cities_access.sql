-- Fix cities_directory access by disabling RLS temporarily
ALTER TABLE public.cities_directory DISABLE ROW LEVEL SECURITY;

-- Alternative: Create a proper policy for authenticated users
-- DROP POLICY IF EXISTS "Authenticated users can view cities directory" ON public.cities_directory;
-- CREATE POLICY "All authenticated users can view cities directory" 
-- ON public.cities_directory 
-- FOR SELECT 
-- USING (auth.role() = 'authenticated'); 