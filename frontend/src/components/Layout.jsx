import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, User } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Overview';
      case '/patients': return 'Patients';
      case '/interventions': return 'Intervention Center';
      case '/model': return 'Model Intelligence';
      case '/analytics': return 'Analytics';
      case '/about': return 'About';
      default:
        if (location.pathname.startsWith('/patients/')) return 'Patient Detail';
        return 'FollowUpAI';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all w-64"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-slate-600 relative">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-700">{user?.name || 'Staff'}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {user?.initials || <User size={16} />}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto page-shell pt-8">
          <Outlet context={{ sidebarOpen, setSidebarOpen }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
