require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const FraudCase = require('../models/FraudCase');
const FraudRule = require('../models/FraudRule');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const connectDB = require('../config/db');

const rulesData = [
  {
    ruleId: 'RULE-01',
    name: 'Amount Threshold Anomaly',
    description: 'Triggers when a transaction amount exceeds $5,000 or is 3x customer average spending',
    type: 'amount_threshold',
    parameters: { threshold: 5000 },
    isActive: true,
    severity: 'Medium',
    scoreWeight: 20
  },
  {
    ruleId: 'RULE-02',
    name: 'High Frequency Velocity Threat',
    description: 'Triggers when a customer conducts 3 or more transactions within a single hour',
    type: 'velocity_limit',
    parameters: { limit: 3 },
    isActive: true,
    severity: 'High',
    scoreWeight: 25
  },
  {
    ruleId: 'RULE-03',
    name: 'Geographic Distance Mismatch',
    description: 'Triggers when a transaction originates from a country outside the customer\'s trusted list',
    type: 'country_mismatch',
    parameters: {},
    isActive: true,
    severity: 'Medium',
    scoreWeight: 20
  },
  {
    ruleId: 'RULE-04',
    name: 'Untrusted Device Signature',
    description: 'Triggers when access is attempted from a device not registered on the customer\'s profile',
    type: 'device_mismatch',
    parameters: {},
    isActive: true,
    severity: 'Low',
    scoreWeight: 15
  },
  {
    ruleId: 'RULE-05',
    name: 'Blacklisted Merchant Association',
    description: 'Triggers when the merchant matches known threat entities or cryptocurrency exchanges',
    type: 'blacklisted_merchant',
    parameters: { blacklist: ['Global Crypto Exchange', 'Lux Shop Overseas', 'Unknown Transfer ATM'] },
    isActive: true,
    severity: 'High',
    scoreWeight: 30
  },
  {
    ruleId: 'RULE-06',
    name: 'Unusual Transaction Time Window',
    description: 'Triggers when a transaction is processed during high-fraud window (12:00 AM - 5:00 AM)',
    type: 'unusual_time',
    parameters: {},
    isActive: true,
    severity: 'Low',
    scoreWeight: 10
  }
];

const seed = async () => {
  try {
    await connectDB();

    // 1. Clear database
    console.log('[Seeder] Cleaning existing collections...');
    await User.deleteMany();
    await Customer.deleteMany();
    await Transaction.deleteMany();
    await FraudCase.deleteMany();
    await FraudRule.deleteMany();
    await Notification.deleteMany();
    await ActivityLog.deleteMany();

    // 2. Seed rules
    console.log('[Seeder] Seeding fraud rules...');
    await FraudRule.insertMany(rulesData);

    // 3. Seed users
    console.log('[Seeder] Seeding staff & user accounts...');
    
    // We will save them individually to trigger password pre-save hashing
    const admin = new User({ email: 'admin@fraudalert.com', password: 'password123', role: 'Admin', firstName: 'Sarah', lastName: 'Connor', emailVerified: true });
    await admin.save();
    
    const manager = new User({ email: 'manager@fraudalert.com', password: 'password123', role: 'Manager', firstName: 'David', lastName: 'Goliath', emailVerified: true });
    await manager.save();

    const analysts = [];
    for (let i = 1; i <= 3; i++) {
      const analyst = new User({
        email: `analyst${i}@fraudalert.com`,
        password: 'password123',
        role: 'Analyst',
        firstName: `Analyst_${i}`,
        lastName: 'Specialist',
        emailVerified: true
      });
      await analyst.save();
      analysts.push(analyst);
    }

    const customerUser = new User({
      email: 'customer@fraudalert.com',
      password: 'password123',
      role: 'Customer',
      firstName: 'John',
      lastName: 'Doe',
      emailVerified: true
    });
    await customerUser.save();

    const customerUser2 = new User({
      email: 'ramadevik768@gmail.com',
      password: 'ramadevi55',
      role: 'Customer',
      firstName: 'Kanneboyina',
      lastName: 'Ramadevi',
      emailVerified: true
    });
    await customerUser2.save();

    // 4. Seed customers (100 customers)
    console.log('[Seeder] Generating 100 customer profiles...');
    const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Robert', 'Mary', 'William', 'Linda', 'David', 'Elizabeth'];
    const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Williams', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];
    const countries = ['US', 'US', 'US', 'US', 'CA', 'GB', 'DE', 'FR', 'JP', 'BR'];
    const deviceTypes = ['Chrome OS / Windows Desktop', 'macOS / Chrome browser', 'iPhone 15 / Safari Mobile', 'Android 14 / Chrome Mobile'];

    const customerDocs = [];
    
    // Seed John Doe specifically
    const johnDoeCust = new Customer({
      customerId: 'CUST-1000',
      userId: customerUser._id,
      fullName: 'John Doe',
      email: 'customer@fraudalert.com',
      phoneNumber: '+1-555-0199',
      accountNumber: 'ACC-883902',
      averageSpending: 850,
      riskLevel: 'Low',
      trustedDevices: ['Chrome OS / Windows Desktop', 'iPhone 15 / Safari Mobile'],
      trustedLocations: ['US', 'CA'],
      status: 'Active',
      riskTimeline: [
        { date: new Date(Date.now() - 5*24*60*60*1000), riskScore: 10, riskLevel: 'Low', triggerReason: 'Normal activity' },
        { date: new Date(Date.now() - 2*24*60*60*1000), riskScore: 15, riskLevel: 'Low', triggerReason: 'Normal activity' }
      ]
    });
    await johnDoeCust.save();
    customerDocs.push(johnDoeCust);

    // Seed Kanneboyina Ramadevi specifically
    const ramadeviCust = new Customer({
      customerId: 'CUST-2000',
      userId: customerUser2._id,
      fullName: 'Kanneboyina Ramadevi',
      email: 'ramadevik768@gmail.com',
      phoneNumber: '+1-555-0210',
      accountNumber: 'ACC-992301',
      averageSpending: 365,
      riskLevel: 'Low',
      trustedDevices: ['Chrome OS / Windows Desktop', 'iPhone 15 / Safari Mobile'],
      trustedLocations: ['US', 'IN'],
      status: 'Active',
      riskTimeline: [
        { date: new Date(Date.now() - 5*24*60*60*1000), riskScore: 8, riskLevel: 'Low', triggerReason: 'Normal spending' },
        { date: new Date(Date.now() - 2*24*60*60*1000), riskScore: 12, riskLevel: 'Low', triggerReason: 'Normal spending' }
      ]
    });
    await ramadeviCust.save();
    customerDocs.push(ramadeviCust);

    for (let i = 1; i <= 99; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const homeCountry = countries[Math.floor(Math.random() * countries.length)];
      const avgSpend = Math.floor(200 + Math.random() * 2800);
      
      const custId = `CUST-${(1000 + i)}`;

      // Create random risk timeline history for Risk Graph
      const timeline = [];
      const steps = 4;
      let currentRisk = 'Low';
      for (let s = steps; s >= 0; s--) {
        const score = Math.floor(5 + Math.random() * 40);
        let level = 'Low';
        if (score > 35) level = 'Medium';
        timeline.push({
          date: new Date(Date.now() - s * 24 * 60 * 60 * 1000),
          riskScore: score,
          riskLevel: level,
          triggerReason: score > 35 ? 'Unusual transaction hour' : 'Normal spending'
        });
        currentRisk = level;
      }

      const customer = new Customer({
        customerId: custId,
        fullName: `${fName} ${lName}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@fraudalert.com`,
        phoneNumber: `+1-555-${Math.floor(100000 + Math.random() * 900000)}`,
        accountNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
        averageSpending: avgSpend,
        riskLevel: currentRisk,
        trustedDevices: [deviceTypes[Math.floor(Math.random() * deviceTypes.length)]],
        trustedLocations: [homeCountry],
        status: 'Active',
        riskTimeline: timeline
      });
      await customer.save();
      customerDocs.push(customer);
    }

    // 5. Seed transactions (500 transactions: 450 normal, 50 suspicious/fraud)
    console.log('[Seeder] Creating 500 historical transactions...');
    
    const merchantNames = ['Amazon Inc', 'Walmart', 'Apple Store', 'Target Store', 'BestBuy', 'Starbucks', 'Uber Trip', 'Shell Gas', 'Steam Games', 'Nike Store'];
    const anomalyMerchants = ['Global Crypto Exchange', 'Lux Shop Overseas', 'Unknown Transfer ATM', 'High Stakes Casino'];
    const paymentMethods = ['Credit Card', 'Debit Card', 'Wire Transfer', 'Apple Pay', 'PayPal'];

    const txDocs = [];
    const fraudCasesDocs = [];

    // Seed Kanneboyina Ramadevi transactions
    txDocs.push({
      transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
      customerId: 'CUST-2000',
      customerName: 'Kanneboyina Ramadevi',
      accountNumber: 'ACC-992301',
      merchant: 'Starbucks Coffee',
      amount: 12.50,
      currency: 'USD',
      location: 'New York',
      country: 'US',
      dateTime: new Date(Date.now() - 3*24*60*60*1000),
      paymentMethod: 'Credit Card',
      ipAddress: '192.168.1.15',
      device: 'iPhone 15 / Safari Mobile',
      status: 'Approved',
      riskScore: 5,
      riskLevel: 'Low',
      riskContributors: { amount: 0, location: 0, velocity: 0, device: 0, merchant: 0, time: 0 },
      fraudStatus: 'Normal',
      rulesTriggered: [],
      aiExplanation: 'Processed normally. Typical small coffee shop transaction.'
    });

    txDocs.push({
      transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
      customerId: 'CUST-2000',
      customerName: 'Kanneboyina Ramadevi',
      accountNumber: 'ACC-992301',
      merchant: 'Amazon Marketplace',
      amount: 145.20,
      currency: 'USD',
      location: 'Seattle',
      country: 'US',
      dateTime: new Date(Date.now() - 2*24*60*60*1000),
      paymentMethod: 'Debit Card',
      ipAddress: '192.168.1.15',
      device: 'Chrome OS / Windows Desktop',
      status: 'Approved',
      riskScore: 7,
      riskLevel: 'Low',
      riskContributors: { amount: 0, location: 0, velocity: 0, device: 0, merchant: 0, time: 0 },
      fraudStatus: 'Normal',
      rulesTriggered: [],
      aiExplanation: 'Standard e-commerce purchase from trusted device.'
    });

    txDocs.push({
      transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
      customerId: 'CUST-2000',
      customerName: 'Kanneboyina Ramadevi',
      accountNumber: 'ACC-992301',
      merchant: 'Apple Store Online',
      amount: 1299.00,
      currency: 'USD',
      location: 'Cupertino',
      country: 'US',
      dateTime: new Date(Date.now() - 24*60*60*1000),
      paymentMethod: 'Apple Pay',
      ipAddress: '192.168.1.15',
      device: 'iPhone 15 / Safari Mobile',
      status: 'Approved',
      riskScore: 12,
      riskLevel: 'Low',
      riskContributors: { amount: 5, location: 0, velocity: 0, device: 0, merchant: 0, time: 0 },
      fraudStatus: 'Normal',
      rulesTriggered: [],
      aiExplanation: 'Typical technology equipment purchase. Approved.'
    });

    txDocs.push({
      transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
      customerId: 'CUST-2000',
      customerName: 'Kanneboyina Ramadevi',
      accountNumber: 'ACC-992301',
      merchant: 'Uber Trip',
      amount: 24.50,
      currency: 'USD',
      location: 'New York',
      country: 'US',
      dateTime: new Date(Date.now() - 4*60*60*1000),
      paymentMethod: 'PayPal',
      ipAddress: '192.168.1.20',
      device: 'iPhone 15 / Safari Mobile',
      status: 'Approved',
      riskScore: 4,
      riskLevel: 'Low',
      riskContributors: { amount: 0, location: 0, velocity: 0, device: 0, merchant: 0, time: 0 },
      fraudStatus: 'Normal',
      rulesTriggered: [],
      aiExplanation: 'Routine ride share transaction.'
    });

    // A. Create 450 normal transactions
    for (let i = 0; i < 450; i++) {
      const cust = customerDocs[Math.floor(Math.random() * customerDocs.length)];
      const amount = Math.floor(5 + Math.random() * (cust.averageSpending * 1.2));
      const mName = merchantNames[Math.floor(Math.random() * merchantNames.length)];
      const date = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)); // past 30 days
      const country = cust.trustedLocations[0] || 'US';
      const device = cust.trustedDevices[0] || 'Chrome OS / Windows Desktop';

      txDocs.push({
        transactionId: `TXN-${(1000000 + i)}`,
        customerId: cust.customerId,
        customerName: cust.fullName,
        accountNumber: cust.accountNumber,
        merchant: mName,
        amount,
        currency: 'USD',
        location: 'New York',
        country,
        dateTime: date,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        ipAddress: `192.168.1.${Math.floor(10 + Math.random() * 240)}`,
        device,
        status: 'Approved',
        riskScore: Math.floor(Math.random() * 20),
        riskLevel: 'Low',
        riskContributors: { amount: 0, location: 0, velocity: 0, device: 0, merchant: 0, time: 0 },
        fraudStatus: 'Normal',
        rulesTriggered: [],
        aiExplanation: 'This transaction was processed normally. No risk factors triggered.'
      });
    }

    // B. Create 50 suspicious/fraud transactions
    for (let i = 0; i < 50; i++) {
      const cust = customerDocs[Math.floor(Math.random() * customerDocs.length)];
      const amount = Math.floor(cust.averageSpending * (4 + Math.random() * 8)); // 4x-12x spend anomaly
      const mName = anomalyMerchants[Math.floor(Math.random() * anomalyMerchants.length)];
      const date = new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)); // past 15 days
      const country = countries[Math.floor(Math.random() * countries.length)]; // random country mismatch
      const device = 'Unknown Device / Opera';
      
      const score = Math.floor(40 + Math.random() * 55); // high risk score
      let level = 'Medium';
      if (score >= 70) level = 'High';

      const rulesTriggered = [];
      const riskContributors = { amount: 0, location: 0, velocity: 0, device: 0, merchant: 0, time: 0 };

      // Set rules
      if (amount > 5000) {
        rulesTriggered.push('Amount Threshold Anomaly');
        riskContributors.amount = 20;
      }
      if (country !== cust.trustedLocations[0]) {
        rulesTriggered.push('Geographic Distance Mismatch');
        riskContributors.location = 20;
      }
      rulesTriggered.push('Untrusted Device Signature');
      riskContributors.device = 15;
      rulesTriggered.push('Blacklisted Merchant Association');
      riskContributors.merchant = 30;

      // Local mock AI explanation
      const aiExplanation = `This transaction is classified as ${level} Risk because it originated from an untrusted device (${device}) targeting a high-fraud merchant (${mName}). The transaction value ($${amount}) deviates significantly from the customer's historical average spend.`;

      const txId = `TXN-${(2000000 + i)}`;

      txDocs.push({
        transactionId: txId,
        customerId: cust.customerId,
        customerName: cust.fullName,
        accountNumber: cust.accountNumber,
        merchant: mName,
        amount,
        currency: 'USD',
        location: 'Moscow',
        country,
        dateTime: date,
        paymentMethod: 'Wire Transfer',
        ipAddress: `80.123.${Math.floor(10 + Math.random() * 200)}.${Math.floor(10 + Math.random() * 200)}`,
        device,
        status: level === 'High' ? 'Pending' : 'Approved',
        riskScore: score,
        riskLevel: level,
        riskContributors,
        fraudStatus: 'Suspicious',
        rulesTriggered,
        aiExplanation
      });

      // Update customer risk level
      cust.riskLevel = level;
      cust.status = 'Flagged';
      cust.riskTimeline.push({
        date: date,
        riskScore: score,
        riskLevel: level,
        triggerReason: rulesTriggered.join(', ')
      });
      await cust.save();

      // Create associated Fraud Case (50 cases)
      const caseStatusList = ['Open', 'Under_Investigation', 'Resolved_Fraud', 'Resolved_Safe'];
      const cStatus = caseStatusList[i % caseStatusList.length];
      const caseId = `CASE-${(1000 + i)}`;

      const assignedAnalyst = analysts[i % analysts.length];
      const performerName = `${assignedAnalyst.firstName} ${assignedAnalyst.lastName}`;

      const timeline = [
        { activity: 'Transaction Flagged by Engine', timestamp: date, performer: 'System AI' }
      ];
      const notes = [
        { analystName: 'System AI', text: `Risk Engine detected threat. Rules: ${rulesTriggered.join(', ')}`, createdAt: date }
      ];

      if (cStatus !== 'Open') {
        timeline.push({ activity: 'Case Assigned to Investigator', timestamp: new Date(date.getTime() + 10 * 60 * 1000), performer: performerName });
      }
      if (cStatus === 'Resolved_Fraud') {
        timeline.push({ activity: 'Investigator rejected transaction and froze account', timestamp: new Date(date.getTime() + 45 * 60 * 1000), performer: performerName });
        notes.push({ analystName: performerName, text: 'Transaction confirmed fraudulent. Client accounts locked down.', createdAt: new Date(date.getTime() + 45 * 60 * 1000) });
      } else if (cStatus === 'Resolved_Safe') {
        timeline.push({ activity: 'Investigator marked transaction as customer-approved', timestamp: new Date(date.getTime() + 30 * 60 * 1000), performer: performerName });
        notes.push({ analystName: performerName, text: 'Cleared. Spoke to client on phone, verified geographic mismatch was due to a business trip.', createdAt: new Date(date.getTime() + 30 * 60 * 1000) });
      }

      fraudCasesDocs.push({
        caseId,
        transactionId: txId,
        analystId: assignedAnalyst._id,
        status: cStatus,
        notes,
        timeline
      });
    }

    console.log('[Seeder] Saving all transactions to database...');
    await Transaction.insertMany(txDocs);

    console.log('[Seeder] Saving all fraud cases...');
    await FraudCase.insertMany(fraudCasesDocs);

    // 6. Seed mock notification alerts
    console.log('[Seeder] Seeding core notifications...');
    await Notification.create([
      { title: 'Critical Velocity Spike', message: 'Account ACC-883902 flagged for consecutive swipes in different countries.', type: 'Critical' },
      { title: 'New Fraud Rules Deployed', message: 'Rule RULE-05 updated with 4 new cryptocurrency merchant tags.', type: 'Info' },
      { title: 'Suspicious Device Signature', message: 'Alert: User John Doe logged in from unrecognized Safari agent in Germany.', type: 'Warning' }
    ]);

    console.log('[Seeder] Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Fatal seeding error:', error.message);
    process.exit(1);
  }
};

seed();
