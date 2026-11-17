const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const predictionController = require('../controllers/predictionController');

// Upload and classify leaf image
router.post('/predict', upload.single('image'), predictionController.predictImage);

// Health check and AI status
router.get('/health', predictionController.getHealth);

// Get list of supported potato leaf disease classes
router.get('/classes', predictionController.getClasses);

module.exports = router;
