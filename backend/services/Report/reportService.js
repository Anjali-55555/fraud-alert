const Transaction = require('../../models/Transaction');
const Customer = require('../../models/Customer');
const { generateFraudExplanation } = require('../AI/aiService');

const generateInvestigationReport = async (transactionId, generatedBy) => {
  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) {
    throw new Error(`Transaction ${transactionId} not found`);
  }

  const customer = await Customer.findOne({ customerId: transaction.customerId });
  const aiExplanation = await generateFraudExplanation(transaction);

  const reportId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
  const date = new Date().toLocaleDateString();

  const businessImpact = transaction.amount > 5000 
    ? 'High Financial Exposure. Direct capital threat avoided upon instant card freeze.'
    : 'Moderate Financial Threat. Attempted transfer flagged prior to settlement.';

  const recommendations = transaction.riskScore > 75
    ? [
        'Mandatory account suspension and multi-factor authentication reset.',
        'Revoke API credentials for recently added untrusted devices.',
        'Flag current IP address block in firewall configuration.',
        'Contact merchant provider to reverse associated authorizations.'
      ]
    : [
        'Request secondary verification call from account owner.',
        'Add current device to temporary watch-list.',
        'Keep account active but monitor transaction velocity closely for 48 hours.'
      ];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1F2937; margin: 40px; }
        .header { border-bottom: 2px solid #374151; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .title { font-size: 20px; margin-top: 10px; font-weight: 600; text-transform: uppercase; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; font-size: 14px; background: #F9FAFB; padding: 15px; border-radius: 6px; }
        .section-title { font-size: 16px; font-weight: bold; color: #111827; border-left: 4px solid #4F46E5; padding-left: 10px; margin: 25px 0 10px 0; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #E5E7EB; padding: 8px 12px; text-align: left; font-size: 13px; }
        .table th { background-color: #F3F4F6; font-weight: 600; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .badge-danger { background-color: #FEE2E2; color: #991B1B; }
        .badge-warning { background-color: #FEF3C7; color: #92400E; }
        .bullet-list { margin-left: 20px; font-size: 14px; line-height: 1.5; }
        .footer { font-size: 11px; text-align: center; color: #9CA3AF; margin-top: 50px; border-top: 1px solid #E5E7EB; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">FraudAlert Lite</div>
        <div class="title">Official AI Investigation Report</div>
      </div>
      
      <div class="meta-grid">
        <div><strong>Report ID:</strong> ${reportId}</div>
        <div><strong>Generation Date:</strong> ${date}</div>
        <div><strong>Investigator/Analyst:</strong> ${generatedBy}</div>
        <div><strong>Target Transaction:</strong> ${transactionId}</div>
      </div>

      <div class="section-title">1. Executive Summary</div>
      <p style="font-size: 14px; line-height: 1.6;">
        This document outlines the AI and rule-based fraud findings for transaction ID <strong>${transactionId}</strong> requested by customer <strong>${transaction.customerName}</strong>. 
        The transaction was evaluated as <strong>${transaction.riskLevel} Risk</strong> with an aggregated threat score of <strong>${transaction.riskScore}/100</strong>.
      </p>

      <div class="section-title">2. Core Transaction Details</div>
      <table class="table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Account Number</td><td>${transaction.accountNumber}</td></tr>
          <tr><td>Amount</td><td><strong>$${transaction.amount} ${transaction.currency}</strong></td></tr>
          <tr><td>Merchant</td><td>${transaction.merchant}</td></tr>
          <tr><td>Geographic Location</td><td>${transaction.location}, ${transaction.country}</td></tr>
          <tr><td>Device Signature</td><td>${transaction.device}</td></tr>
          <tr><td>IP Address</td><td>${transaction.ipAddress}</td></tr>
          <tr><td>Triggered Rules</td><td>${transaction.rulesTriggered.join(', ') || 'None'}</td></tr>
        </tbody>
      </table>

      <div class="section-title">3. AI Copilot Threat Diagnosis</div>
      <blockquote style="font-style: italic; background: #F3F4F6; padding: 15px; border-radius: 6px; font-size: 14px; border-left: 4px solid #9CA3AF; line-height: 1.5; margin: 10px 0;">
        "${aiExplanation}"
      </blockquote>

      <div class="section-title">4. Business Impact & Exposure</div>
      <p style="font-size: 14px; line-height: 1.5;">${businessImpact}</p>

      <div class="section-title">5. Recommended Action Checklist</div>
      <ul class="bullet-list">
        ${recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>

      <div class="footer">
        CONFIDENTIAL - FINANCIAL FRAUD INTELLIGENCE UNIT REPORT PORTAL<br/>
        This document is automatically generated by the FraudAlert Lite Threat Detection engine and is intended for internal banking compliance use only.
      </div>
    </body>
    </html>
  `;

  return {
    reportId,
    transactionId,
    generatedBy,
    title: `Investigation Report for ${transactionId}`,
    summary: `Risk scoring details for transaction ${transactionId} of ${transaction.customerName}.`,
    businessImpact,
    recommendations,
    htmlContent
  };
};

module.exports = {
  generateInvestigationReport
};
