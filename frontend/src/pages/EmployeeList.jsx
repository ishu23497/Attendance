import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Plus, Search, User, MoreVertical } from 'lucide-react';

const EmployeeList = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/employees');
            setEmployees(data);
        } catch (err) {
            console.error('Failed to fetch employees', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar role="admin" />
            
            <div className="flex-1 md:ml-64 transition-all">
                <Navbar user={{ name: 'Admin', role: 'admin' }} toggleSidebar={() => {}} toggleMobileSidebar={() => {}} />

                <main className="p-6 md:p-8 mt-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
                            <p className="text-slate-500 text-sm">Manage company staff and accounts.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/add-employee')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-semibold"
                        >
                            <Plus size={20} />
                            Add Employee
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search by name, email, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="text-sm text-slate-500">
                            Total: <strong className="text-slate-800">{filteredEmployees.length}</strong>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading employees...</td></tr>
                                    ) : filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((emp) => (
                                            <tr key={emp._id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{emp.name}</div>
                                                            <div className="text-xs text-slate-500">{emp.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600 font-medium">{emp.department}</td>
                                                <td className="p-4 text-slate-600">{emp.designation}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {emp.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No employees found matching your search.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeList;
