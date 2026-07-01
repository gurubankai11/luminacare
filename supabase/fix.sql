-- Run this exact file in your Supabase SQL Editor to fix the doctor visibility!
-- It will safely replace the security rule that is hiding the doctors.

DROP POLICY IF EXISTS "profiles_select_doctors" ON public.profiles;

CREATE POLICY "profiles_select_doctors" ON public.profiles FOR SELECT
  USING (role = 'doctor' AND deleted_at IS NULL AND is_active = true);
