-- Supabase Schema for LuminaCare V3.5

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor', 'admin', 'receptionist')) DEFAULT 'patient',
  specialty TEXT, -- For doctors
  avatar_url TEXT,
  blood_group TEXT,
  height TEXT,
  weight TEXT,
  allergies TEXT,
  medical_history TEXT,
  emergency_contact JSONB, -- { name, relationship, phone }
  insurance_info JSONB, -- { provider, policy_number }
  address TEXT,
  notification_prefs JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'receptionist')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE POLICY "Users can view own profile or staff can view all."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id OR public.is_staff() );

CREATE POLICY "Doctors and staff are viewable by authenticated users."
  ON public.profiles FOR SELECT
  USING ( role IN ('doctor', 'admin', 'receptionist') AND auth.role() = 'authenticated' );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'patient');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  token_number INTEGER,
  symptoms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments are viewable by involved patient or doctor."
  ON public.appointments FOR SELECT
  USING ( auth.uid() = patient_id OR auth.uid() = doctor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'receptionist') );

CREATE POLICY "Patients can insert appointments."
  ON public.appointments FOR INSERT
  WITH CHECK ( auth.uid() = patient_id );

CREATE POLICY "Doctors and Admins can update appointments."
  ON public.appointments FOR UPDATE
  USING ( auth.uid() = doctor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'receptionist') );


-- 3. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  medicines JSONB NOT NULL, -- [{ name, dosage, morning, afternoon, night, duration }]
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prescriptions are viewable by involved patient or doctor."
  ON public.prescriptions FOR SELECT
  USING ( auth.uid() = patient_id OR auth.uid() = doctor_id );

CREATE POLICY "Only doctors can insert prescriptions."
  ON public.prescriptions FOR INSERT
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'doctor' AND auth.uid() = doctor_id );


-- 4. Medical Records Table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT CHECK (status IN ('normal', 'review')) DEFAULT 'normal',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Records are viewable by involved patient or doctor."
  ON public.medical_records FOR SELECT
  USING ( auth.uid() = patient_id OR auth.uid() = doctor_id );

CREATE POLICY "Patients and doctors can insert records."
  ON public.medical_records FOR INSERT
  WITH CHECK ( auth.uid() = patient_id OR auth.uid() = doctor_id );


-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  attachment_url TEXT,
  attachment_type TEXT CHECK (attachment_type IN ('image', 'pdf', 'report', null)),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages."
  ON public.chat_messages FOR SELECT
  USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

CREATE POLICY "Users can send messages."
  ON public.chat_messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );
  
CREATE POLICY "Users can mark messages as read."
  ON public.chat_messages FOR UPDATE
  USING ( auth.uid() = receiver_id );


-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "System or users can insert notifications."
  ON public.notifications FOR INSERT
  WITH CHECK ( true ); -- Simplification for now

CREATE POLICY "Users can update their notifications."
  ON public.notifications FOR UPDATE
  USING ( auth.uid() = user_id );


-- 7. Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages."
  ON public.contact_messages FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Admins can view contact messages."
  ON public.contact_messages FOR SELECT
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 8. System Metrics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cpu_usage INTEGER NOT NULL,
  memory_usage INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  database_status TEXT NOT NULL,
  server_status TEXT NOT NULL,
  ai_status TEXT NOT NULL,
  storage_usage_gb NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system metrics."
  ON public.system_metrics FOR SELECT
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 9. Branches
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  patients INTEGER DEFAULT 0,
  doctors INTEGER DEFAULT 0,
  revenue TEXT DEFAULT '₹0L',
  status TEXT CHECK (status IN ('open', 'maintenance', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view branches."
  ON public.branches FOR SELECT
  USING ( true );

-- 10. Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages."
  ON public.contact_messages FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Admins can view contact messages."
  ON public.contact_messages FOR SELECT
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false) ON CONFLICT DO NOTHING;

-- Avatars Policies
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own avatars."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Reports Policies
CREATE POLICY "Authenticated users can upload reports."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'reports' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can view their own reports."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'reports' AND auth.uid() = owner );
