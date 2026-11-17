const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend access
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(config.UPLOAD_DIR));

// API Routes
app.use('/api', predictionRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Potato Leaf Disease Classification API Backend is running',
    version: '1.0.0',
    endpoints: {
      predict: 'POST /api/predict (multipart/form-data with "image" field)',
      health: 'GET /api/health',
      classes: 'GET /api/classes',
    },
  });
});

// Multer and general error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File is too large. Maximum allowed size is ${config.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
      });
    }
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, error: err.message });
  }

  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'An unexpected error occurred on the server.',
  });
});

// Start Server
app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌿 Potato Leaf Disease AI Backend running on port ${config.PORT}`);
  console.log(`🚀 API Base URL: http://localhost:${config.PORT}/api`);
  console.log(`🤖 Target AI Model Service: ${config.AI_MODEL_URL}`);
  console.log(`=======================================================`);
});
