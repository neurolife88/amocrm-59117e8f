-- Add missing SELECT policies for tables with RLS enabled

-- Enable RLS and add policies for deals table
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinators can view deals from their clinic" 
ON public.deals 
FOR SELECT 
USING (
  get_current_user_role() = 'coordinator' AND
  clinic_name = get_current_user_clinic()
);

CREATE POLICY "Directors and super admins can view all deals" 
ON public.deals 
FOR SELECT 
USING (
  get_current_user_role() IN ('director', 'super_admin')
);

-- Add SELECT policies for tickets_to_china
CREATE POLICY "Coordinators can view tickets from their clinic" 
ON public.tickets_to_china 
FOR SELECT 
USING (
  get_current_user_role() = 'coordinator' AND
  EXISTS (
    SELECT 1 FROM public.deals d 
    WHERE d.id = tickets_to_china.deal_id 
    AND d.clinic_name = get_current_user_clinic()
  )
);

CREATE POLICY "Directors and super admins can view all tickets" 
ON public.tickets_to_china 
FOR SELECT 
USING (
  get_current_user_role() IN ('director', 'super_admin')
);

-- Add SELECT policies for tickets_from_treatment
CREATE POLICY "Coordinators can view departure tickets from their clinic" 
ON public.tickets_from_treatment 
FOR SELECT 
USING (
  get_current_user_role() = 'coordinator' AND
  EXISTS (
    SELECT 1 FROM public.deals d 
    WHERE d.id = tickets_from_treatment.deal_id 
    AND d.clinic_name = get_current_user_clinic()
  )
);

CREATE POLICY "Directors and super admins can view all departure tickets" 
ON public.tickets_from_treatment 
FOR SELECT 
USING (
  get_current_user_role() IN ('director', 'super_admin')
);

-- Enable RLS and add policies for contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinators can view contacts from their clinic" 
ON public.contacts 
FOR SELECT 
USING (
  get_current_user_role() = 'coordinator' AND
  EXISTS (
    SELECT 1 FROM public.deals d 
    WHERE d.id = contacts.deal_id 
    AND d.clinic_name = get_current_user_clinic()
  )
);

CREATE POLICY "Directors and super admins can view all contacts" 
ON public.contacts 
FOR SELECT 
USING (
  get_current_user_role() IN ('director', 'super_admin')
);

-- Enable RLS and add policies for visas table
ALTER TABLE public.visas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinators can view visas from their clinic" 
ON public.visas 
FOR SELECT 
USING (
  get_current_user_role() = 'coordinator' AND
  EXISTS (
    SELECT 1 FROM public.deals d 
    WHERE d.id = visas.deal_id 
    AND d.clinic_name = get_current_user_clinic()
  )
);

CREATE POLICY "Directors and super admins can view all visas" 
ON public.visas 
FOR SELECT 
USING (
  get_current_user_role() IN ('director', 'super_admin')
);

-- Enable RLS and add policies for cities_directory
ALTER TABLE public.cities_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cities directory" 
ON public.cities_directory 
FOR SELECT 
USING (true);