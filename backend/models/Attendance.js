const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ['Present', 'Late', 'Absent', 'Half-day', 'Leave'], default: 'Absent' },
    workHours: { type: Number, default: 0 },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
