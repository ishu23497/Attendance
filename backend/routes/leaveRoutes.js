const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, applyLeave)
    .get(protect, getLeaves);

router.route('/:id')
    .patch(protect, admin, updateLeaveStatus);

module.exports = router;
