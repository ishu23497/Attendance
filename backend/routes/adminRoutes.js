const express = require('express');
const router = express.Router();
const { getDashboardStats, getTodayAttendance, exportAttendance, getMonthlyReport } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, admin, getDashboardStats);
router.get('/today-attendance', protect, admin, getTodayAttendance);
router.get('/attendance/export', protect, admin, exportAttendance);
router.get('/reports/monthly', protect, admin, getMonthlyReport);

module.exports = router;
