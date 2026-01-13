import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, CheckSquare, FileText, Calendar } from 'lucide-react';


import logo from '../assets/logo.png';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen hidden md:flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-100 flex items-center justify-center">
        <img src={logo} alt="FutureDesk" className="h-10 object-contain" />
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {role === 'admin' ? (
           <>
             <NavLink 
               to="/admin" 
               end
               className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               <LayoutDashboard size={20} />
               Dashboard
             </NavLink>
             <NavLink 
               to="/admin/employees" 
               className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               <Users size={20} />
               Employees
             </NavLink>
             {/* Add more admin links if needed */}
             <NavLink 
               to="/admin/reports" 
               className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               <FileText size={20} />
               Reports
             </NavLink>
             <NavLink 
               to="/leaves" 
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
               className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               <CheckSquare size={20} />
               My Attendance
             </NavLink>
             <NavLink 
               to="/leaves" 
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
  );
};

export default Sidebar;
