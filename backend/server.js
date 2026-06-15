require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { defaultLimiter, aiRateLimiter } = require('./middleware/rateLimiter');

const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const campaignRoutes = require('./routes/campaigns');
const communicationRoutes = require('./routes/communications');
const audienceRoutes = require('./routes/audiences');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');
const channelRoutes = require('./routes/channel');
const autoCampaignRoutes = require('./routes/autoCampaign');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      return callback(null, true);
    }

    const originClean = origin.replace(/\/$/, '');
    const allowedOrigins = frontendUrl.split(',').map(url => url.trim().replace(/\/$/, ''));

    if (allowedOrigins.includes(originClean) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(defaultLimiter);

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/audiences', audienceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', channelRoutes);
app.use('/api/auto-campaign', autoCampaignRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
