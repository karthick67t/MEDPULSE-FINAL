import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ActivitySquare, Info, Activity, X, ChevronDown, Sparkles, CalendarDays, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Care operations', path: '/', icon: LayoutDashboard },
    { name: 'Patient records', path: '/patients', icon: Users },
    { name: 'Follow-up calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Impact analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Model governance', path: '/model-performance', icon: ActivitySquare },
    { name: 'System & governance', path: '/about', icon: Info },
  ];

  const sidebarContent = (
    <>
      <div className="p-5 pb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Activity size={21} className="text-slate-950" strokeWidth={2.8} />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">FollowUp</span><span className="text-cyan-300 font-bold">AI</span>
            <p className="text-[10px] font-semibold text-slate-500 tracking-[0.18em] uppercase">Care intelligence</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-800">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="px-3 flex-1">
        <button className="w-full mb-7 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-between text-left hover:bg-white/[0.09] transition-colors">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-500">Workspace</p>
            <p className="text-sm font-semibold text-slate-100 truncate">MEDPULSE</p>
          </div>
          <ChevronDown size={15} className="text-slate-400" />
        </button>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.16em] mb-3 px-3">Operations</p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/50'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              <Icon size={19} strokeWidth={2.2} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-cyan-400/10 to-blue-500/10 border border-cyan-300/10">
          <div className="flex items-center gap-2 text-cyan-200">
            <Sparkles size={14} />
            <span className="text-xs font-semibold">AI assistance active</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 mt-1.5">Explanations are ready for every risk signal.</p>
        </div>
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm font-bold text-slate-950">
            {user?.initials || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Staff User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.department || 'Hospital'}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-[#0a1020] text-white min-h-screen flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
