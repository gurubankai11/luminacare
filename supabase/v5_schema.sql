-- Supabase Schema for LuminaCare V5

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Phase 7)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT CHECK (role IN ('patient', 'doctor', 'admin', 'receptionist')) DEFAULT 'patient',
  gender TEXT,
  dob DATE,
  blood_group TEXT,
  height TEXT,
  weight TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  insurance JSONB,
  allergies JSONB,
  medical_history TEXT,
  avatar TEXT,
  emergency_contact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. DOCTORS (Phase 9)
CREATE TABLE IF NOT EXISTS public.doctors (
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT,
  experience TEXT,
  qualification TEXT,
  hospital TEXT,
  rating NUMERIC DEFAULT 0,
  available_days JSONB,
  available_slots JSONB,
  profile_image TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors are viewable by everyone" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update their own profile" ON public.doctors FOR UPDATE USING (auth.uid() = doctor_id);

-- 3. APPOINTMENTS (Phase 8)
CREATE TABLE IF NOT EXISTS public.appointments (
  appointment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
  department TEXT,
  hospital_branch TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  symptoms TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  queue_token INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Appointments viewable by involved parties" ON public.appointments FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin'));
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Involved parties can update appointments" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin'));

-- 4. MESSAGES (Phase 10)
CREATE TABLE IF NOT EXISTS public.messages (
  message_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages viewable by sender and receiver" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Sender can create messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can update read status" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- 5. NOTIFICATIONS (Phase 11)
CREATE TABLE IF NOT EXISTS public.notifications (
  notification_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications viewable by owner" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can update read status" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- 6. PRESCRIPTIONS (Phase 12)
CREATE TABLE IF NOT EXISTS public.prescriptions (
  prescription_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  medicine JSONB NOT NULL,
  dosage TEXT,
  instructions TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prescriptions viewable by involved parties" ON public.prescriptions FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() = doctor_id);

-- 7. REPORTS (Phase 13)
CREATE TABLE IF NOT EXISTS public.reports (
  report_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
  file TEXT NOT NULL,
  report_type TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by involved parties" ON public.reports FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "Patients and Doctors can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- 8. QUEUE (Phase 14)
CREATE TABLE IF NOT EXISTS public.queue (
  queue_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(appointment_id) ON DELETE CASCADE,
  token INTEGER NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'serving', 'completed', 'cancelled')) DEFAULT 'waiting',
  arrival_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Queue viewable by everyone" ON public.queue FOR SELECT USING (true);
CREATE POLICY "Doctors and Admins can update queue" ON public.queue FOR UPDATE USING (auth.uid() = doctor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'receptionist'));
CREATE POLICY "System can insert queue" ON public.queue FOR INSERT WITH CHECK (true);

-- Ensure replication is enabled for realtime tables
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table queue;
