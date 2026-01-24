import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Calendar, CheckCircle, XCircle, Clock, Plus, Filter } from 'lucide-react';

const Leaves = () => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const isAdmin = user?.role === 'admin';
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'Sick',
        reason: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    // Admin Action State
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/leaves');
            setLeaves(data);
        } catch (err) {
            console.error('Failed to fetch leaves', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/leaves', formData);
            setShowModal(false);
            setFormData({ startDate: '', endDate: '', type: 'Sick', reason: '' });
            fetchLeaves(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to apply');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
        setActionLoading(id);
        try {
            await api.patch(`/leaves/${id}`, { status, adminComment: `Marked as ${status} by Admin` });
            fetchLeaves();
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <Sidebar role={user?.role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="md:ml-64 transition-all duration-300">
                <Navbar
                    user={user}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    toggleMobileSidebar={() => setIsSidebarOpen(true)}
                />

                <main className="p-6 md:p-8 mt-20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {isAdmin ? 'Leave Management' : 'My Leaves'}
                            </h1>
                            <p className="text-slate-500">
                                {isAdmin ? 'Review and manage employee leave requests.' : 'Apply for leave and track status.'}
                            </p>
                        </div>
                        {!isAdmin && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 font-medium transition-all"
                            >
                                <Plus size={18} />
                                Apply Leave
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {isAdmin && <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>}
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Dates</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        {isAdmin && <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading leaves...</td></tr>
                                    ) : leaves.length > 0 ? (
                                        leaves.map((leave) => (
                                            <tr key={leave._id} className="hover:bg-slate-50">
                                                {isAdmin && (
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-800">{leave.user?.name}</div>
                                                        <div className="text-xs text-slate-500">{leave.user?.department}</div>
                                                    </td>
                                                )}
                                                <td className="p-4">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">{leave.type}</span>
                                                </td>
                                                <td className="p-4 text-slate-600 text-sm">
                                                    {leave.startDate} <span className="text-slate-400">to</span> {leave.endDate}
                                                </td>
                                                <td className="p-4 text-slate-600 text-sm max-w-xs truncate" title={leave.reason}>
                                                    {leave.reason}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                            leave.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {leave.status === 'Approved' && <CheckCircle size={12} />}
                                                        {leave.status === 'Rejected' && <XCircle size={12} />}
                                                        {leave.status === 'Pending' && <Clock size={12} />}
                                                        {leave.status}
                                                    </span>
                                                </td>
                                                {isAdmin && (
                                                    <td className="p-4 text-right">
                                                        {leave.status === 'Pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleAction(leave._id, 'Approved')}
                                                                    disabled={actionLoading === leave._id}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50" title="Approve"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(leave._id, 'Rejected')}
                                                                    disabled={actionLoading === leave._id}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50" title="Reject"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-500">No leave requests found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Apply Leave Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Apply for Leave</h3>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="WFH">Work From Home</option>
                                    <option value="Unpaid">Unpaid Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Brief reason for leave..."
                                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitLoading ? 'Applying...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
