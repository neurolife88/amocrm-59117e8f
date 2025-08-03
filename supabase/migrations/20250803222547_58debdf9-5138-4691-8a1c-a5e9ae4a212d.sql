-- Включаем RLS для таблиц tickets_to_china и tickets_from_treatment
ALTER TABLE public.tickets_to_china ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_from_treatment ENABLE ROW LEVEL SECURITY;

-- Также нужно включить RLS для остальных таблиц без политик
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visas ENABLE ROW LEVEL SECURITY;

-- Удаляем избыточные политики "policy" с выражением true, которые могут конфликтовать
DROP POLICY IF EXISTS "tickets_to_china_policy" ON public.tickets_to_china;
DROP POLICY IF EXISTS "tickets_from_treatment_policy" ON public.tickets_from_treatment;

-- Создаем недостающие политики для обновления данных координаторами
CREATE POLICY "Directors and super admins can update all departure tickets" 
ON public.tickets_from_treatment 
FOR UPDATE 
TO authenticated 
USING (get_current_user_role() = ANY (ARRAY['director'::app_role, 'super_admin'::app_role]));

CREATE POLICY "Directors and super admins can update all arrival tickets" 
ON public.tickets_to_china 
FOR UPDATE 
TO authenticated 
USING (get_current_user_role() = ANY (ARRAY['director'::app_role, 'super_admin'::app_role]));