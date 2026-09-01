import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchPatientDetails, fetchPatientExplanation,
  fetchPatientInterventions, fetchPatientRecommendations,
  createIntervention, updateInterventionStatus
} from '../services/api';
import { queueReminder } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  ArrowLeft, AlertTriangle, Info, Clock, MapPin,
  Phone, Bell, Calendar, Heart, Shield, CheckCircle
} from 'lucide-react';
import { patientLabel, patientRecordId } from '../utils/patient';

const ICON_MAP = { phone: Phone, bell: Bell, map: MapPin, calendar: Calendar, heart: Heart, alert: AlertTriangle, check: CheckCircle, shield: Shield };

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [actioning, setActioning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pData, eData, rData, iData] = await Promise.all([
        fetchPatientDetails(id),
        fetchPatientExplanation(id),
        fetchPatientRecommendations(id),
        fetchPatientInterventions(id),
      ]);
      setPatient(pData);
      setExplanation(eData);
      setRecommendations(rData);
      setInterventions(iData);
    } catch (err) {
      setError('Failed to load patient data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (status) => {
    setActioning(true);
    try {
      const pending = interventions.find(i => i.status === 'Pending');
      const primaryRec = recommendations[0];

      if (pending) {
        await updateInterventionStatus(pending.id, { status, notes: newNote || undefined });
      } else {
        await createIntervention(id, {
          action: primaryRec?.action || 'Staff outreach',
          status,
          notes: newNote || undefined,
        });
      }

      const iData = await fetchPatientInterventions(id);
      setInterventions(iData);
      setNewNote('');
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update intervention');
    } finally {
      setActioning(false);
    }
  };

  if (loading) return <LoadingState message="Loading patient profile..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!patient || !explanation) return null;

  const riskColor = 
    explanation.base_risk_level === 'CRITICAL' ? 'text-risk-critical' :
    explanation.base_risk_level === 'HIGH' ? 'text-risk-high' :
    explanation.base_risk_level === 'MEDIUM' ? 'text-risk-medium' :
    'text-risk-low';

  const pendingIntervention = interventions.find(i => i.status === 'Pending');
  const primaryRec = recommendations[0];

  return (
    <div className="space-y-8">
      <div>
        <Link to="/patients" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-4">
          <ArrowLeft size={16} className="mr-1.5" /> Back to Patients
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Patient {patientRecordId(patient.id)}</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">{patientLabel(patient.id)}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Risk Score */}
          <div className="premium-card p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Follow-up Risk Assessment</h2>
              <p className="text-slate-500 mt-2 text-sm">Predicted likelihood of missing next follow-up</p>
              <div className="mt-6 flex items-center gap-4">
                <span className={`text-6xl font-black tracking-tight ${riskColor}`}>
                  {(explanation.risk_probability * 100).toFixed(0)}%
                </span>
                <div>
                  <span className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-md ${
                    explanation.base_risk_level === 'CRITICAL' ? 'bg-red-50 text-red-700' :
                    explanation.base_risk_level === 'HIGH' ? 'bg-orange-50 text-orange-700' :
                    explanation.base_risk_level === 'MEDIUM' ? 'bg-amber-50 text-amber-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {explanation.base_risk_level} RISK
                  </span>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Prediction generated today</p>
                </div>
              </div>
            </div>
            
            <div className="md:border-l border-slate-200 md:pl-8">
              <h3 className="font-bold text-slate-900 mb-4">Patient Profile</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Age</p>
                  <p className="font-semibold text-slate-800">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Distance</p>
                  <p className="font-semibold text-slate-800">{patient.distance_km.toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Previous Appts</p>
                  <p className="font-semibold text-slate-800">{patient.previous_appointments}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Missed Appts</p>
                  <p className="font-semibold text-red-600">{patient.missed_appointments}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Treatment</p>
                  <p className="font-semibold text-slate-800">{patient.treatment_duration_months} months</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Frequency</p>
                  <p className="font-semibold text-slate-800">Every {patient.appointment_frequency_days} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Section */}
          <div className="premium-card p-8">
            <h2 className="text-2xl font-bold text-slate-900">Why is this patient at risk?</h2>
            <p className="text-slate-500 mt-1 mb-8">The model identified these factors as the strongest contributors to this prediction.</p>
            
            <div className="space-y-6">
              {explanation.top_reasons.map((reason, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-light text-slate-300">0{idx + 1}</span>
                    <div>
                      <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{reason.human_name}</h3>
                      <p className="text-slate-600 text-sm mt-0.5">{reason.explanation}</p>
                    </div>
                  </div>
                  <div className="ml-12">
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${reason.direction === 'increases_risk' ? 'bg-risk-critical' : 'bg-risk-low'}`} 
                        style={{ width: `${Math.min(100, Math.max(10, (reason.impact_percentage || 50)))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {reason.direction === 'increases_risk' ? 'Strong contribution to risk' : 'Reduces risk'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Intervention Panel */}
          <div className="premium-card border-primary-200 shadow-md">
            <div className="p-6 border-b border-slate-100 bg-primary-50">
              <h2 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                Recommended next step
              </h2>
            </div>
            
            <div className="p-6">
              {primaryRec && (
                <div className="mb-6">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm mb-2">
                    {primaryRec.action}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {primaryRec.reason}
                  </p>
                </div>
              )}
              
              <div className="mb-6">
                <textarea
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none"
                  rows="3"
                  placeholder="Add outreach notes..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleAction('Contacted')}
                  disabled={actioning}
                  className="btn-primary flex-1"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleAction('Rescheduled')}
                  disabled={actioning}
                  className="btn-secondary flex-1"
                >
                  Reschedule
                </button>
              </div>
              <button
                onClick={() => handleAction('Unable to Contact')}
                disabled={actioning}
                className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700 py-2 transition-colors"
              >
                Mark Unable to Contact
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="premium-card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Intervention History</h2>
            <div className="space-y-0">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                </div>
                <div className="pb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Today</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">Risk assessment generated</p>
                  <p className="text-xs text-slate-500">{explanation.base_risk_level} risk detected</p>
                </div>
              </div>

              {interventions.filter(i => i.status !== 'Pending').map((intv, idx, arr) => (
                <div key={intv.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    {idx !== arr.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                  </div>
                  <div className="pb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      {new Date(intv.updated_at).toLocaleDateString()}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm mt-1">
                      {intv.status === 'Contacted' ? 'Patient contacted' : 
                       intv.status === 'Rescheduled' ? 'Appointment rescheduled' : intv.status}
                    </p>
                    {intv.notes && (
                      <p className="text-sm text-slate-600 mt-1 italic">Note: {intv.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
