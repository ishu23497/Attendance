const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Total Active Employees
        const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });

        // 2. Fetch today's attendance records
        const todayAttendance = await Attendance.find({ date: today });

        // 3. Calculate metrics
        const presentCount = todayAttendance.filter(r => r.status === 'Present').length;
        const lateCount = todayAttendance.filter(r => r.status === 'Late').length;

        const absentCount = totalEmployees - (presentCount + lateCount);

        res.json({
            totalEmployees,
            presentCount,
            lateCount,
            absentCount: Math.max(0, absentCount)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get today's attendance log
// @route   GET /api/admin/today-attendance
// @access  Private/Admin
const getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const logs = await Attendance.find({ date: today })
            .populate('user', 'name email department designation')
            .sort({ checkIn: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Export attendance data
// @route   GET /api/admin/attendance/export
// @access  Private/Admin
const exportAttendance = async (req, res) => {
    try {
        const { startDate, endDate, format, employeeId, status } = req.query;

        // Build Query
        let query = {};

        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            query.date = { $gte: startDate };
        }

        if (employeeId) {
            query.user = employeeId;
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        const attendanceData = await Attendance.find(query)
            .populate('user', 'name email department designation')
            .sort({ date: -1 });

        if (!attendanceData.length) {
            return res.status(404).json({ message: 'No records found for the selected criteria' });
        }

        const records = attendanceData.map(record => ({
            Date: record.date,
            Employee: record.user?.name || 'Unknown',
            Email: record.user?.email || 'N/A',
            Department: record.user?.department || 'N/A',
            Status: record.status,
            CheckIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-',
            CheckOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-',
            WorkHours: record.workHours ? record.workHours.toFixed(2) : '0'
        }));

        if (format === 'csv') {
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(records);
            res.header('Content-Type', 'text/csv');
            res.attachment(`attendance_export_${Date.now()}.csv`);
            return res.send(csv);

        } else if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Attendance');
            worksheet.columns = [
                { header: 'Date', key: 'Date', width: 15 },
                { header: 'Employee', key: 'Employee', width: 20 },
                { header: 'Email', key: 'Email', width: 25 },
                { header: 'Department', key: 'Department', width: 15 },
                { header: 'Status', key: 'Status', width: 10 },
                { header: 'Check In', key: 'CheckIn', width: 15 },
                { header: 'Check Out', key: 'CheckOut', width: 15 },
                { header: 'Work Hours', key: 'WorkHours', width: 10 }
            ];
            worksheet.addRows(records);
            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment(`attendance_export_${Date.now()}.xlsx`);
            return await workbook.xlsx.write(res);

        } else if (format === 'pdf') {
            const doc = new PDFDocument();
            res.header('Content-Type', 'application/pdf');
            res.attachment(`attendance_export_${Date.now()}.pdf`);
            doc.pipe(res);
            doc.fontSize(18).text('Attendance Report', { align: 'center' });
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();
            records.forEach((rec, i) => {
                doc.fontSize(10).text(`${i + 1}. ${rec.Date} - ${rec.Employee} (${rec.Status}) | In: ${rec.CheckIn} | Out: ${rec.CheckOut}`);
                doc.moveDown(0.5);
            });
            doc.end();
            return;
        } else {
            return res.status(400).json({ message: 'Invalid format specified' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Export failed: ' + error.message });
    }
};

// @desc    Get monthly report for all employees or specific employee
// @route   GET /api/admin/reports/monthly
// @access  Private/Admin
const getMonthlyReport = async (req, res) => {
    try {
        const { year, month, employeeId } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and Month are required' });
        }

        // Create start vs end string pattern for regex or range
        // Since date is stored as YYYY-MM-DD string, we can regex match "YYYY-MM"
        const paddedMonth = month.toString().padStart(2, '0');
        const monthPrefix = `${year}-${paddedMonth}`;

        let matchStage = {
            date: { $regex: `^${monthPrefix}` }
        };

        if (employeeId) {
            matchStage.user = new mongoose.Types.ObjectId(employeeId);
        }

        const report = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$user',
                    totalPresent: {
                        $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
                    },
                    totalLate: {
                        $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
                    },
                    totalHalfDay: {
                        $sum: { $cond: [{ $eq: ['$status', 'Half-day'] }, 1, 0] }
                    },
                    totalWorkingDays: { $sum: 1 }, // This counts only days they attended? Or we should assume standard working days?
                    // Usually attendance system reports based on recorded attendance.
                    // Calculating absent days requires knowing the expected working days, which is complex without a holiday calendar.
                    // For now, let's report what we have logged.
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    _id: 1,
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    department: '$userDetails.department',
                    totalPresent: 1,
                    totalLate: 1,
                    totalHalfDay: 1,
                    totalDaysAttended: '$totalWorkingDays'
                }
            }
        ]);

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Report generation failed' });
    }
};

// @desc    Get attendance calendar data
// @route   GET /api/admin/attendance/calendar
// @access  Private/Admin
const getAttendanceCalendar = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and Month are required' });
        }

        const paddedMonth = month.toString().padStart(2, '0');
        const monthPrefix = `${year}-${paddedMonth}`;

        const attendanceData = await Attendance.find({
            date: { $regex: `^${monthPrefix}` }
        })
        .populate('user', 'name email department designation')
        .sort({ date: 1 });

        const employees = await User.find({ role: 'employee', isActive: true })
            .select('name email department designation');

        const calendarData = employees.map(emp => {
            const empAttendance = attendanceData.filter(a => 
                a.user && a.user._id.toString() === emp._id.toString()
            );

            const days = {};
            empAttendance.forEach(record => {
                const day = parseInt(record.date.split('-')[2], 10);
                days[day] = {
                    status: record.status,
                    checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                    checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                    workHours: record.workHours
                };
            });

            const presentDays = empAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
            const totalHours = empAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0);

            return {
                employeeId: emp._id,
                name: emp.name,
                email: emp.email,
                department: emp.department,
                days,
                stats: {
                    present: presentDays,
                    totalHours: totalHours.toFixed(1)
                }
            };
        });

        res.json({
            year: parseInt(year),
            month: parseInt(month),
            employees: calendarData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch calendar data' });
    }
};

module.exports = { 
    getDashboardStats, 
    getTodayAttendance, 
    exportAttendance, 
    getMonthlyReport,
    getAttendanceCalendar
};
