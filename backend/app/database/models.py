from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime

from .connection import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True) # e.g. P00001
    age = Column(Integer)
    previous_appointments = Column(Integer)
    missed_appointments = Column(Integer)
    distance_km = Column(Float)
    treatment_duration_months = Column(Integer)
    appointment_frequency_days = Column(Integer)

    
    predictions = relationship("Prediction", back_populates="patient")
    interventions = relationship("Intervention", back_populates="patient")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    risk_probability = Column(Float)
    risk_level = Column(String)
    prediction_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="predictions")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    action = Column(String)
    status = Column(String) # Pending, Contacted, Rescheduled, Completed, Unable to Contact
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="interventions")
