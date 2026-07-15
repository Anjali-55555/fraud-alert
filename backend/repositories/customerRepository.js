const Customer = require('../models/Customer');

class CustomerRepository {
  async findAll({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 50 } = {}) {
    return Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filter = {}) {
    return Customer.countDocuments(filter);
  }

  async findById(customerId) {
    return Customer.findOne({ customerId });
  }

  async create(customerData) {
    const customer = new Customer(customerData);
    return customer.save();
  }

  async update(customerId, updates) {
    return Customer.findOneAndUpdate(
      { customerId },
      { $set: updates },
      { new: true }
    );
  }

  async addRiskTimelineEntry(customerId, entry) {
    return Customer.findOneAndUpdate(
      { customerId },
      { 
        $push: { riskTimeline: entry },
        $set: { 
          riskLevel: entry.riskLevel,
          // If customer risk is high, flag profile status
          status: entry.riskLevel === 'High' ? 'Flagged' : 'Active'
        }
      },
      { new: true }
    );
  }
}

module.exports = new CustomerRepository();
