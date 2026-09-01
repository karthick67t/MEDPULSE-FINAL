import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardSummary } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Users, AlertTriangle, PhoneCall, TrendingUp, Search, Filter, ArrowRight, Activity, CalendarDays } from 'lucide-react';
import { patientLabel } from '../utils/patient';

const RISK_COLORS = { CRITICAL: 'bg-risk-critical', HIGH: 'bg-risk-high', MEDIUM: 'bg-risk-medium', LOW: 'bg-risk-low' };
const RISK_TEXT = { CRITICAL: 'text-risk-critical', HIGH: 'text-risk-high', MEDIUM: 'text-risk-medium', LOW: 'text-risk-low' };

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { 
      setSummary(await fetchDashboardSummary({})); 
    } catch (err) { 
      setError('Unable to reach your care-operations workspace.'); 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingState message="Loading care operations..." />;
  if (error) return <ErrorState message={error} onRetry={() => loadData()} />;
  if (!summary) return null;

  const totalRisk = (summary.critical_risk || 0) + (summary.high_risk || 0) + (summary.medium_risk || 0) + (summary.low_risk || 0) || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Good morning, Care Team</h1>
        <p className="text-slate-500 mt-1 text-[15px]">Here’s who may need attention before their next follow-up.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="premium-card p-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Patients Monitored</p>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900">{summary.total_patients.toLocaleString()}</span>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+8.4% this month</span>
          </div>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">High Priority</p>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900">{(summary.critical_risk + summary.high_risk).toLocaleString()}</span>
            <span className="text-sm font-medium text-slate-500">{( ((summary.critical_risk + summary.high_risk) / summary.total_patients) * 100 ).toFixed(1)}% of patients</span>
          </div>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Needs Intervention</p>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900">{summary.needs_intervention}</span>
            <span className="text-sm font-medium text-slate-500">{summary.contacted_today} contacted today</span>
          </div>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Predicted Attendance</p>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900">82.4%</span>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+3.1% vs last month</span>
          </div>
        </div>
      </div>

      {/* Intelligence & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="premium-card p-6 lg:col-span-1 bg-slate-900 text-white border-slate-800">
          <h2 className="text-lg font-bold">Today's Follow-up Intelligence</h2>
          <div className="mt-6 space-y-6">
            <div className="flex gap-4 items-start">
              <span className="text-3xl font-bold text-primary-400">{(summary.critical_risk + summary.high_risk)}</span>
              <p className="text-sm text-slate-300 pt-1.5">patients need closer attention before their next visit.</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-3xl font-bold text-primary-400">{summary.needs_intervention}</span>
              <p className="text-sm text-slate-300 pt-1.5">recommended for proactive outreach today.</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-3xl font-bold text-primary-400">23</span>
              <p className="text-sm text-slate-300 pt-1.5">appointments are scheduled within the next 24 hours.</p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-white/10 rounded-lg border border-white/10">
            <p className="text-sm italic text-slate-300">
              "Previous missed appointments are currently the strongest contributor across the high-risk population."
            </p>
          </div>
        </div>

        <div className="premium-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Risk Distribution</h2>
            <p className="text-sm text-slate-500 mt-1">Current population segmented by likelihood of a missed follow-up.</p>
          </div>
          
          <div className="mt-8">
            <div className="flex w-full h-4 rounded-full overflow-hidden mb-4">
              <div style={{ width: `${(summary.low_risk / totalRisk) * 100}%` }} className="bg-risk-low"></div>
              <div style={{ width: `${(summary.medium_risk / totalRisk) * 100}%` }} className="bg-risk-medium"></div>
              <div style={{ width: `${(summary.high_risk / totalRisk) * 100}%` }} className="bg-risk-high"></div>
              <div style={{ width: `${(summary.critical_risk / totalRisk) * 100}%` }} className="bg-risk-critical"></div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-700">Low</span>
                <span className="text-slate-500">{summary.low_risk}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-700">Medium</span>
                <span className="text-slate-500">{summary.medium_risk}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-700">High</span>
                <span className="text-slate-500">{summary.high_risk}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-semibold text-slate-700">Critical</span>
                <span className="text-slate-500">{summary.critical_risk}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Queue */}
      <div className="premium-card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Priority Intervention Queue</h2>
          <p className="text-sm text-slate-500 mt-1">Patients ranked by predicted likelihood of missing their next follow-up.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16 text-center">Rank</th>
                <th>Patient</th>
                <th>Risk</th>
                <th>Top Reason</th>
                <th>Recommended Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.priority_queue.map((patient, index) => (
                <tr key={patient.patient_id} onClick={() => window.location.href = `/patients/${patient.patient_id}`}>
                  <td className="text-center font-semibold text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900">{patientLabel(patient.patient_id)}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{patient.age} yrs</div>
                  </td>
                  <td>
                    <div className={`font-bold ${RISK_TEXT[patient.risk_level]}`}>
                      {patient.risk_level}
                    </div>
                    <div className="text-lg font-bold text-slate-900 leading-none mt-1">
                      {(patient.risk_probability * 100).toFixed(0)}%
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-slate-800">{patient.top_reason}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-slate-700">{patient.recommended_action}</div>
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${patient.intervention_status === 'Pending' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {patient.intervention_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
