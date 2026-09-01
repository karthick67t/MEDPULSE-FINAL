import React from 'react';
import { Bell, LogOut, RefreshCw, Search, Command, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopBar = ({ title, subtitle, onRefresh, refreshing }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-[#f7f9fc]/90 backdrop-blur-xl px-6 pt-5 pb-4 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400">Live workspace</span>
        </div>
        {title && <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">{title}</h1>}
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden xl:flex items-center gap-3 w-56 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 text-sm hover:border-slate-300 transition-colors">
          <Search size={16} />
          <span className="flex-1 text-left">Search records</span>
          <span className="flex items-center gap-0.5 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500"><Command size={10} />K</span>
        </button>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        )}

        <button className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center text-slate-950 text-xs font-extrabold">
            {user?.initials || 'U'}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'Staff'}</p>
            <p className="text-xs text-slate-500 flex items-center justify-end gap-1"><Circle size={6} fill="currentColor" className="text-emerald-500" /> Online</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
