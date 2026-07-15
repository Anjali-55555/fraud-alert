const mongoose = require('mongoose');

const RiskContributorsSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
  location: { type: Number, default: 0 },
  velocity: { type: Number, default: 0 },
  device: { type: Number, default: 0 },
  merchant: { type: Number, default: 0 },
  time: { type: Number, default: 0 }
}, { _id: false });

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  merchant: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  location: String,
  country: String,
  dateTime: {
    type: Date,
    default: Date.now
  },
  paymentMethod: String,
  ipAddress: String,
  device: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Frozen'],
    default: 'Pending'
  },
  riskScore: {
    type: Number,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  riskContributors: {
    type: RiskContributorsSchema,
    default: {}
  },
  fraudStatus: {
    type: String,
    enum: ['Normal', 'Suspicious', 'Confirmed_Fraud', 'Safe'],
    default: 'Normal'
  },
  rulesTriggered: {
    type: [String],
    default: []
  },
  aiExplanation: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
