const Customer = require('../models/Customer');
const { createTransaction } = require('./transactionController');

let simulationIntervalId = null;

const merchantList = [
  'Supermarket Express', 'Central Gas Station', 'Downtown Coffee House', 
  'Luxury Watch Boutique', 'Global Crypto Exchange', 'Anonymous VPN Provider',
  'Electronics Plaza', 'City Public Transit', 'High Stakes Casino'
];

const countryList = ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'BR', 'RU', 'ZA', 'UA'];
const cityList = ['New York', 'Toronto', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sao Paulo', 'Moscow', 'Cape Town', 'Kyiv'];
const deviceList = ['Chrome OS / Desktop', 'iPhone 15 / Safari', 'Samsung S24 / Mobile app', 'Unknown Device / Opera', 'MacBook Pro / Firefox'];
const paymentMethods = ['Credit Card', 'Debit Card', 'Wire Transfer', 'Apple Pay', 'PayPal'];

const generateRandomTxData = async () => {
  // Grab a random customer from DB
  const customers = await Customer.find();
  if (customers.length === 0) return null;
  const randomCustomer = customers[Math.floor(Math.random() * customers.length)];

  // 15% chance of high risk anomaly
  const isAnomaly = Math.random() < 0.15;
  const countryIndex = Math.floor(Math.random() * countryList.length);

  const amount = isAnomaly 
    ? Math.floor(randomCustomer.averageSpending * (4 + Math.random() * 8)) // 4x-12x avg spend
    : Math.floor(10 + Math.random() * randomCustomer.averageSpending);

  const country = isAnomaly 
    ? countryList[countryIndex] // potentially mismatched country
    : (randomCustomer.trustedLocations[0] || 'US');

  const device = isAnomaly 
    ? deviceList[Math.floor(Math.random() * deviceList.length)] // potentially mismatch device
    : (randomCustomer.trustedDevices[0] || 'Chrome OS / Desktop');

  const merchant = isAnomaly
    ? 'Global Crypto Exchange'
    : merchantList[Math.floor(Math.random() * 4)]; // normal merchants are first 4 in array

  return {
    customerId: randomCustomer.customerId,
    customerName: randomCustomer.fullName,
    accountNumber: randomCustomer.accountNumber,
    merchant,
    amount,
    currency: 'USD',
    location: cityList[countryIndex],
    country,
    dateTime: new Date(),
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    ipAddress: `192.168.1.${Math.floor(10 + Math.random() * 240)}`,
    device
  };
};

const triggerSingleSimulationTx = async () => {
  try {
    const txData = await generateRandomTxData();
    if (!txData) return;
    
    // Simulate req/res objects for controller invocation
    const mockReq = { body: txData };
    const mockRes = {
      status: () => mockRes,
      json: (data) => console.log(`[Simulator Engine] Auto transaction created: ${data.data.transactionId} (Risk: ${data.data.riskLevel})`)
    };
    const mockNext = (err) => console.error(`[Simulator Engine] Error during auto transaction:`, err.message);

    await createTransaction(mockReq, mockRes, mockNext);
  } catch (e) {
    console.error('[Simulator Engine] Failed to tick transaction:', e.message);
  }
};

// @desc    Start live transaction streaming
// @route   POST /api/simulator/start
// @access  Private (Admin)
const startSimulation = async (req, res, next) => {
  try {
    if (simulationIntervalId) {
      return res.status(400).json({ success: false, message: 'Simulation is already running' });
    }

    const intervalSeconds = parseInt(req.body.interval) || 5;

    simulationIntervalId = setInterval(async () => {
      await triggerSingleSimulationTx();
    }, intervalSeconds * 1000);

    console.log(`[Simulator Engine] Started. Emitting random transactions every ${intervalSeconds}s.`);
    res.json({ success: true, message: `Live transaction feed started. Interval: ${intervalSeconds}s` });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop live transaction streaming
// @route   POST /api/simulator/stop
// @access  Private (Admin)
const stopSimulation = async (req, res, next) => {
  try {
    if (!simulationIntervalId) {
      return res.status(400).json({ success: false, message: 'Simulation is not running' });
    }

    clearInterval(simulationIntervalId);
    simulationIntervalId = null;

    console.log('[Simulator Engine] Stopped.');
    res.json({ success: true, message: 'Live transaction feed stopped.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger instant high-risk fraud burst
// @route   POST /api/simulator/burst
// @access  Private (Admin)
const triggerBurst = async (req, res, next) => {
  try {
    const customers = await Customer.find();
    if (customers.length === 0) {
      res.status(400);
      throw new Error('No customers found. Seed the database first.');
    }

    console.log('[Simulator Engine] Triggering high risk fraud burst (5 anomalies)...');

    for (let i = 0; i < 5; i++) {
      const cust = customers[Math.floor(Math.random() * customers.length)];
      
      const burstTx = {
        customerId: cust.customerId,
        customerName: cust.fullName,
        accountNumber: cust.accountNumber,
        merchant: 'High Stakes Casino',
        amount: Math.floor(cust.averageSpending * (6 + i)),
        currency: 'USD',
        location: 'Moscow',
        country: 'RU',
        dateTime: new Date(),
        paymentMethod: 'Wire Transfer',
        ipAddress: `82.102.${10 + i}.23`,
        device: 'Unknown Device / Opera'
      };

      const mockReq = { body: burstTx };
      const mockRes = {
        status: () => mockRes,
        json: (data) => console.log(`[Simulator Burst] Created: ${data.data.transactionId} (Score: ${data.data.riskScore})`)
      };
      const mockNext = (err) => console.error(`[Simulator Burst Error]:`, err.message);

      await createTransaction(mockReq, mockRes, mockNext);
    }

    res.json({ success: true, message: 'Successfully triggered fraud burst sequence (5 High Risk alerts generated).' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startSimulation,
  stopSimulation,
  triggerBurst
};
