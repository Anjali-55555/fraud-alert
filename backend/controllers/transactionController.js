const TransactionRepository = require('../repositories/transactionRepository');
const CustomerRepository = require('../repositories/customerRepository');
const FraudCase = require('../models/FraudCase');
const Notification = require('../models/Notification');
const { evaluateTransaction } = require('../services/RiskEngine/riskEngineService');
const { generateFraudExplanation } = require('../services/AI/aiService');
const socketService = require('../services/Notification/socketService');
const csv = require('csv-parser');
const fs = require('fs');

// @desc    Get all transactions with filters, search, sort, pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search query (matches transactionId, customerName, merchant, accountNumber)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { transactionId: searchRegex },
        { customerName: searchRegex },
        { merchant: searchRegex },
        { accountNumber: searchRegex }
      ];
    }

    // Role specific restrictions
    if (req.user.role === 'Customer') {
      // Find customer associated with user email
      const customerObj = await CustomerRepository.findAll({ filter: { email: req.user.email } });
      if (customerObj && customerObj.length > 0) {
        filter.customerId = customerObj[0].customerId;
      } else {
        filter.customerId = 'MOCK_NON_EXISTENT';
      }
    }

    // Filtering by status, riskLevel, country, paymentMethod
    if (req.query.status) filter.status = req.query.status;
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    if (req.query.country) filter.country = req.query.country;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

    // Sorting
    let sort = { dateTime: -1 };
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
    }

    const transactions = await TransactionRepository.findAll({ filter, sort, skip, limit });
    const total = await TransactionRepository.count(filter);

    res.json({
      success: true,
      data: transactions,
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

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await TransactionRepository.findById(req.params.id);
    if (!transaction) {
      res.status(404);
      throw new Error(`Transaction ${req.params.id} not found`);
    }

    // Check customer access restriction
    if (req.user.role === 'Customer') {
      const customer = await CustomerRepository.findById(transaction.customerId);
      if (!customer || customer.email !== req.user.email) {
        res.status(403);
        throw new Error('Access denied to this transaction record');
      }
    }

    // Fetch related fraud case if exists
    const fraudCase = await FraudCase.findOne({ transactionId: req.params.id });

    res.json({
      success: true,
      data: transaction,
      caseDetails: fraudCase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process a transaction (Evaluate risk + Generate AI Explanation + WebSocket Emit)
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const txInput = req.body;
    
    // Generate transactionId if not provided
    if (!txInput.transactionId) {
      txInput.transactionId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    }
    if (!txInput.dateTime) {
      txInput.dateTime = new Date();
    }

    // 1. Run through dynamic risk engine
    const engineResult = await evaluateTransaction(txInput);
    
    // Assign evaluated metrics
    const newTxData = {
      ...txInput,
      riskScore: engineResult.riskScore,
      riskLevel: engineResult.riskLevel,
      riskContributors: engineResult.riskContributors,
      rulesTriggered: engineResult.rulesTriggered,
      fraudStatus: engineResult.riskLevel === 'High' ? 'Suspicious' : 'Normal',
      status: engineResult.riskLevel === 'High' ? 'Pending' : 'Approved'
    };

    // 2. Generate explanation using AI service
    newTxData.aiExplanation = await generateFraudExplanation(newTxData);

    // 3. Create in DB
    const transaction = await TransactionRepository.create(newTxData);

    // 4. Update Customer risk profile and add risk timeline history entry
    if (transaction.customerId) {
      const timelineEntry = {
        date: transaction.dateTime,
        riskScore: transaction.riskScore,
        riskLevel: transaction.riskLevel,
        triggerReason: transaction.rulesTriggered.join(', ') || 'Normal Activity'
      };
      await CustomerRepository.addRiskTimelineEntry(transaction.customerId, timelineEntry);
    }

    // 5. Emit websocket update to dashboards
    socketService.emitNewTransaction(transaction);

    // 6. If High Risk, generate alert notification & audit case
    if (transaction.riskLevel === 'High') {
      const alertMessage = `Critical Warning: Account takeover or velocity fraud suspected at ${transaction.merchant} for $${transaction.amount}`;
      
      const notification = await Notification.create({
        title: 'Critical Fraud Alert',
        message: alertMessage,
        type: 'Critical'
      });

      socketService.emitAlert(notification);

      // Initialize Fraud Investigation Case
      const caseId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
      await FraudCase.create({
        caseId,
        transactionId: transaction.transactionId,
        status: 'Open',
        timeline: [
          {
            activity: 'Transaction Flagged by Risk Engine',
            performer: 'System AI'
          }
        ],
        notes: [
          {
            analystName: 'System AI',
            text: `Flagged automatically with score ${transaction.riskScore}/100. Triggered rules: ${transaction.rulesTriggered.join(', ')}`
          }
        ]
      });
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update investigation state of a transaction
// @route   PATCH /api/transactions/:id/resolve
// @access  Private (Analyst/Admin/Manager)
const resolveTransaction = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    const txId = req.params.id;

    const transaction = await TransactionRepository.findById(txId);
    if (!transaction) {
      res.status(404);
      throw new Error(`Transaction ${txId} not found`);
    }

    const performerName = `${req.user.firstName} ${req.user.lastName}`;
    
    // Status translation
    let targetStatus = transaction.status;
    let targetFraudStatus = transaction.fraudStatus;

    if (action === 'Approve') {
      targetStatus = 'Approved';
      targetFraudStatus = 'Safe';
    } else if (action === 'Reject') {
      targetStatus = 'Rejected';
      targetFraudStatus = 'Confirmed_Fraud';
    } else if (action === 'Freeze') {
      targetStatus = 'Frozen';
      targetFraudStatus = 'Confirmed_Fraud';
    } else if (action === 'Mark_Safe') {
      targetFraudStatus = 'Safe';
      targetStatus = 'Approved';
    } else if (action === 'Mark_Fraud') {
      targetFraudStatus = 'Confirmed_Fraud';
      targetStatus = 'Rejected';
    }

    // Update Transaction
    const updatedTx = await TransactionRepository.update(txId, {
      status: targetStatus,
      fraudStatus: targetFraudStatus
    });

    // Update Fraud Case
    let fraudCase = await FraudCase.findOne({ transactionId: txId });
    if (!fraudCase) {
      // Create if doesn't exist
      const caseId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
      fraudCase = new FraudCase({
        caseId,
        transactionId: txId,
        status: 'Open'
      });
    }

    // Map action to Case Status
    if (action === 'Approve' || action === 'Mark_Safe') {
      fraudCase.status = 'Resolved_Safe';
    } else if (action === 'Reject' || action === 'Freeze' || action === 'Mark_Fraud') {
      fraudCase.status = 'Resolved_Fraud';
    } else {
      fraudCase.status = 'Under_Investigation';
    }

    // Add note
    if (note) {
      fraudCase.notes.push({
        analystName: performerName,
        text: note
      });
    }

    // Add timeline entry
    fraudCase.timeline.push({
      activity: `Case marked as ${action} (${targetStatus}/${targetFraudStatus})`,
      performer: performerName
    });

    await fraudCase.save();

    // Trigger update broadcast so details page updates live
    socketService.emitNewTransaction(updatedTx);

    res.json({
      success: true,
      data: updatedTx,
      caseDetails: fraudCase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import transactions from CSV
// @route   POST /api/transactions/import
// @access  Private (Admin/Analyst)
const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('CSV File upload is required');
    }

    const filePath = req.file.path;
    const importedTransactions = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Map raw CSV row columns cleanly
        importedTransactions.push({
          customerId: row.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: row.customerName || row.name || 'Anonymous Client',
          accountNumber: row.accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
          merchant: row.merchant || 'Retail Shop',
          amount: parseFloat(row.amount) || 100,
          currency: row.currency || 'USD',
          location: row.location || 'New York',
          country: row.country || 'US',
          paymentMethod: row.paymentMethod || 'Credit Card',
          ipAddress: row.ipAddress || '127.0.0.1',
          device: row.device || 'Web Browser',
          dateTime: row.dateTime ? new Date(row.dateTime) : new Date()
        });
      })
      .on('end', async () => {
        // Process each transaction asynchronously
        for (const tx of importedTransactions) {
          try {
            // Evaluate risk
            const engineResult = await evaluateTransaction(tx);
            tx.transactionId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
            tx.riskScore = engineResult.riskScore;
            tx.riskLevel = engineResult.riskLevel;
            tx.riskContributors = engineResult.riskContributors;
            tx.rulesTriggered = engineResult.rulesTriggered;
            tx.fraudStatus = engineResult.riskLevel === 'High' ? 'Suspicious' : 'Normal';
            tx.status = engineResult.riskLevel === 'High' ? 'Pending' : 'Approved';

            tx.aiExplanation = await generateFraudExplanation(tx);

            const savedTx = await TransactionRepository.create(tx);

            // Update customer profile risk timelines
            const timelineEntry = {
              date: savedTx.dateTime,
              riskScore: savedTx.riskScore,
              riskLevel: savedTx.riskLevel,
              triggerReason: savedTx.rulesTriggered.join(', ') || 'Normal Activity'
            };
            await CustomerRepository.addRiskTimelineEntry(savedTx.customerId, timelineEntry);

            // Emit websockets
            socketService.emitNewTransaction(savedTx);

            if (savedTx.riskLevel === 'High') {
              const alert = await Notification.create({
                title: 'CSV High Risk Warning',
                message: `Alert: Imported CSV transaction for ${savedTx.customerName} ($${savedTx.amount}) is High Risk.`,
                type: 'Critical'
              });
              socketService.emitAlert(alert);

              // Auto Case creation
              const caseId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
              await FraudCase.create({
                caseId,
                transactionId: savedTx.transactionId,
                status: 'Open',
                notes: [{ analystName: 'System AI', text: 'Imported via CSV file scan' }],
                timeline: [{ activity: 'CSV Upload flag', performer: 'System AI' }]
              });
            }
          } catch (e) {
            console.error(`[CSV Import Row Fail]: ${e.message}`);
          }
        }

        // Remove temp file
        fs.unlinkSync(filePath);

        res.json({
          success: true,
          message: `CSV Imported successfully. Processed ${importedTransactions.length} transaction entries.`
        });
      })
      .on('error', (err) => {
        res.status(500);
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions list to CSV format
// @route   GET /api/transactions/export
// @access  Private (Admin/Analyst/Manager)
const exportCSV = async (req, res, next) => {
  try {
    const transactions = await TransactionRepository.findAll({ limit: 1000 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions-export.csv"');

    // Headers
    res.write('transactionId,customerId,customerName,amount,currency,merchant,country,dateTime,status,riskScore,riskLevel,rulesTriggered\n');

    transactions.forEach(tx => {
      const escapedName = tx.customerName.replace(/"/g, '""');
      const escapedMerchant = tx.merchant.replace(/"/g, '""');
      const rules = tx.rulesTriggered.join('|');
      res.write(`"${tx.transactionId}","${tx.customerId}","${escapedName}",${tx.amount},"${tx.currency}","${escapedMerchant}","${tx.country}","${tx.dateTime.toISOString()}","${tx.status}",${tx.riskScore},"${tx.riskLevel}","${rules}"\n`);
    });

    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction (Admin only)
// @route   DELETE /api/transactions/:id
// @access  Private (Admin)
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await TransactionRepository.findById(req.params.id);
    if (!transaction) {
      res.status(404);
      throw new Error(`Transaction ${req.params.id} not found`);
    }

    await TransactionRepository.delete(req.params.id);
    await FraudCase.deleteOne({ transactionId: req.params.id });

    res.json({
      success: true,
      message: `Transaction ${req.params.id} and associated investigation cases removed successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  resolveTransaction,
  importCSV,
  exportCSV,
  deleteTransaction
};
