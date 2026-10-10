from datetime import datetime, date, timedelta, timezone
from sqlalchemy.future import select
from app.db.session import engine, AsyncSessionLocal, Base
from app.models import User, DoctorProfile, Prediction, MedicalReport, Appointment, VitalsLog
from app.core.security import get_password_hash


async def init_database():
    """Create all relational tables and seed baseline clinical entities."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if users already seeded
        result = await session.execute(select(User).where(User.email == "alex.morgan@healthsense.io"))
        existing_patient = result.scalars().first()

        if existing_patient:
            return  # Already seeded

        print("[*] Seeding initial clinical database entities...")

        # 1. Seed Patient User
        patient = User(
            email="alex.morgan@healthsense.io",
            password_hash=get_password_hash("ClinicalSecure2024!"),
            full_name="Alex Morgan",
            role="patient",
            age=48,
            gender="Male"
        )
        session.add(patient)
        await session.flush()

        # 2. Seed Doctors (SRS §7.0 Doctors Table)
        doc1_user = User(
            email="dr.elena@healthsense.io",
            password_hash=get_password_hash("DoctorSecure2024!"),
            full_name="Dr. Elena Rostova, MD",
            role="doctor",
            age=44,
            gender="Female"
        )
        session.add(doc1_user)
        await session.flush()

        doc1_profile = DoctorProfile(
            user_id=doc1_user.id,
            specialization="Endocrinology & Metabolic Disorders",
            hospital_name="Metropolitan Academic Medical Center",
            license_number="MD-EN-48201",
            consultation_fee="$120",
            rating=4.9,
            experience="14 yrs experience",
            available_days="Mon, Wed, Fri",
            next_slot="Tomorrow, 10:30 AM"
        )
        session.add(doc1_profile)

        doc2_user = User(
            email="dr.marcus@healthsense.io",
            password_hash=get_password_hash("DoctorSecure2024!"),
            full_name="Dr. Marcus Vance, FACC",
            role="doctor",
            age=52,
            gender="Male"
        )
        session.add(doc2_user)
        await session.flush()

        doc2_profile = DoctorProfile(
            user_id=doc2_user.id,
            specialization="Preventive Cardiology & Vascular Health",
            hospital_name="Harborview Heart & Vascular Institute",
            license_number="MD-CV-19284",
            consultation_fee="$150",
            rating=4.95,
            experience="18 yrs experience",
            available_days="Tue, Thu, Sat",
            next_slot="Thursday, 2:00 PM"
        )
        session.add(doc2_profile)

        doc3_user = User(
            email="dr.priya@healthsense.io",
            password_hash=get_password_hash("DoctorSecure2024!"),
            full_name="Dr. Priya Nair, MD, PhD",
            role="doctor",
            age=41,
            gender="Female"
        )
        session.add(doc3_user)
        await session.flush()

        doc3_profile = DoctorProfile(
            user_id=doc3_user.id,
            specialization="Neurology & Movement Disorders",
            hospital_name="St. Jude Neurological Research Hospital",
            license_number="MD-NE-99412",
            consultation_fee="$165",
            rating=4.88,
            experience="12 yrs experience",
            available_days="Mon, Tue, Thu",
            next_slot="Friday, 11:15 AM"
        )
        session.add(doc3_profile)

        # 3. Seed Baseline Vitals History for Patient (Last 7 Days)
        now = datetime.now(timezone.utc)
        vitals_samples = [
            (6, 112.0, 128, 82, 28.1, 2.1),
            (5, 118.0, 130, 84, 28.0, 2.4),
            (4, 124.0, 132, 85, 27.9, 1.8),
            (3, 121.0, 129, 83, 27.9, 2.5),
            (2, 135.0, 134, 86, 27.8, 2.0),
            (1, 128.0, 131, 84, 27.8, 2.6),
            (0, 132.0, 133, 85, 27.8, 2.2),
        ]
        for days_ago, gl, sys_bp, dia_bp, bmi_val, water in vitals_samples:
            session.add(VitalsLog(
                user_id=patient.id,
                glucose=gl,
                systolic=sys_bp,
                diastolic=dia_bp,
                bmi=bmi_val,
                water_liters=water,
                logged_at=now - timedelta(days=days_ago)
            ))

        # 4. Seed Confirmed Appointment
        session.add(Appointment(
            patient_id=patient.id,
            doctor_id=doc1_user.id,
            scheduled_date=date.today() + timedelta(days=2),
            scheduled_time="10:30 AM",
            status="Confirmed",
            clinical_reason="Comprehensive Glycemic Review (Pre-diabetic Investigation)"
        ))

        # 5. Seed Medical Report (OCR Specimen)
        session.add(MedicalReport(
            user_id=patient.id,
            title="Comprehensive Metabolic Panel (CMP)",
            lab_name="BioReference Diagnostics — Core Chemistry",
            file_type="PDF (Digital Scan)",
            parsing_status="completed",
            target_model="diabetes",
            extracted_data=[
                {"key": "Fasting Blood Glucose", "value": "136", "unit": "mg/dL", "normalRange": "70 - 99", "confidence": 98, "flag": "Elevated", "modelKey": "glucose"},
                {"key": "Estimated HbA1c", "value": "6.8", "unit": "%", "normalRange": "4.0 - 5.6", "confidence": 96, "flag": "Elevated"},
                {"key": "Systolic Blood Pressure", "value": "132", "unit": "mmHg", "normalRange": "90 - 119", "confidence": 94, "flag": "Prehypertension", "modelKey": "bloodPressure"},
                {"key": "Body Mass Index", "value": "28.4", "unit": "kg/m²", "normalRange": "18.5 - 24.9", "confidence": 99, "flag": "Overweight", "modelKey": "bmi"},
                {"key": "Fasting Serum Insulin", "value": "24", "unit": "µU/mL", "normalRange": "2.6 - 24.9", "confidence": 92, "flag": "Borderline", "modelKey": "insulin"}
            ]
        ))

        # 6. Seed Baseline Prediction
        session.add(Prediction(
            user_id=patient.id,
            disease_type="Diabetes Mellitus",
            probability=46.3,
            risk_level="Moderate (Pre-diabetic)",
            badge_color="amber",
            model_name="SVM (RBF Kernel)",
            accuracy_metric="92%",
            input_features={"glucose": 134, "bmi": 27.8, "blood_pressure": 132, "insulin": 22, "age": 48, "pregnancies": 0},
            shap_attributions=[
                {"name": "Fasting Glucose", "value": 25.9, "baseline": "70-99 mg/dL", "current": "134 mg/dL"},
                {"name": "Body Mass Index", "value": 8.3, "baseline": "18.5-24.9 kg/m²", "current": "27.8 kg/m²"}
            ],
            clinical_advice="Borderline glucose or metabolic indices. Lifestyle intervention and 90-day glycemic re-evaluation recommended."
        ))

        await session.commit()
        print("[OK] Clinical database entities seeded successfully!")
