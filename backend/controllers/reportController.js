const { generateInvestigationReport } = require('../services/Report/reportService');
const ActivityLog = require('../models/ActivityLog');

// @desc    Generate a case investigation report for a transaction
// @route   GET /api/reports/transaction/:id
// @access  Private (Analyst/Manager/Admin)
const getInvestigationReport = async (req, res, next) => {
  try {
    const txId = req.params.id;
    const analystName = `${req.user.firstName} ${req.user.lastName}`;

    const report = await generateInvestigationReport(txId, analystName);

    // Audit logs
    await ActivityLog.create({
      userId: req.user._id,
      userName: analystName,
      role: req.user.role,
      action: 'REPORT_GENERATE',
      details: `Generated AI Case Investigation Report for transaction ${txId}`
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvestigationReport
};
