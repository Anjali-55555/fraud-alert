const Transaction = require('../models/Transaction');

class TransactionRepository {
  async findAll({ filter = {}, sort = { dateTime: -1 }, skip = 0, limit = 50 } = {}) {
    return Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filter = {}) {
    return Transaction.countDocuments(filter);
  }

  async findById(id) {
    return Transaction.findOne({ transactionId: id });
  }

  async findByObjectId(objectId) {
    return Transaction.findById(objectId);
  }

  async create(txData) {
    const transaction = new Transaction(txData);
    return transaction.save();
  }

  async update(id, updates) {
    return Transaction.findOneAndUpdate(
      { transactionId: id },
      { $set: updates },
      { new: true }
    );
  }

  async delete(id) {
    return Transaction.deleteOne({ transactionId: id });
  }
}

module.exports = new TransactionRepository();
