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
  ArrowLeft, User, AlertTriangle, Info, Clock, MapPin,
  CheckCircle2, Phone, Bell, Calendar, Heart, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { patientLabel, patientRecordId } from '../utils/patient';

const ICON_MAP = { phone: Phone, bell: Bell, map: MapPin, calendar: Calendar, heart: Heart, alert: AlertTriangle, check: CheckCircle2, shield: Shield };

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
  const [reminderLoading, setReminderLoading] = useState('');

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

      const messages = {
        Contacted: 'Patient marked as contacted',
        Rescheduled: 'Appointment rescheduled successfully',
        'Unable to Contact': 'Marked as unable to contact',
      };
      toast.success(messages[status] || 'Status updated');
    } catch (err) {
      toast.error('Failed to update intervention');
      console.error(err);
    } finally {
      setActioning(false);
    }
  };

  const handleReminder = async (channel) => {
    setReminderLoading(channel);
    try {
      await queueReminder(id, channel);
      setInterventions(await fetchPatientInterventions(id));
      toast.success(`${channel} reminder queued (simulation only)`);
    } catch (err) {
      toast.error('Unable to queue reminder');
    } finally {
      setReminderLoading('');
    }
  };

  if (loading) return <LoadingState message="Loading patient profile..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!patient || !explanation) return null;

  const riskColor =
    explanation.base_risk_level === 'CRITICAL' ? 'text-red-600' :
    explanation.base_risk_level === 'HIGH' ? 'text-orange-500' :
    explanation.base_risk_level === 'MEDIUM' ? 'text-yellow-600' :
    'text-green-600';

  const riskBg =
    explanation.base_risk_level === 'CRITICAL' ? 'bg-red-50 border-red-200' :
    explanation.base_risk_level === 'HIGH' ? 'bg-orange-50 border-orange-200' :
    explanation.base_risk_level === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
    'bg-green-50 border-green-200';

  const chartData = explanation.feature_contributions.map(fc => ({
    name: fc.human_name,
    contribution: Math.abs(fc.contribution),
    direction: fc.direction,
  })).sort((a, b) => b.contribution - a.contribution);

  const pendingIntervention = interventions.find(i => i.status === 'Pending');
  const primaryRec = recommendations[0];

  return (
    <div className="max-w-[1440px] mx-auto pb-12">
      <div className="px-5 sm:px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
      </div>

      {/* Profile header */}
      <div className={`mx-5 sm:mx-6 mt-4 bg-white rounded-[28px] shadow-[0_24px_65px_-42px_rgba(15,23,42,0.48)] border overflow-hidden ${
        explanation.base_risk_level === 'CRITICAL' ? 'border-red-200' :
        explanation.base_risk_level === 'HIGH' ? 'border-orange-200' : 'border-slate-100'
      }`}>
        <div className={`relative overflow-hidden px-6 sm:px-8 py-8 ${riskBg} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
          <div className="absolute right-[-40px] top-[-70px] h-52 w-52 rounded-full border-[28px] border-white/55" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{patientLabel(patient.id)}</h1>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-[0.12em] ${
                explanation.base_risk_level === 'CRITICAL' ? 'bg-red-600 text-white' :
                explanation.base_risk_level === 'HIGH' ? 'bg-orange-500 text-white' :
                explanation.base_risk_level === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                'bg-green-600 text-white'
              }`}>
                {explanation.base_risk_level} RISK
              </span>
            </div>
            <p className="text-slate-600 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-slate-500">{patientRecordId(patient.id)}</span>
              <span className="flex items-center gap-1"><User size={15} /> {patient.age} years old</span>
              <span className="flex items-center gap-1"><MapPin size={15} /> {patient.distance_km.toFixed(1)} km from hospital</span>
            </p>
          </div>

          <div className="relative z-10 text-center md:text-right bg-white/90 backdrop-blur p-5 rounded-2xl shadow-sm border border-white/80 min-w-[210px]">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Missed Follow-up Risk</p>
            <p className={`text-5xl font-black tracking-tight ${riskColor} mt-1`}>
              {(explanation.risk_probability * 100).toFixed(0)}%
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-600">
              {explanation.relative_risk_percentile && (
                <span className="font-medium text-slate-700">
                  Top <strong className="text-slate-900">{explanation.relative_risk_percentile}th percentile</strong> risk
                </span>
              )}
              {explanation.confidence_score && (
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                  {explanation.confidence_score}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
          {[
            { label: 'Previous Appointments', value: patient.previous_appointments },
            { label: 'Missed Appointments', value: patient.missed_appointments, highlight: true },
            { label: 'Treatment Duration', value: `${patient.treatment_duration_months} mo` },
            { label: 'Appt Frequency', value: `${patient.appointment_frequency_days} days` },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="p-4 text-center">
              <p className="text-xs text-slate-500 uppercase font-semibold">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Explanations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6 md:p-8">
            <p className="eyebrow mb-1">Explainable intelligence</p>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2 mb-6">
              <Info className="text-blue-500" size={20} /> Why is this patient at risk?
            </h2>
            <div className="space-y-4">
              {explanation.top_reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    reason.direction === 'increases_risk' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-800">{reason.human_name}</h3>
                      {reason.impact_percentage !== undefined && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {reason.impact_percentage}% impact
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1 text-sm leading-relaxed">{reason.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6 md:p-8">
            <p className="eyebrow mb-1">Model signal</p><h2 className="text-xl font-extrabold tracking-tight text-slate-950 mb-6">Feature contributions</h2>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value, _, props) => {
                    const dir = props.payload.direction === 'increases_risk' ? 'Increases Risk' : 'Decreases Risk';
                    return [`${value.toFixed(2)} (${dir})`, 'Impact'];
                  }} />
                  <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={22}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.direction === 'increases_risk' ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <div className="bg-[#101b35] rounded-3xl shadow-[0_20px_55px_-35px_rgba(15,23,42,0.6)] overflow-hidden">
            <div className="bg-white/[0.05] px-6 py-5 border-b border-white/[0.08]">
              <p className="eyebrow text-indigo-200/60 mb-1">Care workflow</p><h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600" /> Recommended Actions
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {(pendingIntervention || primaryRec) && (
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec, idx) => {
                    const Icon = ICON_MAP[rec.icon] || Phone;
                    return (
                      <div key={idx} className={`p-4 rounded-xl border ${
                        idx === 0 ? 'bg-cyan-400/10 border-cyan-300/30 text-white' : 'bg-white/[0.04] border-white/[0.08] text-white'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{rec.action}</p>
                            <p className="text-xs text-slate-300 mt-1">{rec.reason}</p>
                            {idx === 0 && (
                              <span className={`inline-block mt-2 text-xs font-bold uppercase px-2 py-0.5 rounded ${
                                rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {rec.priority} priority
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Outreach notes</label>
                <textarea
                  className="w-full border border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 outline-none transition-all resize-none"
                  rows="3"
                  placeholder="E.g., Patient requested weekend appointment..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction('Contacted')}
                  disabled={actioning}
                  className="bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-extrabold py-3 px-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleAction('Rescheduled')}
                  disabled={actioning}
                  className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  Reschedule
                </button>
              </div>
              <div className="pt-1 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400 mb-2">Reminder simulation</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleReminder('SMS')} disabled={!!reminderLoading} className="border border-white/10 hover:bg-white/[0.06] text-slate-200 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">{reminderLoading === 'SMS' ? 'Queuing…' : 'Queue SMS'}</button>
                  <button onClick={() => handleReminder('WhatsApp')} disabled={!!reminderLoading} className="border border-emerald-300/20 bg-emerald-300/10 hover:bg-emerald-300/15 text-emerald-100 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">{reminderLoading === 'WhatsApp' ? 'Queuing…' : 'Queue WhatsApp'}</button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Simulation only — no message leaves this workspace.</p>
              </div>
              <button
                onClick={() => handleAction('Unable to Contact')}
                disabled={actioning}
                className="w-full border border-white/10 hover:bg-white/[0.06] text-slate-300 font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Unable to Contact
              </button>
            </div>
          </div>

          <div className="premium-card p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-500" /> Intervention History
            </h2>
            <div className="space-y-3">
              {interventions.filter(i => i.status !== 'Pending').length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No past interventions recorded.</p>
              ) : (
                interventions.filter(i => i.status !== 'Pending').map(intv => (
                  <div key={intv.id} className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="font-semibold text-sm text-slate-800">{intv.status}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(intv.updated_at).toLocaleString()}</p>
                    {intv.notes && (
                      <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">{intv.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
