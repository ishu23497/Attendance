const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
    try {
        const { name, email, department, designation, joiningDate } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Generate temporary password
        // Format: FutureDesk2026 + 3 random digits
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const tempPassword = `FutureDesk${new Date().getFullYear()}${randomSuffix}`;

        // 3. Create user
        const user = await User.create({
            name,
            email,
            password: tempPassword, // Will be hashed by pre-save middleware
            role: 'employee',
            department,
            designation,
            joiningDate,
            createdBy: req.user._id,
            mustChangePassword: true
        });

        if (user) {
            res.status(201).json({
                message: 'Employee created successfully',
                _id: user._id,
                name: user.name,
                email: user.email,
                tempPassword: tempPassword // Return this ONLY once so Admin can share it
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
    try {
        // Return all users where role is NOT admin (or just all users if you prefer)
        // Going with only employees as requested by "Employee List Page" logic usually implies getting staff
        // But let's fetch everyone but sort by latest
        const employees = await User.find({ role: 'employee' })
            .select('-password') // Do not return password
            .sort({ createdAt: -1 });

        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEmployee, getEmployees };
