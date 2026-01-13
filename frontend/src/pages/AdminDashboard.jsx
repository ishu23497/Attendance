import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import api from '../utils/api';
import { Users, Clock, AlertCircle, CheckCircle, Calendar, Download, X } from 'lucide-react';

const AdminDashboard = () => {
  const [currentUser] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0
  });
  const [todayRecords, setTodayRecords] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
        // Parallel requests for efficiency
        const [statsRes, logsRes] = await Promise.all([
            api.get('/admin/dashboard-stats'),
            api.get('/admin/today-attendance')
        ]);

        setStats(statsRes.data);

        // Format logs for display
        const formattedLogs = logsRes.data.map(record => ({
            id: record._id,
            userId: record.user._id,
            userName: record.user.name,
            status: record.status,
            checkInTime: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            checkOutTime: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        }));
        
        setTodayRecords(formattedLogs);
        setLoading(false);
    } catch (err) {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Export Logic
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'csv'
  });

  const handleExport = async (e) => {
    e.preventDefault();
    setExportLoading(true);
    try {
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const response = await fetch(`http://localhost:5000/api/admin/attendance/export?startDate=${exportConfig.startDate}&endDate=${exportConfig.endDate}&format=${exportConfig.format}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Filename based on format
        a.download = `attendance-report.${exportConfig.format === 'excel' ? 'xlsx' : exportConfig.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowExportModal(false);
    } catch (err) {
        console.error('Export error:', err);
        alert('Failed to export. No data found or server error.');
    } finally {
        setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Sidebar role={currentUser?.role} />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'md:ml-64'}`}>
        <Navbar 
            user={currentUser} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            toggleMobileSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="p-6 md:p-8 mt-20">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500">Overview of office attendance for today, {today}</p>
            </div>
            <button 
                onClick={() => setShowExportModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 font-medium transition-all"
            >
                <Download size={18} />
                Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="blue" />
            <SummaryCard title="Present Today" value={stats.presentCount} icon={CheckCircle} color="green" />
            <SummaryCard title="Late Arrivals" value={stats.lateCount} icon={Clock} color="yellow" />
            <SummaryCard title="Absent" value={stats.absentCount} icon={AlertCircle} color="red" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Today's Attendance Log</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar size={16} />
                {today}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading dashboard data...</td></tr>
                  ) : todayRecords.length > 0 ? (
                    todayRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{record.userName}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                              record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono text-sm">{record.checkInTime}</td>
                        <td className="p-4 text-slate-600 font-mono text-sm">{record.checkOutTime || '--:--'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">
                        No attendance records found for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Export Attendance Report</h3>
                    <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleExport} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
                        <div className="flex gap-2">
                            <input 
                                type="date" 
                                required
                                value={exportConfig.startDate}
                                onChange={(e) => setExportConfig({...exportConfig, startDate: e.target.value})}
                                className="w-1/2 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="self-center text-slate-400">-</span>
                            <input 
                                type="date" 
                                required
                                value={exportConfig.endDate}
                                onChange={(e) => setExportConfig({...exportConfig, endDate: e.target.value})}
                                className="w-1/2 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['csv', 'excel', 'pdf'].map(fmt => (
                                <button
                                    key={fmt}
                                    type="button"
                                    onClick={() => setExportConfig({...exportConfig, format: fmt})}
                                    className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all
                                        ${exportConfig.format === fmt 
                                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowExportModal(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={exportLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {exportLoading ? 'Generating...' : <><Download size={18} /> Download</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
