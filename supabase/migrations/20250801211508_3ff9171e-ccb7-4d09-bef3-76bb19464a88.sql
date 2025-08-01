-- Add missing SELECT policies for remaining tables

-- Enable RLS and add policies for contacts_oll table  
ALTER TABLE public.contacts_oll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contacts_oll" 
ON public.contacts_oll 
FOR SELECT 
USING (true);

-- Enable RLS and add policies for deals_oll table
ALTER TABLE public.deals_oll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deals_oll" 
ON public.deals_oll 
FOR SELECT 
USING (true);