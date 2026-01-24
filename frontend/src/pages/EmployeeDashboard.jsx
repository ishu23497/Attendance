import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';

const EmployeeDashboard = () => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState('');

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/attendance/status');
      if (data && data._id) {
        // Format times for display if they exist
        const formatted = {
          ...data,
          checkInTime: data.checkIn ? new Date(data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          checkOutTime: data.checkOut ? new Date(data.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        };
        setStatus(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      const { data } = await api.post('/attendance/checkin');
      setMessage('Checked in successfully!');
      fetchStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-in failed');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCheckOut = async () => {
    try {
      const { data } = await api.post('/attendance/checkout');
      setMessage('Checked out successfully!');
      fetchStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-out failed');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const isCheckedIn = !!status;
  const isCheckedOut = status && status.checkOutTime;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={currentUser?.role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="md:ml-64">
        <Navbar
          user={currentUser}
          toggleMobileSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="pt-24 px-6 md:px-8 pb-8 flex flex-col items-center justify-center min-h-[80vh]">

          <div className="text-center mb-10 w-full max-w-2xl mx-auto">
            <div className="text-6xl font-black text-slate-800 tracking-tighter mb-2 font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-lg text-slate-500 font-medium">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {message && (
            <div className={`mb-6 px-6 py-3 rounded-lg text-sm font-semibold shadow-md animate-bounce
              ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            `}>
              {message}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-slate-100 relative overflow-hidden">

            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Attendance Status</h2>
                <p className="text-sm text-slate-500">Mark your daily attendance</p>
              </div>
              {status && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${status.status === 'Present' ? 'bg-green-100 text-green-700' :
                    status.status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}
                    `}>
                  {status.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Check In</p>
                <p className="text-xl font-mono text-slate-800 font-bold">
                  {status?.checkInTime || '--:--'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Check Out</p>
                <p className="text-xl font-mono text-slate-800 font-bold">
                  {status?.checkOutTime || '--:--'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {!isCheckedIn && (
                <button
                  onClick={handleCheckIn}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
                >
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  Check In Now
                </button>
              )}

              {isCheckedIn && !isCheckedOut && (
                <button
                  onClick={handleCheckOut}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Check Out
                </button>
              )}

              {isCheckedOut && (
                <div className="w-full py-4 bg-green-50 text-green-700 rounded-xl font-bold text-center border border-green-200">
                  Attendance Completed 🎉
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              Office Hours: 10:00 AM - 6:00 PM
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
