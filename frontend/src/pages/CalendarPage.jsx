import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { ChevronLeft, ChevronRight, Check, Clock, X, AlertCircle, Users } from 'lucide-react';

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
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/attendance/calendar?year=${year}&month=${month + 1}`);
      setCalendarData(data.employees);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-500';
      case 'Late': return 'bg-yellow-500';
      case 'Half-day': return 'bg-orange-500';
      case 'Absent': return 'bg-red-500';
      case 'Leave': return 'bg-blue-500';
      default: return 'bg-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <Check size={12} className="text-white" />;
      case 'Late': return <Clock size={12} className="text-white" />;
      case 'Absent': return <X size={12} className="text-white" />;
      case 'Leave': return <AlertCircle size={12} className="text-white" />;
      default: return null;
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blankDays = Array(firstDay).fill(null);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const isToday = (day) => 
    day === today.getDate() && 
    month === today.getMonth() && 
    year === today.getFullYear();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Sidebar role={currentUser?.role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="md:ml-64 transition-all duration-300">
        <Navbar
          user={currentUser}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleMobileSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="p-6 md:p-8 mt-20">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Attendance Calendar</h1>
              <p className="text-slate-500">View employee attendance by month</p>
            </div>
            <button
              onClick={goToToday}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-medium transition-all"
            >
              Today
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-800">
                {monthNames[month]} {year}
              </h2>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500">Loading calendar data...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-[200px_repeat(31,1fr)] border-b border-slate-100">
                      <div className="p-3 bg-slate-50 font-semibold text-sm text-slate-600 sticky left-0 z-10">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          Employee
                        </div>
                      </div>
                      {weekDays.map((day, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 text-center text-xs font-semibold text-slate-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-[200px_repeat(31,1fr)] border-b border-slate-100">
                      <div className="p-3 bg-slate-50 font-semibold text-sm text-slate-600 sticky left-0 z-10">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          Employee
                        </div>
                      </div>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <div 
                          key={day} 
                          className={`p-3 text-center text-sm font-medium ${isToday(day) ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {calendarData.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-slate-500">No employee attendance data found for this month.</p>
                      </div>
                    ) : (
                      calendarData.map((employee) => (
                        <div 
                          key={employee.employeeId}
                          className="grid grid-cols-[200px_repeat(31,1fr)] border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <div className="p-3 sticky left-0 bg-white z-10">
                            <div className="font-medium text-slate-800 truncate">{employee.name}</div>
                            <div className="text-xs text-slate-500 truncate">{employee.department}</div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                {employee.stats.present} days
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                {employee.stats.totalHours}h
                              </span>
                            </div>
                          </div>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                            const dayData = employee.days[day];
                            return (
                              <div 
                                key={day} 
                                className={`p-1 flex items-center justify-center ${isToday(day) ? 'bg-blue-50' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (dayData) setSelectedDay({ day, ...dayData, employee: employee.name });
                                }}
                              >
                                {dayData ? (
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getStatusColor(dayData.status)}`}>
                                    {getStatusIcon(dayData.status)}
                                  </div>
                                ) : day <= daysInMonth ? (
                                  <div className="w-5 h-5 rounded-full bg-slate-100"></div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex flex-wrap gap-4 justify-center bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-sm text-slate-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Clock size={12} className="text-white" />
                    </div>
                    <span className="text-sm text-slate-600">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <AlertCircle size={12} className="text-white" />
                    </div>
                    <span className="text-sm text-slate-600">Half-day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <X size={12} className="text-white" />
                    </div>
                    <span className="text-sm text-slate-600">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <AlertCircle size={12} className="text-white" />
                    </div>
                    <span className="text-sm text-slate-600">Leave</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {selectedDay && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedDay(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedDay.employee} - Day {selectedDay.day}
                  </h3>
                  <p className="text-sm text-slate-500">{monthNames[month]} {year}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedDay.status)}`}>
                      {selectedDay.status}
                    </span>
                  </div>
                  {selectedDay.checkIn && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Check In</span>
                      <span className="font-mono text-slate-800">{selectedDay.checkIn}</span>
                    </div>
                  )}
                  {selectedDay.checkOut && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Check Out</span>
                      <span className="font-mono text-slate-800">{selectedDay.checkOut}</span>
                    </div>
                  )}
                  {selectedDay.workHours > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Work Hours</span>
                      <span className="font-mono text-slate-800">{selectedDay.workHours.toFixed(1)} hrs</span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50">
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedEmployee(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">{selectedEmployee.name}</h3>
                  <p className="text-sm text-slate-500">{selectedEmployee.email}</p>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Department</span>
                    <span className="font-medium text-slate-800">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Present Days</span>
                    <span className="font-medium text-green-600">{selectedEmployee.stats.present}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Hours</span>
                    <span className="font-medium text-blue-600">{selectedEmployee.stats.totalHours}h</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50">
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
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
