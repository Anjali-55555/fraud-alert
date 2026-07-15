const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const signAccessToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'secretkey_fraud_alert_lite', 
    { expiresIn: '15m' }
  );
};

const signRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_REFRESH_SECRET || 'refreshsecret_fraud_alert_lite', 
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'Customer',
      verificationToken
    });

    // Auto-create customer profile document for Customers
    if (user.role === 'Customer') {
      const averageSpending = user.email === 'ramadevik768@gmail.com' ? 365 : 0;
      
      const newCust = await Customer.create({
        customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: '',
        accountNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
        averageSpending,
        riskLevel: 'Low',
        trustedDevices: ['Chrome OS / Windows Desktop', 'iPhone 15 / Safari Mobile'],
        trustedLocations: ['US', 'IN'],
        status: 'Active',
        riskTimeline: [
          { date: new Date(Date.now() - 5*24*60*60*1000), riskScore: 8, riskLevel: 'Low', triggerReason: 'Normal activity' },
          { date: new Date(Date.now() - 2*24*60*60*1000), riskScore: 12, riskLevel: 'Low', triggerReason: 'Normal activity' }
        ]
      });

      if (user.email === 'ramadevik768@gmail.com') {
        const Transaction = require('../models/Transaction');
        
        await Transaction.insertMany([
          {
            transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
            customerId: newCust.customerId,
            customerName: newCust.fullName,
            accountNumber: newCust.accountNumber,
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
          },
          {
            transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
            customerId: newCust.customerId,
            customerName: newCust.fullName,
            accountNumber: newCust.accountNumber,
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
          },
          {
            transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
            customerId: newCust.customerId,
            customerName: newCust.fullName,
            accountNumber: newCust.accountNumber,
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
          },
          {
            transactionId: `TXN-${Math.floor(3000000 + Math.random() * 9000000)}`,
            customerId: newCust.customerId,
            customerName: newCust.fullName,
            accountNumber: newCust.accountNumber,
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
          }
        ]);
      }
    }

    console.log(`[Auth Signup] User created: ${email}. Mock verification token: ${verificationToken}`);

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email address or password');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('Account suspended. Please contact system support.');
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token is missing');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshsecret_fraud_alert_lite');
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('User associated with token no longer active');
    }

    const newAccessToken = signAccessToken(user._id);
    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(401);
    next(new Error('Invalid refresh token signature'));
  }
};

// @desc    Verify email address (Mock simulation)
// @route   POST /api/auth/verify-email
// @access  Private
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    if (user.verificationToken !== token) {
      res.status(400);
      throw new Error('Verification code incorrect or expired');
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email address verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Mock simulation)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No user account with that email address');
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log(`[Forgot Password] Mock email sent to: ${email}. Reset code: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset code printed to logs/console'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password (Mock simulation)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Reset code is invalid or has expired');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout / clear cookies
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  signup,
  login,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout
};
