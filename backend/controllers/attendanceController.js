const Attendance = require('../models/Attendance');

const checkIn = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date().toISOString().split('T')[0];

        // Check if attendance already exists logically before attempting atomic op (optional but good for specific error msg if not concurrent)
        // But atomic op handles it.

        const now = new Date();
        const cutoff = new Date();
        cutoff.setHours(10, 0, 0, 0); // 10:00 AM
        const status = now > cutoff ? 'Late' : 'Present';

        // Use findOneAndUpdate with upsert to prevent race conditions
        const result = await Attendance.findOneAndUpdate(
            { user: userId, date: today },
            {
                $setOnInsert: {
                    user: userId,
                    date: today,
                    checkIn: now,
                    status: status,
                    workHours: 0
                }
            },
            { upsert: true, new: true, includeResultMetadata: true }
        );

        if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }

        res.status(201).json(result.value);
    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ message: 'Server error while marking attendance' });
    }
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
