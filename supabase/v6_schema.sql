-- ============================================================
-- LuminaCare V6 — Production Schema
-- Run this ONCE on a fresh Supabase project.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT CHECK (role IN ('patient', 'doctor', 'admin', 'reception')) DEFAULT 'patient',
  gender TEXT CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL),
  dob DATE,
  age INTEGER,
  blood_group TEXT,
  height TEXT,
  weight TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  medical_history TEXT,
  insurance JSONB,
  emergency_contact JSONB,
  -- Doctor-specific fields (NULL for non-doctors)
  specialty TEXT,
  qualification TEXT,
  experience_years INTEGER,
  consultation_fee NUMERIC,
  bio TEXT,
  available_days JSONB,
  available_times JSONB,
  branch_id UUID,
  is_active BOOLEAN DEFAULT true,
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: check if caller is staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'reception')
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper: check if caller is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper: get caller role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- RLS: Users see own profile; staff see all active; auth users see doctor profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "profiles_select_staff" ON public.profiles FOR SELECT
  USING (public.is_staff() AND deleted_at IS NULL);
CREATE POLICY "profiles_select_doctors" ON public.profiles FOR SELECT
  USING (role = 'doctor' AND deleted_at IS NULL AND is_active = true);

CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Auto-create profile on signup (always patient)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'patient'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ────────────────────────────────────────────────────────────
-- 2. BRANCHES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '18:00',
  working_days JSONB DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]'::jsonb,
  patients_count INTEGER DEFAULT 0,
  doctors_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('open', 'maintenance', 'closed')) DEFAULT 'open',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches_select" ON public.branches FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "branches_modify_admin" ON public.branches FOR ALL USING (public.is_admin());

-- FK from profiles to branches
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_branch
  FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────
-- 3. APPOINTMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_number TEXT UNIQUE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  symptoms TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  queue_token INTEGER,
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select" ON public.appointments FOR SELECT
  USING (
    auth.uid() = patient_id
    OR auth.uid() = doctor_id
    OR public.get_my_role() IN ('admin', 'reception')
  );
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    OR public.get_my_role() IN ('admin', 'reception')
  );
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE
  USING (
    auth.uid() = doctor_id
    OR public.get_my_role() IN ('admin', 'reception')
    OR (auth.uid() = patient_id AND status = 'pending')
  );

DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ────────────────────────────────────────────────────────────
-- 4. PRESCRIPTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  diagnosis TEXT,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prescriptions_select" ON public.prescriptions FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR public.is_admin());
CREATE POLICY "prescriptions_insert" ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = doctor_id OR public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 5. REPORTS (test reports / medical records)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  report_type TEXT,
  file_url TEXT,
  status TEXT CHECK (status IN ('normal', 'review', 'critical')) DEFAULT 'normal',
  uploaded_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_patient ON public.reports(patient_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON public.reports FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR public.is_staff());
CREATE POLICY "reports_insert" ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = doctor_id OR public.is_staff());

-- ────────────────────────────────────────────────────────────
-- 6. MESSAGES (chat)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_read" ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ────────────────────────────────────────────────────────────
-- 7. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read) WHERE read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT
  WITH CHECK (true); -- Service role or any authenticated user can create

-- ────────────────────────────────────────────────────────────
-- 8. CONTACT MESSAGES (public form)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_select_admin" ON public.contact_messages FOR SELECT USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 9. SYSTEM METRICS (admin monitoring)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cpu_usage INTEGER DEFAULT 0,
  memory_usage INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  database_status TEXT DEFAULT 'healthy',
  server_status TEXT DEFAULT 'healthy',
  ai_status TEXT DEFAULT 'healthy',
  storage_usage_gb NUMERIC DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics_select_admin" ON public.system_metrics FOR SELECT USING (public.is_admin());
CREATE POLICY "metrics_insert" ON public.system_metrics FOR INSERT WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 10. AUDIT LOGS (immutable)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_role TEXT,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs; nobody can update or delete
CREATE POLICY "audit_select_admin" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT WITH CHECK (true);
-- No UPDATE or DELETE policies = immutable

-- Helper function to write audit logs
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_table TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, user_role, action, table_name, record_id, metadata)
  VALUES (
    auth.uid(),
    public.get_my_role(),
    p_action,
    p_table,
    p_record_id,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 11. AUTO-AUDIT TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Audit appointment changes
CREATE OR REPLACE FUNCTION public.audit_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('appointment_created', 'appointments', NEW.id::text,
      jsonb_build_object('patient_id', NEW.patient_id, 'doctor_id', NEW.doctor_id, 'date', NEW.date, 'status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM public.log_audit('appointment_status_changed', 'appointments', NEW.id::text,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      PERFORM public.log_audit('appointment_cancelled', 'appointments', NEW.id::text, '{}'::jsonb);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_appointments ON public.appointments;
CREATE TRIGGER trg_audit_appointments
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE public.audit_appointment_change();

-- Audit prescription creation
CREATE OR REPLACE FUNCTION public.audit_prescription_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('prescription_created', 'prescriptions', NEW.id::text,
      jsonb_build_object('patient_id', NEW.patient_id, 'doctor_id', NEW.doctor_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_prescriptions ON public.prescriptions;
CREATE TRIGGER trg_audit_prescriptions
  AFTER INSERT ON public.prescriptions
  FOR EACH ROW EXECUTE PROCEDURE public.audit_prescription_change();

-- Audit report uploads
CREATE OR REPLACE FUNCTION public.audit_report_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('report_uploaded', 'reports', NEW.id::text,
      jsonb_build_object('patient_id', NEW.patient_id, 'report_type', NEW.report_type));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_reports ON public.reports;
CREATE TRIGGER trg_audit_reports
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE PROCEDURE public.audit_report_change();

-- Audit role changes
CREATE OR REPLACE FUNCTION public.audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM public.log_audit('role_changed', 'profiles', NEW.id::text,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'user_name', NEW.name));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_role_change ON public.profiles;
CREATE TRIGGER trg_audit_role_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.audit_role_change();

-- ────────────────────────────────────────────────────────────
-- 12. REALTIME PUBLICATIONS
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE prescriptions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE system_metrics;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 13. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false) ON CONFLICT DO NOTHING;

CREATE POLICY "avatars_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "reports_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');
CREATE POLICY "reports_select" ON storage.objects FOR SELECT USING (bucket_id = 'reports' AND auth.uid() = owner);
