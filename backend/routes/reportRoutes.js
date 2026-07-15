const express = require('express');
const { getInvestigationReport } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/transaction/:id', protect, authorizeRoles('Admin', 'Analyst', 'Manager'), getInvestigationReport);

module.exports = router;
