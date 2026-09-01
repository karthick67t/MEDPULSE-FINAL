# FollowUpAI

**Predict Early. Explain Clearly. Intervene Sooner.**

FollowUpAI is a full-stack SaaS-style healthcare decision-support platform that identifies patients likely to miss follow-up appointments, explains exactly why they are at risk, and recommends targeted interventions for hospital staff.

## Problem Statement (PS-01)

Hospitals lose track of patients who need follow-up visits. A missed follow-up is not just an empty slot — it is treatment left incomplete and a condition left to worsen.

> **Core Principle:** "A risk score on its own is not enough: every prediction must carry the reasons that produced it, because a nurse acts on reasons, not on a number."

## Solution

| Capability | Implementation |
|---|---|
| **Predict** | Logistic Regression classifier trained on 3,500 synthetic patient records |
| **Rank** | Priority Intervention Queue sorted by risk probability |
| **Explain** | Coefficient-based feature contributions with nurse-friendly language |
| **Intervene** | Rule-based engine linking risk factors to actionable outreach steps |
| **Track** | Staff logs contact outcomes (Contacted, Rescheduled, Unable to Contact) |

## Key Features

- **Staff Login** — Role-based sign-in (Care Coordinator, Head Nurse, Operations Director)
- **Dashboard** — KPIs, risk distribution chart, intervention pipeline, filterable priority queue
- **Explainable ML** — Top 3 reasons per patient in plain language nurses can act on
- **Intervention Engine** — Transport support, phone outreach, scheduling review recommendations
- **Patient Directory** — Searchable, paginated list with risk scores
- **Model Validation** — Test-set metrics + fairness analysis by age subgroup
- **Mobile Responsive** — Collapsible sidebar for tablet/phone use

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Recharts, React Hot Toast |
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| ML | scikit-learn, pandas, Logistic Regression |

## Quick Start

### 1. Backend
```bash
cd backend
py -3.12 -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 2. ML Pipeline & Database
```bash
cd ml
py -3.12 generate_data.py
py -3.12 train.py
py -3.12 evaluate.py
cd ../backend
py -3.12 app/database/seed.py --reset
```

### 3. Start Backend
```bash
cd backend
py -3.12 app/main.py
# API → http://localhost:8000
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
# App → http://localhost:5173
```

## Care-operations workflow

1. **Access workspace** — Choose a care-operations role.
2. **Review queue** — Start with the next highest-risk open record.
3. **Understand risk** — Review the risk score, plain-language reasons, and contribution chart.
4. **Take action** — Review a targeted outreach recommendation and log the outcome.
5. **Govern the model** — Review validation and fairness metrics before relying on scores.

## Dataset

Synthetic dataset of 3,500 patients. No real PHI/PII.

**Features:** age, previous_appointments, missed_appointments, distance_km, treatment_duration_months, appointment_frequency_days

**Target:** missed_next_followup (0 = attended, 1 = missed)

## Disclaimer

FollowUpAI is a decision-support product. Risk scores are model-estimated likelihoods, not clinical diagnoses. Predictions support — not replace — professional staff judgment. This repository uses synthetic records only; production use requires appropriate privacy, security, clinical-governance, and regulatory controls.
