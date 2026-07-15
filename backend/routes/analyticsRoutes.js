const express = require('express');
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('Admin', 'Analyst', 'Manager'), getDashboardAnalytics);

module.exports = router;
