import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchPatients, fetchPatientCount } from '../services/api';
import TopBar from '../components/TopBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Users, Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { patientLabel, patientRecordId } from '../utils/patient';

const PAGE_SIZE = 25;

const RISK_BADGE = {
  CRITICAL: 'bg-red-100 text-red-700 ring-red-200',
  HIGH: 'bg-orange-100 text-orange-700 ring-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  LOW: 'bg-green-100 text-green-700 ring-green-200',
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, riskFilter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(0); }, [debouncedSearch, riskFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <TopBar title="Patient records" subtitle={`${total.toLocaleString()} records monitored by this workspace`} />

      <div className="page-shell space-y-6">
        <div className="product-hero p-7 sm:p-9">
          <div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2 mb-4"><span className="h-2 w-2 rounded-full bg-cyan-300" /><p className="eyebrow text-cyan-100/75">Records intelligence</p></div><h2 className="text-3xl sm:text-[38px] leading-[1.08] font-extrabold tracking-[-0.04em]">The follow-up record,<br />made operational.</h2><p className="text-sm sm:text-base text-blue-100/80 mt-4 max-w-lg leading-relaxed">Move from a patient signal to a meaningful next action—without losing the context that matters.</p></div>
          <div className="relative z-10 mt-7 flex flex-wrap gap-3"><span className="px-3 py-1.5 rounded-full bg-white/[0.09] border border-white/[0.12] text-xs font-semibold text-blue-100">{total.toLocaleString()} active records</span><span className="px-3 py-1.5 rounded-full bg-cyan-300/15 border border-cyan-200/20 text-xs font-semibold text-cyan-100">Explainable prioritization</span></div>
        </div>
        <div className="premium-card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="soft-input pl-10 w-full p-3 text-sm"
              placeholder="Search by record ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="soft-input px-4 py-3 text-sm"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {loading ? (
          <LoadingState message="Loading patients..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em]">
                    <th className="px-6 py-3 font-semibold">Record</th>
                    <th className="px-6 py-3 font-semibold">Age</th>
                    <th className="px-6 py-3 font-semibold">Risk Score</th>
                    <th className="px-6 py-3 font-semibold hidden sm:table-cell">Missed Appts</th>
                    <th className="px-6 py-3 font-semibold hidden md:table-cell">Distance</th>
                    <th className="px-6 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map(patient => (
                    <tr key={patient.id} className="group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{patientLabel(patient.id)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{patientRecordId(patient.id)}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{patient.age}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{(patient.risk_probability * 100).toFixed(0)}%</span>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] tracking-wide font-extrabold ring-1 ${RISK_BADGE[patient.risk_level] || ''}`}>
                            {patient.risk_level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{patient.missed_appointments}</td>
                      <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{patient.distance_km.toFixed(1)} km</td>
                      <td className="px-6 py-4">
                        <Link to={`/patients/${patient.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          Review <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {patients.length === 0 && (
                <div className="p-12 text-center text-slate-500">No patients found.</div>
              )}
            </div>

            {/* Pagination */}
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
    </div>
  );
};

export default Patients;
