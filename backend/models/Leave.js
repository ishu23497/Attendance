const mongoose = require('mongoose');

const leaveSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, enum: ['Sick', 'Casual', 'WFH', 'Unpaid'], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    adminComment: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
