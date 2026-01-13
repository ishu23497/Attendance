const express = require('express');
const router = express.Router();
const { authUser, registerUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/register', protect, admin, registerUser); // Only admin can register new users

module.exports = router;
