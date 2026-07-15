const express = require('express');
const { queryCopilot } = require('../controllers/copilotController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/query', protect, authorizeRoles('Admin', 'Analyst', 'Manager'), queryCopilot);

module.exports = router;
