import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, CheckSquare, FileText, Calendar, X, CalendarDays } from 'lucide-react';

import logo from '../assets/logo.png';
import { logout } from '../utils/api';

const Sidebar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 shadow-xl md:shadow-none
        `}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <img src={logo} alt="FutureDesk" className="h-10 object-contain" />
          <button onClick={onClose} className="md:hidden text-slate-500 hover:bg-slate-100 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {role === 'admin' ? (
            <>
              <NavLink
                to="/admin"
                end
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/employees"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Users size={20} />
                Employees
              </NavLink>
              <NavLink
                to="/admin/reports"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileText size={20} />
                Reports
              </NavLink>
              <NavLink
                to="/admin/calendar"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <CalendarDays size={20} />
                Calendar
              </NavLink>
              <NavLink
                to="/leaves"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar size={20} />
                Leaves
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/employee"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <CheckSquare size={20} />
                My Attendance
              </NavLink>
              <NavLink
                to="/leaves"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar size={20} />
                My Leaves
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
