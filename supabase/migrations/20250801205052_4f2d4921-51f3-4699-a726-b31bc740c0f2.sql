-- Create RLS policy to allow authenticated users to read clinics directory
CREATE POLICY "Authenticated users can view clinics directory" 
ON public.clinics_directory 
FOR SELECT 
TO authenticated 
USING (true);