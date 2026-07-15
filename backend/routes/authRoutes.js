const express = require('express');
const { 
  signup, 
  login, 
  refresh, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  logout 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/verify-email', protect, verifyEmail);

module.exports = router;
