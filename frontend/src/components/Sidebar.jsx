import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ActivitySquare, Info, Activity, X, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Calendar', path: '/calendar', icon: Activity },
  ];

  const intelligenceItems = [
    { name: 'Model', path: '/model-performance', icon: ActivitySquare },
    { name: 'Analytics', path: '/analytics', icon: ActivitySquare },
  ];

  const systemItems = [
    { name: 'About', path: '/about', icon: Info },
  ];

  const renderNavGroup = (items, label) => (
    <div className="mb-6">
      {label && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">{label}</p>}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} className={({ isActive }) => isActive ? "text-primary-600" : "text-slate-400"} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-50 border-r border-slate-200 min-h-screen flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center">
              <Activity size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">FollowUpAI</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 text-slate-500 hover:bg-slate-200 rounded">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {renderNavGroup(navItems, 'FollowUp AI')}
          {renderNavGroup(intelligenceItems, 'Intelligence')}
          {renderNavGroup(systemItems, 'System')}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            System OK
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
