const mongoose = require('mongoose');

const FraudRuleSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'amount_threshold',
      'velocity_limit',
      'country_mismatch',
      'device_mismatch',
      'blacklisted_merchant',
      'unusual_time'
    ],
    required: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  scoreWeight: {
    type: Number,
    required: true,
    default: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FraudRule', FraudRuleSchema);
