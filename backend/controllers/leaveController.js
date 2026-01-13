const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee)
const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, type, reason } = req.body;

        const leave = await Leave.create({
            user: req.user._id,
            startDate,
            endDate,
            type,
            reason
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(400).json({ message: 'Failed to apply for leave: ' + error.message });
    }
};

// @desc    Get leaves (User gets own, Admin gets all)
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
    try {
        let leaves;
        if (req.user.role === 'admin') {
            leaves = await Leave.find({})
                .populate('user', 'name email department')
                .sort({ createdAt: -1 });
        } else {
            leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        }
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Update leave status (Approve/Reject)
// @route   PATCH /api/leaves/:id
// @access  Private (Admin)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leave.status = status;
        leave.adminComment = adminComment;
        leave.reviewedBy = req.user._id;
        await leave.save();

        // If Approved, create attendance records marked as 'Leave'
        if (status === 'Approved') {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                // Skip weekends if needed (simple version assumes all days count or user selects carefully)
                const dateStr = d.toISOString().split('T')[0];

                const existing = await Attendance.findOne({ user: leave.user, date: dateStr });
                if (!existing) {
                    await Attendance.create({
                        user: leave.user,
                        date: dateStr,
                        status: 'Leave',
                        workHours: 8 // Assuming paid leave counts as hours? Or 0. Let's say 0 but confirmed status.
                    });
                } else {
                    // Overwrite? Only if it's currently absent or nothing. 
                    // If they kept checking in, maybe don't overwrite "Present"?
                    // Let's overwrite "Absent"
                    if (existing.status === 'Absent') {
                        existing.status = 'Leave';
                        await existing.save();
                    }
                }
            }
        }

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Update failed: ' + error.message });
    }
};

module.exports = { applyLeave, getLeaves, updateLeaveStatus };
