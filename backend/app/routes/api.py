from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta
import hashlib

from ..database.connection import get_db
from ..database import models
from ..schemas import schemas
from ..services import ml_service, intervention_engine

router = APIRouter()


def _next_appointment_date(patient_id: str) -> date:
    """Deterministic placeholder schedule for the local synthetic workspace."""
    offset = int(hashlib.sha256(patient_id.encode()).hexdigest()[:4], 16) % 14
    return date.today() + timedelta(days=offset)


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "FollowUpAI API", "version": "1.0.0"}


@router.get("/patients", response_model=List[schemas.PatientWithRisk])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Patient, models.Prediction).join(
        models.Prediction, models.Patient.id == models.Prediction.patient_id
    )

    if risk_level:
        query = query.filter(models.Prediction.risk_level == risk_level.upper())

    if search:
        query = query.filter(models.Patient.id.ilike(f"%{search}%"))

    results = query.order_by(
        models.Prediction.risk_probability.desc()
    ).offset(skip).limit(limit).all()

    patients = []
    for patient, prediction in results:
        patients.append({
            "id": patient.id,
            "age": patient.age,
            "previous_appointments": patient.previous_appointments,
            "missed_appointments": patient.missed_appointments,
            "distance_km": patient.distance_km,
            "treatment_duration_months": patient.treatment_duration_months,
            "appointment_frequency_days": patient.appointment_frequency_days,
            "risk_probability": prediction.risk_probability,
            "risk_level": prediction.risk_level,
        })
    return patients


@router.get("/patients/count")
def count_patients(
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(func.count(models.Patient.id)).join(
        models.Prediction, models.Patient.id == models.Prediction.patient_id
    )
    if risk_level:
        query = query.filter(models.Prediction.risk_level == risk_level.upper())
    if search:
        query = query.filter(models.Patient.id.ilike(f"%{search}%"))
    return {"total": query.scalar()}


@router.get("/patients/{patient_id}", response_model=schemas.PatientDetail)
def read_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("/patients/{patient_id}/prediction")
def get_prediction(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    pred = db.query(models.Prediction).filter(
        models.Prediction.patient_id == patient_id
    ).order_by(models.Prediction.prediction_timestamp.desc()).first()

    if pred:
        return pred
    raise HTTPException(status_code=404, detail="Prediction not found")


@router.get("/patients/{patient_id}/explanation", response_model=schemas.ExplanationResponse)
def get_explanation(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    engine = ml_service.get_explanation_engine()
    patient_data = {
        'age': patient.age,
        'previous_appointments': patient.previous_appointments,
        'missed_appointments': patient.missed_appointments,
        'distance_km': patient.distance_km,
        'treatment_duration_months': patient.treatment_duration_months,
        'appointment_frequency_days': patient.appointment_frequency_days
    }
    return engine.explain_prediction(patient_data)


@router.get("/patients/{patient_id}/recommendations", response_model=List[schemas.Recommendation])
def get_recommendations(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    pred = db.query(models.Prediction).filter(
        models.Prediction.patient_id == patient_id
    ).order_by(models.Prediction.prediction_timestamp.desc()).first()

    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    engine = ml_service.get_explanation_engine()
    patient_data = {
        'age': patient.age,
        'previous_appointments': patient.previous_appointments,
        'missed_appointments': patient.missed_appointments,
        'distance_km': patient.distance_km,
        'treatment_duration_months': patient.treatment_duration_months,
        'appointment_frequency_days': patient.appointment_frequency_days
    }
    explanation = engine.explain_prediction(patient_data)

    return intervention_engine.recommend_interventions(
        patient, pred.risk_level, pred.risk_probability, explanation['top_reasons']
    )


@router.get("/patients/{patient_id}/interventions", response_model=List[schemas.Intervention])
def read_interventions(patient_id: str, db: Session = Depends(get_db)):
    interventions = db.query(models.Intervention).filter(
        models.Intervention.patient_id == patient_id
    ).order_by(models.Intervention.created_at.desc()).all()
    return interventions


@router.post("/patients/{patient_id}/interventions", response_model=schemas.Intervention)
def create_intervention(patient_id: str, intervention: schemas.InterventionBase, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    db_intervention = models.Intervention(**intervention.model_dump(), patient_id=patient_id)
    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)
    return db_intervention


@router.post("/patients/{patient_id}/reminders", response_model=schemas.Intervention)
def queue_reminder(patient_id: str, channel: str = Query(pattern="^(SMS|WhatsApp)$"), db: Session = Depends(get_db)):
    """Queue a simulated reminder only; no external message is delivered from this prototype."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    reminder = models.Intervention(
        patient_id=patient_id,
        action=f"{channel} reminder queued",
        status="Contacted",
        notes=f"Simulated {channel} reminder queued in the local workspace. No external message was sent."
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.patch("/interventions/{intervention_id}", response_model=schemas.Intervention)
def update_intervention(intervention_id: int, intervention_update: schemas.InterventionUpdate, db: Session = Depends(get_db)):
    db_intervention = db.query(models.Intervention).filter(models.Intervention.id == intervention_id).first()
    if db_intervention is None:
        raise HTTPException(status_code=404, detail="Intervention not found")

    for var, value in vars(intervention_update).items():
        if value is not None:
            setattr(db_intervention, var, value)

    db.commit()
    db.refresh(db_intervention)
    return db_intervention


@router.get("/dashboard/summary")
def get_dashboard_summary(
    risk_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db)
):
    total_patients = db.query(models.Patient).count()

    risk_distribution = {}
    for level in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
        count = db.query(models.Prediction).filter(models.Prediction.risk_level == level).count()
        risk_distribution[level] = count

    critical = risk_distribution.get('CRITICAL', 0)
    high = risk_distribution.get('HIGH', 0)
    medium = risk_distribution.get('MEDIUM', 0)
    low = risk_distribution.get('LOW', 0)

    # Intervention stats
    pending_count = db.query(models.Intervention).filter(models.Intervention.status == 'Pending').count()
    contacted_count = db.query(models.Intervention).filter(models.Intervention.status == 'Contacted').count()
    rescheduled_count = db.query(models.Intervention).filter(models.Intervention.status == 'Rescheduled').count()

    # Priority queue
    queue_query = db.query(models.Patient, models.Prediction).join(
        models.Prediction, models.Patient.id == models.Prediction.patient_id
    )

    if risk_filter:
        queue_query = queue_query.filter(models.Prediction.risk_level == risk_filter.upper())

    if search:
        queue_query = queue_query.filter(models.Patient.id.ilike(f"%{search}%"))

    queue = queue_query.order_by(
        models.Prediction.risk_probability.desc()
    ).limit(limit).all()

    engine = ml_service.get_explanation_engine()
    priority_queue = []

    for p, pred in queue:
        patient_data = {
            'age': p.age,
            'previous_appointments': p.previous_appointments,
            'missed_appointments': p.missed_appointments,
            'distance_km': p.distance_km,
            'treatment_duration_months': p.treatment_duration_months,
            'appointment_frequency_days': p.appointment_frequency_days
        }
        exp = engine.explain_prediction(patient_data)
        top_reason = exp["top_reasons"][0]["human_name"] if exp["top_reasons"] else "Unknown"
        top_explanation = exp["top_reasons"][0]["explanation"] if exp["top_reasons"] else ""

        recs = intervention_engine.recommend_interventions(p, pred.risk_level, pred.risk_probability, exp['top_reasons'])
        rec_action = recs[0]["action"] if recs else "None"

        latest_int = db.query(models.Intervention).filter(
            models.Intervention.patient_id == p.id
        ).order_by(models.Intervention.created_at.desc()).first()
        status = latest_int.status if latest_int else "Pending"

        if status_filter and status.lower() != status_filter.lower():
            continue

        priority_queue.append({
            "patient_id": p.id,
            "age": p.age,
            "missed_appointments": p.missed_appointments,
            "distance_km": p.distance_km,
            "risk_probability": pred.risk_probability,
            "risk_level": pred.risk_level,
            "top_reason": top_reason,
            "top_explanation": top_explanation,
            "recommended_action": rec_action,
            "intervention_status": status
        })

    needs_intervention = sum(
        1 for q in priority_queue
        if q["intervention_status"] == "Pending" and q["risk_level"] in ["HIGH", "CRITICAL"]
    )

    # Highest-risk open record, surfaced as the next operational work item.
    top_patient = db.query(models.Patient, models.Prediction).join(
        models.Prediction, models.Patient.id == models.Prediction.patient_id
    ).order_by(models.Prediction.risk_probability.desc()).first()

    next_priority_patient_id = top_patient[0].id if top_patient else None

    return {
        "total_patients": total_patients,
        "critical_risk": critical,
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "needs_intervention": needs_intervention,
        "pending_interventions": pending_count,
        "contacted_today": contacted_count,
        "rescheduled_count": rescheduled_count,
        "risk_distribution": risk_distribution,
        "next_priority_patient_id": next_priority_patient_id,
        "priority_queue": priority_queue
    }


@router.get("/operations/calendar")
def get_operations_calendar(db: Session = Depends(get_db)):
    """Returns a two-week schedule derived deterministically for synthetic records."""
    records = db.query(models.Patient, models.Prediction).join(
        models.Prediction, models.Patient.id == models.Prediction.patient_id
    ).filter(models.Prediction.risk_level.in_(['CRITICAL', 'HIGH'])).order_by(
        models.Prediction.risk_probability.desc()
    ).limit(120).all()
    events = []
    for patient, prediction in records:
        scheduled_for = _next_appointment_date(patient.id)
        events.append({
            "patient_id": patient.id,
            "scheduled_for": scheduled_for.isoformat(),
            "risk_level": prediction.risk_level,
            "risk_probability": prediction.risk_probability,
            "missed_appointments": patient.missed_appointments,
            "time": f"{8 + (int(hashlib.md5(patient.id.encode()).hexdigest()[:2], 16) % 9):02d}:00",
        })
    return {"workspace_mode": "synthetic_schedule", "events": events}


@router.get("/operations/analytics")
def get_operations_analytics(db: Session = Depends(get_db)):
    total = db.query(models.Patient).count()
    pending = db.query(models.Intervention).filter(models.Intervention.status == 'Pending').count()
    contacted = db.query(models.Intervention).filter(models.Intervention.status == 'Contacted').count()
    rescheduled = db.query(models.Intervention).filter(models.Intervention.status == 'Rescheduled').count()
    risk_counts = {level: db.query(models.Prediction).filter(models.Prediction.risk_level == level).count() for level in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']}
    completed = contacted + rescheduled
    return {
        "patients_monitored": total,
        "outreach_pending": pending,
        "outreach_completed": completed,
        "rescheduled": rescheduled,
        "completion_rate": round((completed / (completed + pending) * 100), 1) if completed + pending else 0,
        "risk_counts": risk_counts,
        "workflow": [
            {"stage": "Risk signals", "value": risk_counts['CRITICAL'] + risk_counts['HIGH']},
            {"stage": "Outreach queued", "value": pending},
            {"stage": "Contacted", "value": contacted},
            {"stage": "Rescheduled", "value": rescheduled},
        ]
    }


@router.get("/model/metrics")
def get_model_metrics():
    return ml_service.get_model_metrics()


@router.get("/model/fairness")
def get_model_fairness():
    return ml_service.get_fairness_metrics()
