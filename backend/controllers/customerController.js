const CustomerRepository = require('../repositories/customerRepository');
const Transaction = require('../models/Transaction');

// @desc    Get all customers with pagination & filters
// @route   GET /api/customers
// @access  Private (Analyst/Manager/Admin)
const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { customerId: searchRegex },
        { email: searchRegex },
        { accountNumber: searchRegex }
      ];
    }

    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    if (req.query.status) filter.status = req.query.status;

    const customers = await CustomerRepository.findAll({ filter, skip, limit });
    const total = await CustomerRepository.count(filter);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer profile by customerId
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await CustomerRepository.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error(`Customer ${req.params.id} not found`);
    }

    // Role specific validation: Customer can only view their own profile
    if (req.user.role === 'Customer' && customer.email !== req.user.email) {
      res.status(403);
      throw new Error('Unauthorized to view this customer profile');
    }

    // Fetch transaction counts and summaries
    const totalTxCount = await Transaction.countDocuments({ customerId: customer.customerId });
    const fraudTxCount = await Transaction.countDocuments({ 
      customerId: customer.customerId,
      fraudStatus: 'Confirmed_Fraud' 
    });

    const recentTx = await Transaction.find({ customerId: customer.customerId })
      .sort({ dateTime: -1 })
      .limit(10);

    res.json({
      success: true,
      data: customer,
      stats: {
        totalTransactions: totalTxCount,
        fraudCount: fraudTxCount
      },
      recentTransactions: recentTx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a trusted parameter (device or location)
// @route   POST /api/customers/:id/trust
// @access  Private (Customer/Analyst/Admin)
const addTrustedParameter = async (req, res, next) => {
  try {
    const { type, value } = req.body;
    const customer = await CustomerRepository.findById(req.params.id);

    if (!customer) {
      res.status(404);
      throw new Error(`Customer ${req.params.id} not found`);
    }

    if (type === 'device') {
      if (!customer.trustedDevices.includes(value)) {
        customer.trustedDevices.push(value);
      }
    } else if (type === 'location') {
      if (!customer.trustedLocations.includes(value)) {
        customer.trustedLocations.push(value);
      }
    } else {
      res.status(400);
      throw new Error("Invalid trust type. Must be 'device' or 'location'");
    }

    await customer.save();
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer profile
// @route   GET /api/customers/me
// @access  Private (Customer)
const getMyProfile = async (req, res, next) => {
  try {
    const Customer = require('../models/Customer');
    const customer = await Customer.findOne({ email: req.user.email });
    if (!customer) {
      res.status(404);
      throw new Error(`Customer profile not found for email ${req.user.email}`);
    }

    // Fetch transaction counts and summaries
    const totalTxCount = await Transaction.countDocuments({ customerId: customer.customerId });
    const fraudTxCount = await Transaction.countDocuments({ 
      customerId: customer.customerId,
      fraudStatus: 'Confirmed_Fraud' 
    });

    const recentTx = await Transaction.find({ customerId: customer.customerId })
      .sort({ dateTime: -1 })
      .limit(10);

    res.json({
      success: true,
      data: customer,
      stats: {
        totalTransactions: totalTxCount,
        fraudCount: fraudTxCount
      },
      recentTransactions: recentTx
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  addTrustedParameter,
  getMyProfile
};
