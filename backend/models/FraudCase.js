const mongoose = require('mongoose');

const TimelineEntrySchema = new mongoose.Schema({
  activity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  performer: { type: String, required: true }
}, { _id: false });

const NoteSchema = new mongoose.Schema({
  analystName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const FraudCaseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true
  },
  analystId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Open', 'Under_Investigation', 'Resolved_Fraud', 'Resolved_Safe'],
    default: 'Open'
  },
  notes: [NoteSchema],
  timeline: [TimelineEntrySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('FraudCase', FraudCaseSchema);
