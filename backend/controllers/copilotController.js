const { handleCopilotQuery } = require('../services/AI/aiService');

// @desc    Query the AI Copilot for intelligence
// @route   POST /api/copilot/query
// @access  Private (Analyst/Admin/Manager)
const queryCopilot = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400);
      throw new Error('Query text is required');
    }

    const performerName = `${req.user.firstName} ${req.user.lastName}`;
    const aiResponse = await handleCopilotQuery(query, performerName);

    res.json({
      success: true,
      reply: aiResponse
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  queryCopilot
};
