const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  AI_MODEL_URL: process.env.AI_MODEL_URL || 'http://localhost:8000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  UPLOAD_DIR: path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
  MAX_FILE_SIZE_BYTES: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024,
};
