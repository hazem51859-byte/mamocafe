const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema } = require('./db');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const licensing = require('./services/licensing');

// License management route (always open)
app.use('/api/license', require('./routes/license'));

// Activation Guard Middleware (Enforced only if ENFORCE_ACTIVATION is explicitly set)
const isProductionPackage = process.env.ENFORCE_ACTIVATION === 'true';
app.use((req, res, next) => {
  if (isProductionPackage && req.path.startsWith('/api') && !req.path.startsWith('/api/license') && req.path !== '/api/health') {
    const status = licensing.checkActivationStatus();
    if (!status.isActivated) {
      return res.status(403).json({
        error: 'SYSTEM_NOT_ACTIVATED',
        message: 'النظام غير مفعل على هذا الجهاز. يرجى إدخال مفتاح التفعيل المرخص لهذا الماك أدرس.',
        machineId: status.machineId
      });
    }
  }
  next();
});

// Route handlers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pos', require('./routes/pos'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/shifts', require('./routes/shifts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/settings', require('./routes/settings'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), system: 'ZoTech Market POS Engine' });
});

// Serve client in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientDist, 'index.html'), err => {
      if (err) res.status(200).send('ZoTech POS API Server is Running.');
    });
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'حدث خطأ غير متوقع في الخادم' });
});

async function startServer() {
  try {
    await initSchema();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 ZoTech POS Server running on http://localhost:${PORT} [PostgreSQL Database: market_pos]`);
    });
  } catch (err) {
    console.error('Fatal error starting ZoTech POS Server:', err);
    process.exit(1);
  }
}

startServer();
