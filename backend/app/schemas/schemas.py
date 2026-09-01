from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class PatientBase(BaseModel):
    id: str
    age: int
    previous_appointments: int
    missed_appointments: int
    distance_km: float
    treatment_duration_months: int
    appointment_frequency_days: int


class PatientCreate(PatientBase):
    pass


class Patient(PatientBase):
    model_config = {"from_attributes": True}


class PatientWithRisk(PatientBase):
    risk_probability: float
    risk_level: str


class InterventionBase(BaseModel):
    action: str
    status: str
    notes: Optional[str] = None


class InterventionCreate(InterventionBase):
    patient_id: str


class InterventionUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class Intervention(InterventionBase):
    id: int
    patient_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Prediction(BaseModel):
    id: int
    patient_id: str
    risk_probability: float
    risk_level: str
    prediction_timestamp: datetime

    model_config = {"from_attributes": True}


class FeatureContribution(BaseModel):
    feature: str
    human_name: str
    patient_value: float
    contribution: float
    impact_percentage: Optional[float] = None
    direction: str
    explanation: str


class ExplanationResponse(BaseModel):
    risk_probability: float
    base_risk_level: str
    relative_risk_percentile: Optional[float] = None
    confidence_score: Optional[str] = None
    top_reasons: List[FeatureContribution]
    feature_contributions: List[FeatureContribution]


class Recommendation(BaseModel):
    action: str
    reason: str
    priority: str
    category: str
    icon: str


class PatientDetail(Patient):
    predictions: List[Prediction] = []
    interventions: List[Intervention] = []

    model_config = {"from_attributes": True}

