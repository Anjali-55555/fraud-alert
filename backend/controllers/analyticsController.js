const { getDashboardStats } = require('../services/Analytics/analyticsService');

// @desc    Get dashboard aggregate stats & distribution values
// @route   GET /api/analytics/dashboard
// @access  Private (Analyst/Manager/Admin)
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics
};
