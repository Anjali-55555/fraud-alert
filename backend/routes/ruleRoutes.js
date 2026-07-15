const express = require('express');
const { 
  getRules, 
  createRule, 
  updateRule, 
  deleteRule 
} = require('../controllers/ruleController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All rule routes require login

router.route('/')
  .get(getRules)
  .post(authorizeRoles('Admin'), createRule);

router.route('/:id')
  .patch(authorizeRoles('Admin'), updateRule)
  .delete(authorizeRoles('Admin'), deleteRule);

module.exports = router;
