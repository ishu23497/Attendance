const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { 
    authUser, 
    registerUser, 
    refreshTokenHandler, 
    logout, 
    getMe, 
    changePassword 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['admin', 'manager', 'employee']).withMessage('Role must be admin, manager, or employee')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number')
];

router.post('/login', loginValidation, authUser);
router.post('/register', protect, admin, registerValidation, registerUser);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePasswordValidation, changePassword);

module.exports = router;
