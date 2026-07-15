const mongoose = require('mongoose');

const RiskTimelineSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  riskScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  triggerReason: String
});

const CustomerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: String,
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  averageSpending: {
    type: Number,
    default: 1000
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  trustedDevices: {
    type: [String],
    default: []
  },
  trustedLocations: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Active', 'Flagged', 'Suspended'],
    default: 'Active'
  },
  riskTimeline: [RiskTimelineSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);
