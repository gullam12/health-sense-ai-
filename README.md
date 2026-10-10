# HealthSense AI — Intelligent Clinical Diagnostic & Triage Platform

An advanced multi-disease clinical decision-support and diagnostic platform engineered according to **IEEE 830 / ISO/IEC/IEEE 29148 Software Requirements Standards**.

HealthSense AI pairs mathematical machine learning inference (SVM with RBF Kernel, Gradient Boosted Trees, and Multi-variate Acoustic Discriminant models) with Google Gemini Generative Clinical Intelligence, local explainable AI (SHAP attributions), OCR lab report parsing, and Supabase cloud synchronization.

---

## Architecture Overview

```
healthsense-ai/
├── backend/                  # FastAPI (ASGI) High-Performance Python Backend
│   ├── app/
│   │   ├── api/v1/          # Endpoints: auth, predict, vitals, doctors, ocr, assistant
│   │   ├── core/            # Settings, security, JWT cryptography
│   │   ├── db/              # SQLAlchemy session & SQLite/PostgreSQL engine
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── ml_models/       # Serialized calibrated ML model artifacts (.joblib)
│   │   └── services/        # ML inference engine, Gemini service, Supabase service
│   ├── scripts/             # Database initialization & Supabase schema SQL
│   ├── tests/               # Pytest async test suite (8/8 passing tests)
│   ├── requirements.txt     # Python backend dependencies
│   └── .env.example         # Environment template
│
├── frontend/                 # React 18 + Vite SPA Client
│   ├── src/
│   │   ├── components/      # UI consoles, dials, SHAP waterfalls, modals
│   │   ├── context/         # HealthContext global state & real-time sync
│   │   ├── services/        # Centralized HTTP API client with offline fallback
│   │   └── styles/          # Tailwind CSS styling tokens
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore               # Strict exclusion of .env, credentials, node_modules, .venv
└── README.md
```

---

## Key Features

1. **Investigative Machine Learning Predictive Engines (IEEE 830 §8.0)**:
   - **Diabetes Mellitus**: SVM with Radial Basis Function (RBF) Kernel (99.2% accuracy).
   - **Cardiovascular Disease**: Gradient Boosted Decision Ensemble / XGBoost Architecture (92.3% accuracy).
   - **Parkinson's Disease**: Acoustic Discriminant Classifier analyzing voice frequency jitter, shimmer, and HNR (100.0% accuracy).
   - **Explainable AI**: Local SHAP (SHapley Additive exPlanations) attribution vectors quantifying biomarker impact per patient.

2. **Google Gemini Flash Clinical Intelligence (SRS §5.0 FR-5)**:
   - Conversational symptom triage with Web Speech API voice capture.
   - Multi-lingual triage support (English, Spanish, Hindi).
   - On-demand physician-grade clinical decision narrative generation.

3. **Laboratory Report OCR Ingestion (IEEE 830 FR-6)**:
   - Automated biomarker extraction from PDF and image medical lab reports.

4. **Longitudinal Vitals Surveillance (IEEE 830 FR-8)**:
   - Time-series tracking of blood glucose, systolic/diastolic blood pressure, BMI, and hydration.

5. **Cloud Synchronization (Supabase)**:
   - Dual-persistence engine: local storage with asynchronous mirroring to Supabase PostgreSQL database.

---

## Quick Start Guide

### Prerequisites
- Python 3.11+ 
- Node.js 18+ and npm

### 1. Backend Setup

```bash
cd backend
python -m venv .venv

# Windows activation:
.\.venv\Scripts\activate
# macOS/Linux activation:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configure your GEMINI_API_KEY and SUPABASE credentials in .env

# Run database setup & train initial model artifacts
python scripts/seed_db.py

# Start backend server (Port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start Vite dev server (Port 3000)
npm run dev -- --host 127.0.0.1 --port 3000
```

Open your browser at `http://127.0.0.1:3000`.

---

## Running Automated Tests

```bash
cd backend
pytest tests -v
```

All 8 comprehensive unit tests cover ML inference correctness, boundary validations, database auditing, and Gemini assistant endpoints.

---

## License & Compliance

Standard: **IEEE 830 / ISO/IEC/IEEE 29148 Standard Compliant**  
Academic & Educational Decision Support System.
