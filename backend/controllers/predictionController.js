const path = require('path');
const aiService = require('../services/aiService');

const KNOWN_CLASSES = [
  {
    id: 'Potato___Early_blight',
    name: 'Early Blight',
    pathogen: 'Alternaria solani',
    risk: 'High',
  },
  {
    id: 'Potato___Late_blight',
    name: 'Late Blight',
    pathogen: 'Phytophthora infestans',
    risk: 'Severe',
  },
  {
    id: 'Potato___healthy',
    name: 'Healthy Leaf',
    pathogen: 'None',
    risk: 'Low',
  },
];

/**
 * Controller to handle image upload and AI prediction
 */
exports.predictImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please upload a potato leaf image.',
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Call AI Service
    const aiResult = await aiService.getPrediction(filePath, originalName);

    // Provide public relative URL for the uploaded image
    const imageUrl = `/uploads/${path.basename(filePath)}`;

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        imageUrl: imageUrl,
      },
      ...aiResult,
    });
  } catch (error) {
    console.error('[PredictionController] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while processing image.',
    });
  }
};

/**
 * Health check endpoint for Backend and AI Service
 */
exports.getHealth = async (req, res) => {
  const aiHealth = await aiService.checkAIHealth();
  return res.status(200).json({
    status: 'online',
    service: 'Potato Leaf Disease Classification Backend',
    uptime: process.uptime(),
    aiModelService: aiHealth,
  });
};

/**
 * List of detectable classes
 */
exports.getClasses = (req, res) => {
  return res.status(200).json({
    success: true,
    classes: KNOWN_CLASSES,
  });
};
