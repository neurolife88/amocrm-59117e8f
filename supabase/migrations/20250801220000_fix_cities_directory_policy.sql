-- Fix cities_directory RLS policy to allow all authenticated users to read
DROP POLICY IF EXISTS "Authenticated users can view cities directory" ON public.cities_directory;

CREATE POLICY "All authenticated users can view cities directory" 
ON public.cities_directory 
FOR SELECT 
USING (auth.role() = 'authenticated'); 