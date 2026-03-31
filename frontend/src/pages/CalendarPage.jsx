import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { ChevronLeft, ChevronRight, Check, Clock, X, AlertCircle, Users, Calendar } from 'lucide-react';

const CalendarPage = () => {
  const [currentUser] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/attendance/calendar?year=${year}&month=${month + 1}`);
      setCalendarData(data.employees || []);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayOfWeek = (day) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const isWeekend = (day) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; 
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500 shadow-md shadow-emerald-500/40 text-white';
      case 'Late': return 'bg-amber-400 shadow-md shadow-amber-400/40 text-white';
      case 'Half-day': return 'bg-orange-500 shadow-md shadow-orange-500/40 text-white';
      case 'Absent': return 'bg-rose-500 shadow-md shadow-rose-500/40 text-white';
      case 'Leave': return 'bg-sky-500 shadow-md shadow-sky-500/40 text-white';
      default: return 'bg-slate-200 text-transparent';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <Check size={14} />;
      case 'Late': return <Clock size={14} />;
      case 'Absent': return <X size={14} />;
      case 'Leave': return <AlertCircle size={14} />;
      case 'Half-day': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const isToday = (day) => 
    day === today.getDate() && 
    month === today.getMonth() && 
    year === today.getFullYear();

  const legends = [
    { label: 'Present', color: 'bg-emerald-500', icon: <Check size={12} className="text-white" /> },
    { label: 'Late', color: 'bg-amber-400', icon: <Clock size={12} className="text-white" /> },
    { label: 'Half-day', color: 'bg-orange-500', icon: <AlertCircle size={12} className="text-white" /> },
    { label: 'Absent', color: 'bg-rose-500', icon: <X size={12} className="text-white" /> },
    { label: 'Leave', color: 'bg-sky-500', icon: <AlertCircle size={12} className="text-white" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 relative font-sans text-slate-800 selection:bg-blue-100">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
        }
        .status-dot {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }
        .status-dot:hover {
          transform: scale(1.25);
          z-index: 20;
        }
        @keyframes zoom-in {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      
      <Sidebar role={currentUser?.role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="md:ml-64 transition-all duration-300">
        <Navbar
          user={currentUser}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleMobileSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 mt-20 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
                 <Calendar size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Attendance Monitor</h1>
                <p className="text-slate-500 text-sm mt-0.5 font-medium">Detailed tracking and management of employee attendance</p>
              </div>
            </div>
            <button
              onClick={goToToday}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Go to Today
            </button>
          </div>

          {/* Main Calendar Card */}
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
            {/* Calendar Toolbar */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <button 
                onClick={prevMonth}
                className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl transition-all hover:scale-105 active:scale-95 text-slate-600"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 drop-shadow-sm">
                {monthNames[month]} <span className="font-light text-slate-500">{year}</span>
              </h2>
              <button 
                onClick={nextMonth}
                className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl transition-all hover:scale-105 active:scale-95 text-slate-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {loading ? (
              <div className="p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full mb-4"></div>
                <p className="text-slate-500 font-medium animate-pulse">Synchronizing records...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar relative" style={{ maxHeight: '65vh' }}>
                  <div style={{ minWidth: 'min-content' }}>
                    {/* Calendar Header Row */}
                    <div 
                      className="grid bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40"
                      style={{ gridTemplateColumns: `280px repeat(${daysInMonth}, minmax(48px, 1fr))` }}
                    >
                      <div className="p-4 font-bold text-sm text-slate-700 sticky left-0 bg-[#f8fafc]/90 backdrop-blur-md z-50 border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.02)] flex items-center gap-2 uppercase tracking-wide">
                        <Users size={18} className="text-blue-500" />
                        Employee
                      </div>
                      {daysArray.map(day => {
                        const dayName = getDayOfWeek(day);
                        const isWknd = isWeekend(day);
                        const todayMatch = isToday(day);
                        return (
                          <div 
                            key={day} 
                            className={`p-2 flex flex-col items-center justify-center border-r border-slate-200/50 last:border-r-0 ${isWknd ? 'bg-slate-200/30' : ''} ${todayMatch ? 'bg-blue-100/40 border-b-2 border-b-blue-500' : ''}`}
                          >
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${todayMatch ? 'text-blue-600' : isWknd ? 'text-rose-400/80' : 'text-slate-400'}`}>
                              {dayName}
                            </span>
                            <span className={`text-[15px] mt-0.5 font-bold ${todayMatch ? 'text-blue-700' : isWknd ? 'text-rose-600/80' : 'text-slate-700'}`}>
                              {day}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Calendar Body Rows */}
                    {calendarData.length === 0 ? (
                      <div className="p-20 text-center col-span-full border-b border-slate-100 min-h-[300px] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={30} className="text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium text-lg">No records available</p>
                          <p className="text-slate-400 text-sm mt-1">There is no attendance data for this period.</p>
                        </div>
                      </div>
                    ) : (
                      calendarData.map((employee, idx) => (
                        <div 
                          key={employee.employeeId || idx}
                          className="grid border-b border-slate-100 hover:bg-blue-50/40 transition-colors group"
                          style={{ gridTemplateColumns: `280px repeat(${daysInMonth}, minmax(48px, 1fr))` }}
                        >
                          {/* Sticky Employee Col */}
                          <div 
                            className="p-3 sticky left-0 bg-white group-hover:bg-blue-50/40 z-30 border-r border-slate-200/80 flex items-center gap-3 transition-colors shadow-[2px_0_8px_rgba(0,0,0,0.02)] cursor-pointer" 
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0 text-lg">
                              {employee.name.charAt(0)}
                            </div>
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-800 truncate leading-tight group-hover:text-blue-700 transition-colors">{employee.name}</div>
                              <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">{employee.department}</div>
                              <div className="flex gap-1.5 mt-1.5">
                                <span className="text-[10px] bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200/50 flex gap-0.5 items-center">
                                  {employee.stats?.present || 0}d
                                </span>
                                <span className="text-[10px] bg-blue-100/80 text-blue-800 px-1.5 py-0.5 rounded font-bold border border-blue-200/50 flex gap-0.5 items-center">
                                  {employee.stats?.totalHours || 0}h
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Dates Cols */}
                          {daysArray.map(day => {
                            const dayData = employee.days && employee.days[day];
                            const isWknd = isWeekend(day);
                            const todayMatch = isToday(day);
                            return (
                              <div 
                                key={day} 
                                className={`p-1 flex items-center justify-center border-r border-slate-100/50 last:border-r-0 relative group/cell ${isWknd ? 'bg-slate-50/50' : ''} ${todayMatch ? 'bg-blue-50/40 ring-inset ring-1 ring-blue-100' : ''}`}
                                onClick={(e) => {
                                  if (dayData) {
                                    e.stopPropagation();
                                    setSelectedDay({ 
                                      day, 
                                      ...dayData, 
                                      employee: employee.name, 
                                      fullDate: `${monthNames[month]} ${day}, ${year}` 
                                    });
                                  }
                                }}
                              >
                                {dayData ? (
                                  <div 
                                    className={`w-[1.65rem] h-[1.65rem] sm:w-7 sm:h-7 rounded-full flex items-center justify-center status-dot cursor-pointer ${getStatusColor(dayData.status)}`}
                                    title={`${employee.name} | ${dayData.status} on ${monthNames[month]} ${day}`}
                                  >
                                    {getStatusIcon(dayData.status)}
                                  </div>
                                ) : (
                                  <div className={`w-1.5 h-1.5 rounded-full bg-slate-200 opacity-0 group-hover/cell:opacity-100 transition-all ${isWknd ? '!opacity-0' : ''} ${todayMatch && '!bg-blue-300'}`}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Legend Bottom Bar */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-wrap gap-4 sm:gap-6 justify-center bg-white/80 shrink-0">
                  {legends.map((lg, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${lg.color}`}>
                        {lg.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">{lg.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Modal - Selected Day */}
          {selectedDay && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-200" onClick={() => setSelectedDay(null)}>
              <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all border border-slate-100" 
                onClick={e => e.stopPropagation()}
                style={{ animation: 'zoom-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
              >
                <div className="relative h-28 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex items-end overflow-hidden">
                  <div className="absolute top-4 right-4 cursor-pointer text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full backdrop-blur transition-colors" onClick={() => setSelectedDay(null)}>
                    <X size={18} />
                  </div>
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                  <div className="text-white relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{selectedDay.employee}</h3>
                    <p className="text-blue-100 text-sm font-medium mt-1">{selectedDay.fullDate}</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/50">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                      <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 ${getStatusColor(selectedDay.status)}`}>
                        {getStatusIcon(selectedDay.status)}
                        {selectedDay.status}
                      </span>
                    </div>
                    {selectedDay.checkIn && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm font-semibold">Check In</span>
                        <span className="font-mono text-slate-800 text-sm font-bold bg-slate-100 px-2.5 py-1 rounded-md">{selectedDay.checkIn}</span>
                      </div>
                    )}
                    {selectedDay.checkOut && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm font-semibold">Check Out</span>
                        <span className="font-mono text-slate-800 text-sm font-bold bg-slate-100 px-2.5 py-1 rounded-md">{selectedDay.checkOut}</span>
                      </div>
                    )}
                    {selectedDay.workHours > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-50 border-dashed w-full relative">
                        <span className="text-slate-500 text-sm font-semibold mt-2">Work Hours</span>
                        <span className="font-mono text-blue-700 text-sm font-bold bg-blue-50 px-2.5 py-1 rounded-md mt-2 border border-blue-100">{selectedDay.workHours.toFixed(1)} hrs</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal - Selected Employee */}
          {selectedEmployee && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-200" onClick={() => setSelectedEmployee(null)}>
              <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all border border-slate-100" 
                onClick={e => e.stopPropagation()}
                style={{ animation: 'zoom-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
              >
                <div className="relative p-8 flex flex-col items-center border-b border-slate-100 bg-white">
                  <div className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors" onClick={() => setSelectedEmployee(null)}>
                    <X size={18} />
                  </div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-4xl font-extrabold shadow-lg shadow-blue-500/30 mb-5 ring-4 ring-slate-50">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{selectedEmployee.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1 bg-slate-100 px-3 py-1 rounded-full">{selectedEmployee.email}</p>
                  <span className="mt-4 text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase">
                    {selectedEmployee.department}
                  </span>
                </div>
                <div className="p-6 bg-[#f8fafc]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80 flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Present Days</span>
                      <span className="text-3xl font-black text-emerald-500 group-hover:scale-110 transition-transform">{selectedEmployee.stats?.present || 0}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80 flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Total Hours</span>
                      <span className="text-3xl font-black text-blue-500 group-hover:scale-110 transition-transform">
                        {selectedEmployee.stats?.totalHours || 0}
                        <span className="text-sm font-bold text-blue-300 ml-1">h</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;
