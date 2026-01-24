import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import api from '../utils/api';
import { Calendar, Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [totalStats, setTotalStats] = useState({ present: 0, late: 0, halfDay: 0, workingDays: 0 });

    // Filters
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [employeeId, setEmployeeId] = useState('');
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchReport();
    }, [year, month, employeeId]);

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/employees');
            setEmployees(data);
        } catch (err) {
            console.error('Failed to fetch employees');
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const query = `?year=${year}&month=${month}${employeeId ? `&employeeId=${employeeId}` : ''}`;
            const { data } = await api.get(`/admin/reports/monthly${query}`);

            setReportData(data);

            // Calc Totals
            const totals = data.reduce((acc, curr) => ({
                present: acc.present + curr.totalPresent,
                late: acc.late + curr.totalLate,
                halfDay: acc.halfDay + curr.totalHalfDay,
                workingDays: acc.workingDays + curr.totalDaysAttended
            }), { present: 0, late: 0, halfDay: 0, workingDays: 0 });

            setTotalStats(totals);
        } catch (err) {
            console.error('Failed to fetch report', err);
        } finally {
            setLoading(false);
        }
    };

    // Chart Data
    const pieData = {
        labels: ['Present', 'Late', 'Half Day'],
        datasets: [
            {
                data: [totalStats.present, totalStats.late, totalStats.halfDay],
                backgroundColor: ['#22c55e', '#eab308', '#f97316'],
                hoverBackgroundColor: ['#16a34a', '#ca8a04', '#ea580c'],
            },
        ],
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <Sidebar role="admin" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="md:ml-64 transition-all duration-300">
                <Navbar
                    user={{ name: 'Admin', role: 'admin' }}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    toggleMobileSidebar={() => setIsSidebarOpen(true)}
                />

                <main className="p-6 md:p-8 mt-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Attendance Reports</h1>
                            <p className="text-slate-500 text-sm">Monthly insights & employee performance analytics.</p>
                        </div>

                        {/* Filters */}
                        <div className="flex bg-white p-2 rounded-lg shadow-sm border border-slate-200 gap-2">
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="bg-slate-50 border-none outline-none text-sm font-medium text-slate-700 p-2 rounded hover:bg-slate-100"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="bg-slate-50 border-none outline-none text-sm font-medium text-slate-700 p-2 rounded hover:bg-slate-100"
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                            <select
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="bg-slate-50 border-none outline-none text-sm font-medium text-slate-700 p-2 rounded hover:bg-slate-100 max-w-[150px]"
                            >
                                <option value="">All Employees</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <SummaryCard title="Total Days Logged" value={totalStats.workingDays} icon={Calendar} color="blue" />
                        <SummaryCard title="Present Days" value={totalStats.present} icon={CheckCircle} color="green" />
                        <SummaryCard title="Late Arrivals" value={totalStats.late} icon={Clock} color="yellow" />
                        <SummaryCard title="Half Days" value={totalStats.halfDay} icon={AlertCircle} color="orange" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Summary Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 w-full text-left">Overview</h3>
                            <div className="w-48 h-48">
                                <Pie data={pieData} />
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-700">Detailed Report</h3>
                                <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                                    <Download size={14} /> Download CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Present</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Late</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Attended</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading report...</td></tr>
                                        ) : reportData.length > 0 ? (
                                            reportData.map((row) => {
                                                const percentage = ((row.totalPresent / row.totalDaysAttended) * 100).toFixed(0);
                                                return (
                                                    <tr key={row._id} className="hover:bg-slate-50">
                                                        <td className="p-4">
                                                            <div className="font-medium text-slate-800">{row.name}</div>
                                                            <div className="text-xs text-slate-500">{row.department}</div>
                                                        </td>
                                                        <td className="p-4 text-green-600 font-medium">{row.totalPresent}</td>
                                                        <td className="p-4 text-yellow-600 font-medium">{row.totalLate}</td>
                                                        <td className="p-4 text-slate-600">{row.totalDaysAttended}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-full bg-slate-200 rounded-full h-1.5 w-16">
                                                                    <div
                                                                        className={`h-1.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs font-medium text-slate-600">{percentage}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No data available for this period.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports;
