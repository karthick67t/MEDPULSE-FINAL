import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPatients, fetchPatientCount } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { patientLabel, patientRecordId } from '../utils/patient';

const PAGE_SIZE = 25;

const RISK_TEXT = {
  CRITICAL: 'text-risk-critical',
  HIGH: 'text-risk-high',
  MEDIUM: 'text-risk-medium',
  LOW: 'text-risk-low',
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (riskFilter) params.risk_level = riskFilter;

      const [data, countData] = await Promise.all([
        fetchPatients(page * PAGE_SIZE, PAGE_SIZE, params),
        fetchPatientCount(params),
      ]);
      setPatients(data);
      setTotal(countData.total);
    } catch (err) {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, riskFilter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(0); }, [debouncedSearch, riskFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Patient Records</h1>
        <p className="text-slate-500 mt-1 text-[15px]">{total.toLocaleString()} records monitored by this workspace.</p>
      </div>

      <div className="premium-card p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="soft-input pl-10 w-full py-2.5"
            placeholder="Search by patient ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400 ml-2" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="soft-input py-2.5 w-full sm:w-48"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading patient records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Risk Level</th>
                  <th>Missed Appts</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id} onClick={() => navigate(`/patients/${patient.id}`)}>
                    <td>
                      <p className="font-semibold text-slate-900">{patientLabel(patient.id)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{patientRecordId(patient.id)}</p>
                    </td>
                    <td>{patient.age}</td>
                    <td>
                      <span className={`font-bold ${RISK_TEXT[patient.risk_level]}`}>
                        {patient.risk_level}
                      </span>
                      <span className="text-slate-500 ml-2 font-medium">
                        {(patient.risk_probability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td>
                      {patient.missed_appointments > 0 ? (
                        <span className="text-red-600 font-medium">{patient.missed_appointments}</span>
                      ) : (
                        <span className="text-slate-400">{patient.missed_appointments}</span>
                      )}
                    </td>
                    <td>{patient.distance_km.toFixed(1)} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patients.length === 0 && (
              <div className="p-12 text-center text-slate-500">No patients found matching the criteria.</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-700 px-2">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Patients;
