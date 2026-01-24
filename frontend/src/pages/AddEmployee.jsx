import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { UserPlus, Save, ArrowLeft, Building2, Briefcase, Calendar } from 'lucide-react';

const AddEmployee = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successData, setSuccessData] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const { data } = await api.post('/employees', formData);
            setSuccessData(data);
            setFormData({
                name: '',
                email: '',
                department: '',
                designation: '',
                joiningDate: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Mock/Reusable */}
            <Sidebar role="admin" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 transition-all">
                <Navbar user={{ name: 'Admin', role: 'admin' }} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} toggleMobileSidebar={() => setIsSidebarOpen(true)} />

                <main className="p-6 md:p-8 mt-20">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate('/admin/employees')}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Add New Employee</h1>
                            <p className="text-slate-500 text-sm">Create a new employee account with system access.</p>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        {/* Success Message */}
                        {successData && (
                            <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm animate-fade-in">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <UserPlus className="text-green-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-green-800">Employee Created Successfully!</h3>
                                        <p className="text-green-700 mt-1">
                                            Share these credentials with the employee immediately.
                                        </p>
                                        <div className="mt-4 bg-white p-4 rounded-lg border border-green-100">
                                            <p className="font-mono text-sm text-slate-500">Email: <strong className="text-slate-800">{successData.email}</strong></p>
                                            <p className="font-mono text-sm text-slate-500 mt-1">Temp Password: <strong className="text-red-500 bg-red-50 px-2 py-0.5 rounded">{successData.tempPassword}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="john@futuredesk.com"
                                        />
                                    </div>

                                    {/* Department */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all"
                                            >
                                                <option value="">Select Department</option>
                                                <option value="Engineering">Engineering</option>
                                                <option value="HR">HR</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Support">Support</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Designation */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="e.g. Senior Developer"
                                            />
                                        </div>
                                    </div>

                                    {/* Joining Date */}
                                    <div className="col-span-2 md:col-span-1 relative">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Joining Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                name="joiningDate"
                                                type="date"
                                                value={formData.joiningDate}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/employees')}
                                    className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : <><Save size={18} /> Create Employee</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddEmployee;
