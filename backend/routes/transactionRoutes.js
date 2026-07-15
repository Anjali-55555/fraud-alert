const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
  getTransactions, 
  getTransactionById, 
  createTransaction, 
  resolveTransaction, 
  importCSV, 
  exportCSV, 
  deleteTransaction 
} = require('../controllers/transactionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Setup Multer upload destination
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Routes
router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.get('/export', protect, authorizeRoles('Admin', 'Analyst', 'Manager'), exportCSV);
router.post('/import', protect, authorizeRoles('Admin', 'Analyst'), upload.single('file'), importCSV);

router.route('/:id')
  .get(protect, getTransactionById)
  .delete(protect, authorizeRoles('Admin'), deleteTransaction);

router.patch('/:id/resolve', protect, authorizeRoles('Admin', 'Analyst', 'Manager'), resolveTransaction);

module.exports = router;
