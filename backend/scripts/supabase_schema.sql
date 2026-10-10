-- ============================================================================
-- HealthSense AI — Complete Supabase PostgreSQL Schema & Seeds
-- IEEE 830 / ISO/IEC/IEEE 29148 Standard Compliant
-- Run this script in the Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'patient' NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOCTOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    consultation_fee VARCHAR(50) DEFAULT '$100',
    rating NUMERIC(3, 2) DEFAULT 4.9,
    experience VARCHAR(100) DEFAULT '10 yrs experience',
    available_days VARCHAR(100) DEFAULT 'Mon, Wed, Fri',
    next_slot VARCHAR(100) DEFAULT 'Tomorrow, 10:00 AM',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLINICAL PREDICTIONS & SHAP ATTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disease_type VARCHAR(100) NOT NULL,
    probability DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(100) NOT NULL,
    badge_color VARCHAR(50) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    accuracy_metric VARCHAR(50) NOT NULL,
    input_features JSONB NOT NULL,
    shap_attributions JSONB NOT NULL,
    clinical_advice TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- 4. MEDICAL REPORTS & OCR BIOMARKERS TABLE
CREATE TABLE IF NOT EXISTS medical_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    lab_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(50) DEFAULT 'PDF Document' NOT NULL,
    parsing_status VARCHAR(50) DEFAULT 'completed' NOT NULL,
    target_model VARCHAR(50) DEFAULT 'diabetes' NOT NULL,
    extracted_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_reports_user_id ON medical_reports(user_id);

-- 5. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed' NOT NULL,
    clinical_reason VARCHAR(500) DEFAULT 'Investigative Consultation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);

-- 6. LONGITUDINAL VITALS LOGS TABLE
CREATE TABLE IF NOT EXISTS vitals_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    glucose DOUBLE PRECISION NOT NULL,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    bmi DOUBLE PRECISION NOT NULL,
    water_liters DOUBLE PRECISION DEFAULT 2.0 NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitals_logs_user_id ON vitals_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_logs_logged_at ON vitals_logs(logged_at DESC);

-- ============================================================================
-- BASELINE DEMO CLINICAL SEEDS
-- ============================================================================

-- Patient: Alex Morgan
INSERT INTO users (id, email, password_hash, full_name, role, age, gender)
VALUES (1, 'alex.morgan@healthsense.io', '$2b$12$e8Yj5sZcQpU6yTqY2WdI7u1eFz7kO3aX0jM5nR9tY4uV2wX8zA1mC', 'Alex Morgan', 'patient', 48, 'Male')
ON CONFLICT (id) DO NOTHING;

-- Doctors
INSERT INTO users (id, email, password_hash, full_name, role, age, gender)
VALUES
(2, 'dr.elena@healthsense.io', '$2b$12$e8Yj5sZcQpU6yTqY2WdI7u1eFz7kO3aX0jM5nR9tY4uV2wX8zA1mC', 'Dr. Elena Rostova, MD', 'doctor', 44, 'Female'),
(3, 'dr.marcus@healthsense.io', '$2b$12$e8Yj5sZcQpU6yTqY2WdI7u1eFz7kO3aX0jM5nR9tY4uV2wX8zA1mC', 'Dr. Marcus Vance, FACC', 'doctor', 49, 'Male'),
(4, 'dr.priya@healthsense.io', '$2b$12$e8Yj5sZcQpU6yTqY2WdI7u1eFz7kO3aX0jM5nR9tY4uV2wX8zA1mC', 'Dr. Priya Nair, MD, PhD', 'doctor', 41, 'Female')
ON CONFLICT (id) DO NOTHING;

-- Doctor Profiles
INSERT INTO doctor_profiles (user_id, specialization, hospital_name, license_number, consultation_fee, rating, experience, available_days, next_slot)
VALUES
(2, 'Endocrinology & Metabolic Disorders', 'Metropolitan Academic Medical Center', 'MD-EN-84210', '$120', 4.90, '14 yrs experience', 'Mon, Wed, Fri', 'Tomorrow, 10:30 AM'),
(3, 'Preventive Cardiology & Vascular Health', 'Harborview Heart & Vascular Institute', 'MD-CA-55109', '$150', 4.95, '18 yrs experience', 'Tue, Thu, Sat', 'Thursday, 2:00 PM'),
(4, 'Neurology & Movement Disorders', 'St. Jude Neurological Research Hospital', 'MD-NE-99412', '$165', 4.88, '12 yrs experience', 'Mon, Tue, Thu', 'Friday, 11:15 AM')
ON CONFLICT (user_id) DO NOTHING;

-- Vitals History
INSERT INTO vitals_logs (user_id, glucose, systolic, diastolic, bmi, water_liters, logged_at)
VALUES
(1, 112.0, 128, 82, 28.1, 2.1, NOW() - INTERVAL '6 days'),
(1, 118.0, 130, 84, 28.0, 2.4, NOW() - INTERVAL '5 days'),
(1, 124.0, 132, 85, 27.9, 1.8, NOW() - INTERVAL '4 days'),
(1, 121.0, 129, 83, 27.9, 2.5, NOW() - INTERVAL '3 days'),
(1, 135.0, 134, 86, 27.8, 2.0, NOW() - INTERVAL '2 days'),
(1, 128.0, 131, 84, 27.8, 2.6, NOW() - INTERVAL '1 day'),
(1, 132.0, 133, 85, 27.8, 2.2, NOW());

-- Confirmed Consultation
INSERT INTO appointments (patient_id, doctor_id, scheduled_date, scheduled_time, status, clinical_reason)
VALUES (1, 2, CURRENT_DATE + INTERVAL '2 days', '10:30 AM', 'Confirmed', 'Comprehensive Glycemic Review (Pre-diabetic Investigation)')
ON CONFLICT DO NOTHING;

-- OCR Report Specimen
INSERT INTO medical_reports (user_id, title, lab_name, file_type, parsing_status, target_model, extracted_data)
VALUES (
    1,
    'Comprehensive Metabolic Panel (CMP)',
    'BioReference Diagnostics — Core Chemistry',
    'PDF (Digital Scan)',
    'completed',
    'diabetes',
    '[
      {"key": "Fasting Blood Glucose", "value": "136", "unit": "mg/dL", "normalRange": "70 - 99", "confidence": 98, "flag": "Elevated", "modelKey": "glucose"},
      {"key": "Estimated HbA1c", "value": "6.8", "unit": "%", "normalRange": "4.0 - 5.6", "confidence": 96, "flag": "Elevated"},
      {"key": "Systolic Blood Pressure", "value": "132", "unit": "mmHg", "normalRange": "90 - 119", "confidence": 94, "flag": "Prehypertension", "modelKey": "bloodPressure"},
      {"key": "Body Mass Index (Calculated)", "value": "28.4", "unit": "kg/m²", "normalRange": "18.5 - 24.9", "confidence": 99, "flag": "Overweight", "modelKey": "bmi"},
      {"key": "Fasting Serum Insulin", "value": "24", "unit": "µU/mL", "normalRange": "2.6 - 24.9", "confidence": 92, "flag": "Borderline", "modelKey": "insulin"}
    ]'::jsonb
)
ON CONFLICT DO NOTHING;
