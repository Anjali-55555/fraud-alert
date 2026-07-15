const express = require('express');
const { startSimulation, stopSimulation, triggerBurst } = require('../controllers/simulatorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('Admin')); // Simulator controls restricted to Admins

router.post('/start', startSimulation);
router.post('/stop', stopSimulation);
router.post('/burst', triggerBurst);

module.exports = router;
