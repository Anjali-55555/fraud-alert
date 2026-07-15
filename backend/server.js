require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const socketService = require('./services/Notification/socketService');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const customerRoutes = require('./routes/customerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const copilotRoutes = require('./routes/copilotRoutes');
const reportRoutes = require('./routes/reportRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, replace with specific frontend domain
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});
socketService.init(io);

// Connect Database
connectDB();

// Security & Request Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP locally for easier iframe/PDF rendering
}));

app.use(cors({
  origin: '*', // Allow all origins for dev/testing
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom lightweight cookie parser to avoid dependency issues
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || '';
  const cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    }
  });
  req.cookies = cookies;
  next();
});

// Rate limiting (Protect routes from brute force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'FraudAlert Lite Core API Service Online', status: 'operational', timestamp: new Date() });
});

// Serve uploads static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/simulator', simulatorRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`[Server] FraudAlert Lite server running on port: ${PORT}`);
  });
}

module.exports = app;
