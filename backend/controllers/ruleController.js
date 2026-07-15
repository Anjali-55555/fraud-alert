const FraudRule = require('../models/FraudRule');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all fraud rules
// @route   GET /api/rules
// @access  Private
const getRules = async (req, res, next) => {
  try {
    const rules = await FraudRule.find().sort({ ruleId: 1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new dynamic fraud rule
// @route   POST /api/rules
// @access  Private (Admin)
const createRule = async (req, res, next) => {
  try {
    const { name, description, type, parameters, severity, scoreWeight } = req.body;
    
    // Generate new unique ruleId
    const count = await FraudRule.countDocuments();
    const ruleId = `RULE-${(count + 1).toString().padStart(2, '0')}`;

    const rule = await FraudRule.create({
      ruleId,
      name,
      description,
      type,
      parameters,
      severity,
      scoreWeight
    });

    // Logging action
    await ActivityLog.create({
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      role: req.user.role,
      action: 'RULE_CREATE',
      details: `Created rule ${ruleId}: ${name} with weight ${scoreWeight}`
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle rule active status or edit weights
// @route   PATCH /api/rules/:id
// @access  Private (Admin)
const updateRule = async (req, res, next) => {
  try {
    const { isActive, scoreWeight, parameters, description } = req.body;
    
    const rule = await FraudRule.findOne({ ruleId: req.params.id });
    if (!rule) {
      res.status(404);
      throw new Error(`Rule ${req.params.id} not found`);
    }

    if (isActive !== undefined) rule.isActive = isActive;
    if (scoreWeight !== undefined) rule.scoreWeight = scoreWeight;
    if (parameters !== undefined) rule.parameters = parameters;
    if (description !== undefined) rule.description = description;

    await rule.save();

    // Log admin action
    await ActivityLog.create({
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      role: req.user.role,
      action: 'RULE_UPDATE',
      details: `Updated rule ${req.params.id} parameters. Active: ${rule.isActive}`
    });

    res.json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a rule
// @route   DELETE /api/rules/:id
// @access  Private (Admin)
const deleteRule = async (req, res, next) => {
  try {
    const rule = await FraudRule.findOneAndDelete({ ruleId: req.params.id });
    if (!rule) {
      res.status(404);
      throw new Error(`Rule ${req.params.id} not found`);
    }

    // Log admin action
    await ActivityLog.create({
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      role: req.user.role,
      action: 'RULE_DELETE',
      details: `Deleted rule ${req.params.id}`
    });

    res.json({ success: true, message: `Rule ${req.params.id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRules,
  createRule,
  updateRule,
  deleteRule
};
