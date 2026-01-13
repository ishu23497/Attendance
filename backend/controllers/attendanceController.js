const Attendance = require('../models/Attendance');

const checkIn = async (req, res) => {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ user: userId, date: today });

    if (existing) {
        res.status(400).json({ message: 'Already checked in today' });
        return;
    }

    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(10, 0, 0, 0);
    const status = now > cutoff ? 'Late' : 'Present';

    const attendance = await Attendance.create({
        user: userId,
        date: today,
        checkIn: now,
        status,
    });

    res.status(201).json(attendance);
};

const checkOut = async (req, res) => {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
        res.status(400).json({ message: 'No check-in record found for today' });
        return;
    }

    if (attendance.checkOut) {
        res.status(400).json({ message: 'Already checked out' });
        return;
    }

    attendance.checkOut = new Date();

    // Calculate work hours (ms to hours)
    const duration = attendance.checkOut - attendance.checkIn;
    attendance.workHours = duration / (1000 * 60 * 60);

    await attendance.save();
    res.json(attendance);
};

const getStatus = async (req, res) => {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: userId, date: today });
    res.json(attendance || { status: 'Not Checked In' });
};

const getAllAttendance = async (req, res) => {
    // Admin only
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.find({ date: today }).populate('user', 'name email');
    res.json(attendance);
};

module.exports = { checkIn, checkOut, getStatus, getAllAttendance };
