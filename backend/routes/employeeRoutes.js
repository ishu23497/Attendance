const express = require('express');
const router = express.Router();
const { createEmployee, getEmployees } = require('../controllers/employeeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createEmployee)
    .get(protect, admin, getEmployees);

module.exports = router;
