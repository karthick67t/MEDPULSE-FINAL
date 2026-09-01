import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Clock3, Users, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { fetchOperationsAnalytics } from '../services/api';
import TopBar from '../components/TopBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const Analytics = () => {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
  const load = async () => { setLoading(true); setError(null); try { setData(await fetchOperationsAnalytics()); } catch (err) { setError('Unable to load impact analytics.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <LoadingState message="Calculating operational impact..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const metrics = [
    { label: 'Patients monitored', value: data.patients_monitored, icon: Users, tone: 'text-blue-600 bg-blue-50', note: 'Active follow-up population' },
    { label: 'Outreach pending', value: data.outreach_pending, icon: Clock3, tone: 'text-amber-600 bg-amber-50', note: 'Requires staff action' },
    { label: 'Outreach completed', value: data.outreach_completed, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50', note: 'Logged care-team outcomes' },
    { label: 'Completion rate', value: `${data.completion_rate}%`, icon: ArrowUpRight, tone: 'text-indigo-600 bg-indigo-50', note: 'Across queued outreach' },
  ];
  return <div><TopBar title="Impact analytics" subtitle="Measure the work that turns a risk signal into a protected follow-up." />
    <div className="page-shell space-y-6"><section className="product-hero p-7 sm:p-9"><div className="relative z-10"><p className="eyebrow text-cyan-100/75 mb-3">Operational impact</p><h2 className="text-3xl sm:text-[38px] leading-[1.08] font-extrabold tracking-[-0.04em]">Make follow-up<br />care measurable.</h2><p className="text-blue-100/80 max-w-xl mt-4 text-sm sm:text-base">Track the progression from risk identification to outreach and recovery—so every intervention has an accountable outcome.</p></div></section>
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{metrics.map(({ label, value, icon: Icon, tone, note }) => <div key={label} className="premium-card p-5"><div className="flex justify-between"><p className="text-sm font-semibold text-slate-600">{label}</p><span className={`p-2.5 rounded-xl ${tone}`}><Icon size={18} /></span></div><p className="text-3xl font-extrabold tracking-tight text-slate-950 mt-5">{typeof value === 'number' ? value.toLocaleString() : value}</p><p className="text-xs text-slate-400 mt-2">{note}</p></div>)}</section>
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6"><div className="premium-card xl:col-span-3 p-6 sm:p-7"><p className="eyebrow">Workflow conversion</p><h2 className="text-xl font-extrabold tracking-tight text-slate-950 mt-1">From risk to recovery</h2><p className="text-sm text-slate-500 mt-1">Each stage identifies where the care team can improve follow-up completion.</p><div className="h-[300px] mt-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.workflow} layout="vertical" margin={{ left: 5, right: 25 }}><XAxis type="number" hide /><YAxis type="category" dataKey="stage" width={112} tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f1f5f9' }} /><Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>{data.workflow.map((entry, index) => <Cell key={entry.stage} fill={['#f43f5e', '#f59e0b', '#2563eb', '#10b981'][index]} />)}</Bar></BarChart></ResponsiveContainer></div></div><div className="premium-card xl:col-span-2 p-6 sm:p-7"><p className="eyebrow">Risk coverage</p><h2 className="text-xl font-extrabold tracking-tight text-slate-950 mt-1">Population snapshot</h2><div className="mt-6 space-y-4">{Object.entries(data.risk_counts).map(([level, count]) => <div key={level}><div className="flex justify-between text-sm"><span className="font-semibold text-slate-600 capitalize">{level.toLowerCase()} risk</span><span className="font-extrabold text-slate-950">{count.toLocaleString()}</span></div><div className="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden"><div className={{ CRITICAL: 'bg-rose-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-amber-400', LOW: 'bg-emerald-500' }[level] + ' h-full rounded-full'} style={{ width: `${Math.max(4, count / data.patients_monitored * 100)}%` }} /></div></div>)}</div><div className="mt-7 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-3"><ShieldCheck className="text-emerald-600 shrink-0" size={19} /><p className="text-xs leading-relaxed text-emerald-900">Analytics reflect local synthetic-workspace activity. Connect audited outreach and appointment systems before using impact measures operationally.</p></div></div></section>
    </div></div>;
};
export default Analytics;
