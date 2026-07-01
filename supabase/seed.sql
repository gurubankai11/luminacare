-- ============================================================
-- LuminaCare V6 — Development Seed Data
-- IDEMPOTENT: Safe to run multiple times (uses ON CONFLICT).
-- All seed UUIDs use prefix 00000000-0000-4000-a000-*
-- To remove all seed data: DELETE FROM profiles WHERE id::text LIKE '00000000-0000-4000-a000-%';
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- BRANCHES (5)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.branches (id, name, address, city, phone, status) VALUES
  ('00000000-0000-4000-a000-000000000b01', 'LuminaCare Central', 'MG Road, Connaught Place', 'New Delhi', '+91 11 2345 6789', 'open'),
  ('00000000-0000-4000-a000-000000000b02', 'LuminaCare South', 'Koramangala 4th Block', 'Bangalore', '+91 80 2345 6789', 'open'),
  ('00000000-0000-4000-a000-000000000b03', 'LuminaCare West', 'Bandra West, Hill Road', 'Mumbai', '+91 22 2345 6789', 'open'),
  ('00000000-0000-4000-a000-000000000b04', 'LuminaCare East', 'Salt Lake Sector V', 'Kolkata', '+91 33 2345 6789', 'open'),
  ('00000000-0000-4000-a000-000000000b05', 'LuminaCare South-East', 'T Nagar, Usman Road', 'Chennai', '+91 44 2345 6789', 'open')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- AUTH USERS (REQUIRED FOR FOREIGN KEY CONSTRAINTS)
-- ────────────────────────────────────────────────────────────
-- We must insert into auth.users first. The 'on_auth_user_created' trigger
-- will automatically create 'patient' profiles for these users.
-- We then UPDATE the profiles in the next steps.
-- Password for all seeded users is: Password@123

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  -- Doctors (10)
  ('00000000-0000-4000-a000-000000000d01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arjun.mehta@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Arjun Mehta"}'),
  ('00000000-0000-4000-a000-000000000d02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.sharma@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Priya Sharma"}'),
  ('00000000-0000-4000-a000-000000000d03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kavitha.nair@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Kavitha Nair"}'),
  ('00000000-0000-4000-a000-000000000d04', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh.kumar@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Rajesh Kumar"}'),
  ('00000000-0000-4000-a000-000000000d05', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'suresh.patel@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Suresh Patel"}'),
  ('00000000-0000-4000-a000-000000000d06', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'meena.iyer@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Meena Iyer"}'),
  ('00000000-0000-4000-a000-000000000d07', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anil.gupta@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Anil Gupta"}'),
  ('00000000-0000-4000-a000-000000000d08', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lakshmi.v@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Lakshmi Venkatesh"}'),
  ('00000000-0000-4000-a000-000000000d09', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vikram.singh@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Vikram Singh"}'),
  ('00000000-0000-4000-a000-000000000d10', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sneha.reddy@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Sneha Reddy"}'),
  -- Admin (1)
  ('00000000-0000-4000-a000-000000000a01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "System Admin"}'),
  -- Reception (1)
  ('00000000-0000-4000-a000-000000000c01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reception@luminacare.dev', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Priya Reception"}'),
  -- Patients (15)
  ('00000000-0000-4000-a000-000000000e01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ananya@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ananya Krishnan"}'),
  ('00000000-0000-4000-a000-000000000e02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sanjay.v@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sanjay Verma"}'),
  ('00000000-0000-4000-a000-000000000e03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'meera.p@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Meera Pillai"}'),
  ('00000000-0000-4000-a000-000000000e04', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rahul.c@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Rahul Chopra"}'),
  ('00000000-0000-4000-a000-000000000e05', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'deepa.n@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deepa Nair"}'),
  ('00000000-0000-4000-a000-000000000e06', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vikash.y@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Vikash Yadav"}'),
  ('00000000-0000-4000-a000-000000000e07', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sunita.d@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sunita Devi"}'),
  ('00000000-0000-4000-a000-000000000e08', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amit.j@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Amit Joshi"}'),
  ('00000000-0000-4000-a000-000000000e09', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fatima.k@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Fatima Khan"}'),
  ('00000000-0000-4000-a000-000000000e10', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ravi.s@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ravi Shankar"}'),
  ('00000000-0000-4000-a000-000000000e11', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pooja.m@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Pooja Malhotra"}'),
  ('00000000-0000-4000-a000-000000000e12', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'karthik.r@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Karthik Rajan"}'),
  ('00000000-0000-4000-a000-000000000e13', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nisha.a@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Nisha Agarwal"}'),
  ('00000000-0000-4000-a000-000000000e14', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manoj.t@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Manoj Tiwari"}'),
  ('00000000-0000-4000-a000-000000000e15', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'divya.s@example.com', crypt('Password@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Divya Saxena"}')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DOCTOR PROFILES (10)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, name, email, phone, role, gender, specialty, qualification, experience_years, consultation_fee, bio, branch_id, available_days, available_times, is_active) VALUES
  ('00000000-0000-4000-a000-000000000d01', 'Dr. Arjun Mehta', 'arjun.mehta@luminacare.dev', '+91 98100 10001', 'doctor', 'male', 'General Physician', 'MBBS, MD (Internal Medicine)', 12, 500, 'Experienced general physician with focus on preventive care and chronic disease management.', '00000000-0000-4000-a000-000000000b01', '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]', '["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30"]', true),
  ('00000000-0000-4000-a000-000000000d02', 'Dr. Priya Sharma', 'priya.sharma@luminacare.dev', '+91 98100 10002', 'doctor', 'female', 'Cardiologist', 'MBBS, DM (Cardiology), FACC', 15, 800, 'Board-certified cardiologist specializing in interventional cardiology and heart failure management.', '00000000-0000-4000-a000-000000000b01', '["Monday","Wednesday","Friday"]', '["10:00","10:30","11:00","11:30","14:00","14:30"]', true),
  ('00000000-0000-4000-a000-000000000d03', 'Dr. Kavitha Nair', 'kavitha.nair@luminacare.dev', '+91 98100 10003', 'doctor', 'female', 'Dermatologist', 'MBBS, MD (Dermatology)', 8, 600, 'Expert in cosmetic dermatology, skin cancer screening, and chronic skin conditions.', '00000000-0000-4000-a000-000000000b02', '["Monday","Tuesday","Thursday","Friday"]', '["09:00","09:30","10:00","10:30","11:00"]', true),
  ('00000000-0000-4000-a000-000000000d04', 'Dr. Rajesh Kumar', 'rajesh.kumar@luminacare.dev', '+91 98100 10004', 'doctor', 'male', 'Pediatrician', 'MBBS, DCH, DNB (Pediatrics)', 10, 500, 'Compassionate pediatrician dedicated to child health from newborns to adolescents.', '00000000-0000-4000-a000-000000000b02', '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00"]', true),
  ('00000000-0000-4000-a000-000000000d05', 'Dr. Suresh Patel', 'suresh.patel@luminacare.dev', '+91 98100 10005', 'doctor', 'male', 'Orthopedic', 'MBBS, MS (Ortho), Fellowship (Sports Medicine)', 18, 700, 'Leading orthopedic surgeon with expertise in joint replacement and sports injuries.', '00000000-0000-4000-a000-000000000b03', '["Tuesday","Wednesday","Thursday","Saturday"]', '["10:00","10:30","11:00","14:00","14:30","15:00"]', true),
  ('00000000-0000-4000-a000-000000000d06', 'Dr. Meena Iyer', 'meena.iyer@luminacare.dev', '+91 98100 10006', 'doctor', 'female', 'Neurologist', 'MBBS, DM (Neurology)', 14, 900, 'Specialist in stroke care, epilepsy management, and neurodegenerative diseases.', '00000000-0000-4000-a000-000000000b03', '["Monday","Wednesday","Friday"]', '["09:00","09:30","10:00","10:30"]', true),
  ('00000000-0000-4000-a000-000000000d07', 'Dr. Anil Gupta', 'anil.gupta@luminacare.dev', '+91 98100 10007', 'doctor', 'male', 'ENT', 'MBBS, MS (ENT)', 9, 500, 'Experienced ENT surgeon handling sinus, hearing, and throat disorders.', '00000000-0000-4000-a000-000000000b04', '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '["09:00","09:30","10:00","14:00","14:30"]', true),
  ('00000000-0000-4000-a000-000000000d08', 'Dr. Lakshmi Venkatesh', 'lakshmi.v@luminacare.dev', '+91 98100 10008', 'doctor', 'female', 'Gynecologist', 'MBBS, MS (OBG), DNB', 16, 800, 'Comprehensive women''s health specialist with expertise in high-risk pregnancies.', '00000000-0000-4000-a000-000000000b04', '["Monday","Wednesday","Thursday","Saturday"]', '["10:00","10:30","11:00","14:00","14:30","15:00"]', true),
  ('00000000-0000-4000-a000-000000000d09', 'Dr. Vikram Singh', 'vikram.singh@luminacare.dev', '+91 98100 10009', 'doctor', 'male', 'Ophthalmologist', 'MBBS, MS (Ophthalmology), FICO', 11, 600, 'Expert in cataract surgery, LASIK, and retinal diseases.', '00000000-0000-4000-a000-000000000b05', '["Monday","Tuesday","Thursday","Friday"]', '["09:00","09:30","10:00","10:30","11:00"]', true),
  ('00000000-0000-4000-a000-000000000d10', 'Dr. Sneha Reddy', 'sneha.reddy@luminacare.dev', '+91 98100 10010', 'doctor', 'female', 'Psychiatrist', 'MBBS, MD (Psychiatry)', 7, 700, 'Empathetic psychiatrist focusing on anxiety, depression, and behavioral therapy.', '00000000-0000-4000-a000-000000000b05', '["Monday","Wednesday","Friday","Saturday"]', '["10:00","10:30","11:00","14:00","14:30"]', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, specialty = EXCLUDED.specialty, qualification = EXCLUDED.qualification,
  experience_years = EXCLUDED.experience_years, consultation_fee = EXCLUDED.consultation_fee,
  bio = EXCLUDED.bio, branch_id = EXCLUDED.branch_id, role = EXCLUDED.role;

-- ────────────────────────────────────────────────────────────
-- ADMIN PROFILE (1) — admin@luminacare.dev
-- ────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, name, email, phone, role, gender) VALUES
  ('00000000-0000-4000-a000-000000000a01', 'System Admin', 'admin@luminacare.dev', '+91 98100 00001', 'admin', 'male')
ON CONFLICT (id) DO UPDATE SET role = 'admin', name = EXCLUDED.name;

-- ────────────────────────────────────────────────────────────
-- RECEPTION PROFILE (1)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, name, email, phone, role, gender) VALUES
  ('00000000-0000-4000-a000-000000000c01', 'Priya Reception', 'reception@luminacare.dev', '+91 98100 00002', 'reception', 'female')
ON CONFLICT (id) DO UPDATE SET role = 'reception', name = EXCLUDED.name;

-- ────────────────────────────────────────────────────────────
-- PATIENT PROFILES (15 representative)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, name, email, phone, role, gender, age, blood_group, address, city, allergies, medical_history) VALUES
  ('00000000-0000-4000-a000-000000000e01', 'Ananya Krishnan', 'ananya@example.com', '+91 98200 20001', 'patient', 'female', 28, 'B+', '45 MG Road', 'New Delhi', '["Penicillin"]', 'No major conditions'),
  ('00000000-0000-4000-a000-000000000e02', 'Sanjay Verma', 'sanjay.v@example.com', '+91 98200 20002', 'patient', 'male', 45, 'O+', '12 Lajpat Nagar', 'New Delhi', '[]', 'Hypertension, controlled with medication'),
  ('00000000-0000-4000-a000-000000000e03', 'Meera Pillai', 'meera.p@example.com', '+91 98200 20003', 'patient', 'female', 32, 'A+', '78 Indiranagar', 'Bangalore', '["Sulfa drugs"]', 'Asthma, seasonal'),
  ('00000000-0000-4000-a000-000000000e04', 'Rahul Chopra', 'rahul.c@example.com', '+91 98200 20004', 'patient', 'male', 55, 'AB+', '23 Bandra East', 'Mumbai', '[]', 'Type 2 Diabetes, knee osteoarthritis'),
  ('00000000-0000-4000-a000-000000000e05', 'Deepa Nair', 'deepa.n@example.com', '+91 98200 20005', 'patient', 'female', 38, 'B-', '56 Salt Lake', 'Kolkata', '["Aspirin"]', 'Migraine'),
  ('00000000-0000-4000-a000-000000000e06', 'Vikash Yadav', 'vikash.y@example.com', '+91 98200 20006', 'patient', 'male', 62, 'O-', '90 T Nagar', 'Chennai', '[]', 'COPD, previous cardiac stent'),
  ('00000000-0000-4000-a000-000000000e07', 'Sunita Devi', 'sunita.d@example.com', '+91 98200 20007', 'patient', 'female', 42, 'A-', '34 Sector 17', 'Chandigarh', '[]', 'Thyroid disorder'),
  ('00000000-0000-4000-a000-000000000e08', 'Amit Joshi', 'amit.j@example.com', '+91 98200 20008', 'patient', 'male', 29, 'B+', '67 Civil Lines', 'Jaipur', '["Latex"]', 'None'),
  ('00000000-0000-4000-a000-000000000e09', 'Fatima Khan', 'fatima.k@example.com', '+91 98200 20009', 'patient', 'female', 35, 'O+', '12 Charminar Area', 'Hyderabad', '[]', 'PCOS'),
  ('00000000-0000-4000-a000-000000000e10', 'Ravi Shankar', 'ravi.s@example.com', '+91 98200 20010', 'patient', 'male', 50, 'AB-', '45 MG Road', 'Pune', '["Ibuprofen"]', 'Gout, hypertension'),
  ('00000000-0000-4000-a000-000000000e11', 'Pooja Malhotra', 'pooja.m@example.com', '+91 98200 20011', 'patient', 'female', 25, 'A+', '89 Vasant Kunj', 'New Delhi', '[]', 'None'),
  ('00000000-0000-4000-a000-000000000e12', 'Karthik Rajan', 'karthik.r@example.com', '+91 98200 20012', 'patient', 'male', 40, 'B+', '23 Adyar', 'Chennai', '[]', 'Lower back pain'),
  ('00000000-0000-4000-a000-000000000e13', 'Nisha Agarwal', 'nisha.a@example.com', '+91 98200 20013', 'patient', 'female', 48, 'O+', '56 Park Street', 'Kolkata', '["Codeine"]', 'Rheumatoid arthritis'),
  ('00000000-0000-4000-a000-000000000e14', 'Manoj Tiwari', 'manoj.t@example.com', '+91 98200 20014', 'patient', 'male', 33, 'A-', '78 Andheri West', 'Mumbai', '[]', 'Anxiety disorder'),
  ('00000000-0000-4000-a000-000000000e15', 'Divya Saxena', 'divya.s@example.com', '+91 98200 20015', 'patient', 'female', 27, 'B-', '34 Whitefield', 'Bangalore', '[]', 'None')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age, blood_group = EXCLUDED.blood_group;

-- ────────────────────────────────────────────────────────────
-- APPOINTMENTS (mixed statuses, today + recent)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.appointments (id, appointment_number, patient_id, doctor_id, branch_id, date, time, symptoms, status, queue_token) VALUES
  ('00000000-0000-4000-a000-0000000a1001', 'LC-001', '00000000-0000-4000-a000-000000000e01', '00000000-0000-4000-a000-000000000d01', '00000000-0000-4000-a000-000000000b01', CURRENT_DATE, '09:00', 'Fever and cold since 3 days', 'completed', 1),
  ('00000000-0000-4000-a000-0000000a1002', 'LC-002', '00000000-0000-4000-a000-000000000e02', '00000000-0000-4000-a000-000000000d02', '00000000-0000-4000-a000-000000000b01', CURRENT_DATE, '09:30', 'Chest pain on exertion', 'completed', 2),
  ('00000000-0000-4000-a000-0000000a1003', 'LC-003', '00000000-0000-4000-a000-000000000e03', '00000000-0000-4000-a000-000000000d01', '00000000-0000-4000-a000-000000000b01', CURRENT_DATE, '10:00', 'Breathing difficulty', 'in_progress', 3),
  ('00000000-0000-4000-a000-0000000a1004', 'LC-004', '00000000-0000-4000-a000-000000000e04', '00000000-0000-4000-a000-000000000d01', '00000000-0000-4000-a000-000000000b01', CURRENT_DATE, '10:30', 'Knee pain follow-up', 'pending', 4),
  ('00000000-0000-4000-a000-0000000a1005', 'LC-005', '00000000-0000-4000-a000-000000000e05', '00000000-0000-4000-a000-000000000d01', '00000000-0000-4000-a000-000000000b01', CURRENT_DATE, '11:00', 'Severe headache', 'pending', 5),
  ('00000000-0000-4000-a000-0000000a1006', 'LC-006', '00000000-0000-4000-a000-000000000e06', '00000000-0000-4000-a000-000000000d02', '00000000-0000-4000-a000-000000000b01', CURRENT_DATE, '10:00', 'Routine cardiac checkup', 'pending', 3),
  ('00000000-0000-4000-a000-0000000a1007', 'LC-007', '00000000-0000-4000-a000-000000000e07', '00000000-0000-4000-a000-000000000d04', '00000000-0000-4000-a000-000000000b02', CURRENT_DATE, '09:00', 'Child vaccination', 'confirmed', 1),
  ('00000000-0000-4000-a000-0000000a1008', 'LC-008', '00000000-0000-4000-a000-000000000e01', '00000000-0000-4000-a000-000000000d02', '00000000-0000-4000-a000-000000000b01', CURRENT_DATE + INTERVAL '3 days', '14:00', 'Follow-up cardiac consultation', 'confirmed', 1),
  ('00000000-0000-4000-a000-0000000a1009', 'LC-009', '00000000-0000-4000-a000-000000000e08', '00000000-0000-4000-a000-000000000d03', '00000000-0000-4000-a000-000000000b02', CURRENT_DATE - INTERVAL '2 days', '10:00', 'Skin rash on arms', 'completed', 1),
  ('00000000-0000-4000-a000-0000000a1010', 'LC-010', '00000000-0000-4000-a000-000000000e09', '00000000-0000-4000-a000-000000000d08', '00000000-0000-4000-a000-000000000b04', CURRENT_DATE - INTERVAL '1 day', '11:00', 'Monthly PCOS follow-up', 'completed', 2)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- PRESCRIPTIONS
-- ────────────────────────────────────────────────────────────
INSERT INTO public.prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, medicines, instructions) VALUES
  ('00000000-0000-4000-a000-0000000f0001', '00000000-0000-4000-a000-0000000a1001', '00000000-0000-4000-a000-000000000d01', '00000000-0000-4000-a000-000000000e01', 'Viral Fever with Upper Respiratory Infection',
   '[{"name":"Paracetamol 500mg","dosage":"1 tablet","morning":true,"afternoon":true,"night":true,"duration":"5 days"},{"name":"Cetirizine 10mg","dosage":"1 tablet","morning":false,"afternoon":false,"night":true,"duration":"5 days"},{"name":"Vitamin C 500mg","dosage":"1 tablet","morning":true,"afternoon":false,"night":false,"duration":"10 days"}]',
   'Take plenty of fluids. Rest for 2 days. Follow up if fever persists beyond 5 days.'),
  ('00000000-0000-4000-a000-0000000f0002', '00000000-0000-4000-a000-0000000a1002', '00000000-0000-4000-a000-000000000d02', '00000000-0000-4000-a000-000000000e02', 'Stable Angina',
   '[{"name":"Amlodipine 5mg","dosage":"1 tablet","morning":true,"afternoon":false,"night":false,"duration":"30 days"},{"name":"Aspirin 75mg","dosage":"1 tablet","morning":false,"afternoon":true,"night":false,"duration":"30 days"},{"name":"Atorvastatin 20mg","dosage":"1 tablet","morning":false,"afternoon":false,"night":true,"duration":"30 days"}]',
   'Avoid heavy physical exertion. Low salt diet. Follow up in 2 weeks with ECG.'),
  ('00000000-0000-4000-a000-0000000f0003', '00000000-0000-4000-a000-0000000a1009', '00000000-0000-4000-a000-000000000d03', '00000000-0000-4000-a000-000000000e08', 'Contact Dermatitis',
   '[{"name":"Hydrocortisone Cream 1%","dosage":"Apply thin layer","morning":true,"afternoon":false,"night":true,"duration":"7 days"},{"name":"Loratadine 10mg","dosage":"1 tablet","morning":false,"afternoon":false,"night":true,"duration":"7 days"}]',
   'Avoid contact with irritants. Use fragrance-free soap. Apply moisturizer after cream.')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- REPORTS
-- ────────────────────────────────────────────────────────────
INSERT INTO public.reports (id, patient_id, doctor_id, appointment_id, name, report_type, status) VALUES
  ('00000000-0000-4000-a000-0000000ab001', '00000000-0000-4000-a000-000000000e01', '00000000-0000-4000-a000-000000000d01', '00000000-0000-4000-a000-0000000a1001', 'Complete Blood Count', 'blood_test', 'normal'),
  ('00000000-0000-4000-a000-0000000ab002', '00000000-0000-4000-a000-000000000e02', '00000000-0000-4000-a000-000000000d02', '00000000-0000-4000-a000-0000000a1002', 'ECG Report', 'ecg', 'review'),
  ('00000000-0000-4000-a000-0000000ab003', '00000000-0000-4000-a000-000000000e02', '00000000-0000-4000-a000-000000000d02', '00000000-0000-4000-a000-0000000a1002', 'Lipid Profile', 'blood_test', 'normal'),
  ('00000000-0000-4000-a000-0000000ab004', '00000000-0000-4000-a000-000000000e04', '00000000-0000-4000-a000-000000000d05', NULL, 'Knee X-Ray (AP/Lateral)', 'xray', 'review'),
  ('00000000-0000-4000-a000-0000000ab005', '00000000-0000-4000-a000-000000000e06', '00000000-0000-4000-a000-000000000d02', NULL, 'Chest X-Ray', 'xray', 'normal'),
  ('00000000-0000-4000-a000-0000000ab006', '00000000-0000-4000-a000-000000000e09', '00000000-0000-4000-a000-000000000d08', '00000000-0000-4000-a000-0000000a1010', 'Hormonal Panel', 'blood_test', 'review')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
INSERT INTO public.notifications (id, user_id, title, message, type, read) VALUES
  ('00000000-0000-4000-a000-0000000cc001', '00000000-0000-4000-a000-000000000e01', 'Appointment Confirmed', 'Your appointment with Dr. Arjun Mehta has been confirmed for today at 9:00 AM.', 'appointment', true),
  ('00000000-0000-4000-a000-0000000cc002', '00000000-0000-4000-a000-000000000e01', 'Prescription Ready', 'Dr. Arjun Mehta has created a new prescription for you. View it in your dashboard.', 'prescription', false),
  ('00000000-0000-4000-a000-0000000cc003', '00000000-0000-4000-a000-000000000e01', 'Report Available', 'Your Complete Blood Count report is now available for review.', 'report', false),
  ('00000000-0000-4000-a000-0000000cc004', '00000000-0000-4000-a000-000000000e02', 'Follow-up Reminder', 'Your follow-up ECG appointment is scheduled. Please arrive 15 minutes early.', 'appointment', false),
  ('00000000-0000-4000-a000-0000000cc005', '00000000-0000-4000-a000-000000000d01', 'New Appointment', 'You have a new appointment request from Meera Pillai for today at 10:00 AM.', 'appointment', false),
  ('00000000-0000-4000-a000-0000000cc006', '00000000-0000-4000-a000-000000000d01', 'Queue Update', '5 patients are currently in your queue for today.', 'queue', true),
  ('00000000-0000-4000-a000-0000000cc007', '00000000-0000-4000-a000-000000000a01', 'System Alert', 'All systems operational. Database backup completed successfully.', 'system', false),
  ('00000000-0000-4000-a000-0000000cc008', '00000000-0000-4000-a000-000000000c01', 'Walk-in Patient', 'New walk-in patient registered: Ravi Shankar. Token #6 generated.', 'queue', false)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SYSTEM METRICS (initial)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.system_metrics (id, cpu_usage, memory_usage, active_users, database_status, server_status, ai_status, storage_usage_gb) VALUES
  ('00000000-0000-4000-a000-0000000dd001', 42, 58, 87, 'healthy', 'healthy', 'healthy', 8.4)
ON CONFLICT (id) DO NOTHING;
