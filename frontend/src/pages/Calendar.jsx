import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ArrowRight, Sparkles } from 'lucide-react';
import { fetchOperationsCalendar } from '../services/api';
import TopBar from '../components/TopBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { patientLabel } from '../utils/patient';

const levelStyle = { CRITICAL: 'bg-rose-50 text-rose-700 border-rose-100', HIGH: 'bg-orange-50 text-orange-700 border-orange-100' };
const dateKey = (date) => date.toISOString().slice(0, 10);

const Calendar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const load = async () => {
    setLoading(true); setError(null);
    try { setData(await fetchOperationsCalendar()); } catch (err) { setError('Unable to load the follow-up schedule.'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const days = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0); today.setDate(today.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => { const day = new Date(today); day.setDate(today.getDate() + index); return day; });
  }, [weekOffset]);
  const eventsByDay = useMemo(() => (data?.events || []).reduce((map, event) => { (map[event.scheduled_for] ||= []).push(event); return map; }, {}), [data]);
  const weekLabel = `${days[0]?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${days[6]?.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  if (loading) return <LoadingState message="Building follow-up calendar..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div>
    <TopBar title="Follow-up calendar" subtitle="Plan outreach around the appointments that carry the most risk." />
    <div className="page-shell space-y-6">
      <section className="product-hero p-7 sm:p-9"><div className="relative z-10 flex flex-col lg:flex-row gap-6 justify-between lg:items-end"><div><p className="eyebrow text-cyan-100/75 mb-3">Care scheduling</p><h2 className="text-3xl sm:text-[38px] leading-[1.08] font-extrabold tracking-[-0.04em]">Every next visit,<br />in the right order.</h2><p className="text-blue-100/80 max-w-xl mt-4 text-sm sm:text-base">Bring upcoming high-risk follow-ups into one focused outreach plan—before they become missed care.</p></div><div className="rounded-2xl bg-white/[0.09] border border-white/[0.13] px-4 py-3"><div className="flex items-center gap-2 text-cyan-100"><Sparkles size={15} /><span className="text-xs font-bold uppercase tracking-[0.12em]">Schedule intelligence</span></div><p className="text-xs text-slate-300 mt-1">Synthetic schedule for local workspace</p></div></div></section>
      <section className="premium-card overflow-hidden"><div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"><div><p className="eyebrow">Week view</p><h2 className="text-xl font-extrabold tracking-tight text-slate-950 mt-1">{weekLabel}</h2></div><div className="flex items-center gap-2"><button onClick={() => setWeekOffset((value) => value - 1)} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"><ChevronLeft size={18} /></button><button onClick={() => setWeekOffset(0)} className="px-3 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-bold">Today</button><button onClick={() => setWeekOffset((value) => value + 1)} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"><ChevronRight size={18} /></button></div></div>
        <div className="overflow-x-auto"><div className="grid grid-cols-7 min-w-[920px] border-b border-slate-100">{days.map((day) => <div key={dateKey(day)} className="px-4 py-4 border-r border-slate-100 last:border-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{day.toLocaleDateString(undefined, { weekday: 'short' })}</p><p className={`text-2xl font-extrabold mt-1 ${dateKey(day) === dateKey(new Date()) ? 'text-blue-600' : 'text-slate-900'}`}>{day.getDate()}</p></div>)}</div><div className="grid grid-cols-7 min-w-[920px] min-h-[440px]">{days.map((day) => { const events = eventsByDay[dateKey(day)] || []; return <div key={dateKey(day)} className="p-3 border-r border-slate-100 last:border-0 space-y-2 bg-white">{events.length ? events.slice(0, 5).map((event) => <Link key={event.patient_id} to={`/patients/${event.patient_id}`} className={`block p-3 rounded-xl border transition-transform hover:-translate-y-0.5 ${levelStyle[event.risk_level]}`}><div className="flex items-center justify-between gap-1"><span className="text-[10px] font-extrabold tracking-wide">{event.risk_level}</span><span className="text-[10px] flex items-center gap-1"><Clock3 size={10} />{event.time}</span></div><p className="text-sm font-bold text-slate-800 mt-2">{patientLabel(event.patient_id)}</p><p className="text-[11px] text-slate-500 mt-1">{(event.risk_probability * 100).toFixed(0)}% risk · {event.missed_appointments} missed</p></Link>) : <div className="h-20 rounded-xl border border-dashed border-slate-200 bg-slate-50/50" />}{events.length > 5 && <p className="text-xs text-blue-600 font-bold px-2">+{events.length - 5} more</p>}</div>; })}</div></div></section>
      <p className="text-xs text-slate-400 flex items-center gap-1.5"><CalendarDays size={14} /> Appointment dates are a deterministic simulation in this synthetic workspace; connect your scheduling system for production use.</p>
    </div>
  </div>;
};

export default Calendar;
