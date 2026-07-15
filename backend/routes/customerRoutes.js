const express = require('express');
const { 
  getCustomers, 
  getCustomerById, 
  addTrustedParameter,
  getMyProfile
} = require('../controllers/customerController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);
router.get('/', authorizeRoles('Admin', 'Analyst', 'Manager'), getCustomers);
router.get('/:id', getCustomerById);
router.post('/:id/trust', addTrustedParameter);

module.exports = router;
