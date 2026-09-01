import os
import sys
import argparse
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml')))

from app.database.connection import SessionLocal, engine
from app.database import models
from app.services import intervention_engine
from explain import ExplanationEngine


def seed_database(reset=False):
    print("Seeding database...")

    if reset:
        print("Resetting database tables...")
        models.Base.metadata.drop_all(bind=engine)

    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not reset and db.query(models.Patient).first():
        print("Database already seeded. Use --reset to re-seed.")
        db.close()
        return

    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'data', 'synthetic_patients.csv'))
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Run ml/generate_data.py first.")
        db.close()
        return

    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'model.joblib'))
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found. Run ml/train.py first.")
        db.close()
        return

    # Keep local hackathon/demo startup fast and deterministic. The source file
    # can contain a large historical export, but the UI is designed around a
    # representative 3,500-patient demo cohort.
    demo_size = 3500
    df = pd.read_csv(data_path).sample(n=demo_size, random_state=42).reset_index(drop=True)
    explainer = ExplanationEngine(model_path)

    print(f"Inserting {len(df)} patients...")
    intervention_count = 0

    for idx, row in df.iterrows():
        patient = models.Patient(
            id=row['patient_id'],
            age=int(row['age']),
            previous_appointments=int(row['previous_appointments']),
            missed_appointments=int(row['missed_appointments']),
            distance_km=float(row['distance_km']),
            treatment_duration_months=int(row['treatment_duration_months']),
            appointment_frequency_days=int(row['appointment_frequency_days'])
        )
        db.add(patient)

        patient_data = {
            'age': patient.age,
            'previous_appointments': patient.previous_appointments,
            'missed_appointments': patient.missed_appointments,
            'distance_km': patient.distance_km,
            'treatment_duration_months': patient.treatment_duration_months,
            'appointment_frequency_days': patient.appointment_frequency_days
        }

        explanation = explainer.explain_prediction(patient_data)

        prediction = models.Prediction(
            patient_id=patient.id,
            risk_probability=explanation['risk_probability'],
            risk_level=explanation['base_risk_level'],
            prediction_timestamp=datetime.utcnow()
        )
        db.add(prediction)

        # Seed pending interventions for HIGH and CRITICAL patients
        if explanation['base_risk_level'] in ('HIGH', 'CRITICAL'):
            recs = intervention_engine.recommend_interventions(
                patient,
                explanation['base_risk_level'],
                explanation['risk_probability'],
                explanation['top_reasons']
            )
            primary = recs[0]
            intervention = models.Intervention(
                patient_id=patient.id,
                action=primary['action'],
                status='Pending',
                notes=f"Auto-generated: {primary['reason']}",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(intervention)
            intervention_count += 1

        if idx > 0 and idx % 500 == 0:
            print(f"Inserted {idx} records...")
            db.commit()

    db.commit()
    print(f"Database seeded successfully. {intervention_count} pending interventions created.")
    db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--reset', action='store_true', help='Clear and re-seed the database')
    args = parser.parse_args()
    seed_database(reset=args.reset)
