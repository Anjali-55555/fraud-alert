const FraudRule = require('../../models/FraudRule');
const Transaction = require('../../models/Transaction');
const Customer = require('../../models/Customer');

const evaluateTransaction = async (txData) => {
  // 1. Fetch dynamic rules from DB (only active ones)
  const rules = await FraudRule.find({ isActive: true });
  
  // 2. Fetch Customer info if exists
  const customer = await Customer.findOne({ customerId: txData.customerId });
  
  const rulesTriggered = [];
  let riskScore = 0;
  
  // Risk contributors breakdown object (Explainable AI)
  const riskContributors = {
    amount: 0,
    location: 0,
    velocity: 0,
    device: 0,
    merchant: 0,
    time: 0
  };

  // 3. Fetch customer's recent transactions for velocity checks
  let recentTransactions = [];
  if (txData.customerId) {
    recentTransactions = await Transaction.find({
      customerId: txData.customerId,
      dateTime: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // past 1 hour
    }).sort({ dateTime: -1 });
  }

  // Iterate over rules and verify
  for (const rule of rules) {
    let triggered = false;
    let details = '';

    switch (rule.type) {
      case 'amount_threshold': {
        const threshold = rule.parameters.threshold || 5000;
        if (txData.amount > threshold) {
          triggered = true;
          details = `Transaction amount $${txData.amount} exceeds threshold $${threshold}`;
          riskContributors.amount += rule.scoreWeight;
        }
        // Additional deviation scoring based on average spending
        if (customer && customer.averageSpending > 0) {
          const ratio = txData.amount / customer.averageSpending;
          if (ratio > 3) {
            triggered = true;
            details += ` (Amount is ${ratio.toFixed(1)}x greater than average customer spending $${customer.averageSpending})`;
            riskContributors.amount += Math.min(rule.scoreWeight, 25);
          }
        }
        break;
      }
      case 'velocity_limit': {
        const limitCount = rule.parameters.limit || 3;
        if (recentTransactions.length >= limitCount) {
          triggered = true;
          details = `Velocity limit reached. Customer had ${recentTransactions.length} other transactions in the last hour`;
          riskContributors.velocity += rule.scoreWeight;
        }
        break;
      }
      case 'country_mismatch': {
        if (customer && customer.trustedLocations && customer.trustedLocations.length > 0) {
          const isTrusted = customer.trustedLocations.includes(txData.country);
          if (!isTrusted) {
            triggered = true;
            details = `Country ${txData.country} is not in customer's trusted locations list`;
            riskContributors.location += rule.scoreWeight;
          }
        }
        // Geographic speed anomaly checks (e.g. diff country within last hour)
        if (recentTransactions.length > 0) {
          const lastTx = recentTransactions[0];
          if (lastTx.country && lastTx.country !== txData.country) {
            triggered = true;
            details = `Geographic speed anomaly: Country changed from ${lastTx.country} to ${txData.country} within an hour`;
            riskContributors.location += Math.min(rule.scoreWeight * 1.5, 30);
          }
        }
        break;
      }
      case 'device_mismatch': {
        if (customer && customer.trustedDevices && customer.trustedDevices.length > 0) {
          const isTrusted = customer.trustedDevices.includes(txData.device);
          if (!isTrusted) {
            triggered = true;
            details = `Device '${txData.device}' is not registered under customer's trusted devices`;
            riskContributors.device += rule.scoreWeight;
          }
        }
        break;
      }
      case 'blacklisted_merchant': {
        const blacklisted = rule.parameters.blacklist || [];
        const isBlacklisted = blacklisted.some(m => txData.merchant.toLowerCase().includes(m.toLowerCase()));
        if (isBlacklisted) {
          triggered = true;
          details = `Merchant '${txData.merchant}' is on the system blacklist`;
          riskContributors.merchant += rule.scoreWeight;
        }
        break;
      }
      case 'unusual_time': {
        const txDate = new Date(txData.dateTime || Date.now());
        const hours = txDate.getHours();
        if (hours >= 0 && hours <= 5) { // late night transaction 12am - 5am
          triggered = true;
          details = `Transaction placed at unusual hour: ${hours}:00`;
          riskContributors.time += rule.scoreWeight;
        }
        break;
      }
      default:
        break;
    }

    if (triggered) {
      rulesTriggered.push(rule.name);
      riskScore += rule.scoreWeight;
    }
  }

  // Calculate final score bounds
  riskScore = Math.min(riskScore, 100);
  
  // Classify risk level
  let riskLevel = 'Low';
  if (riskScore >= 70) riskLevel = 'High';
  else if (riskScore >= 35) riskLevel = 'Medium';

  return {
    rulesTriggered,
    riskScore,
    riskLevel,
    riskContributors
  };
};

module.exports = {
  evaluateTransaction
};
