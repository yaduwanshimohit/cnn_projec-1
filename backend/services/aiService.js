const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class AIService {
  /**
   * Forward uploaded image to Python AI Model service
   * @param {string} filePath - Absolute path to uploaded image file
   * @param {string} originalName - Original uploaded filename
   * @returns {Promise<object>} Prediction result
   */
  async getPrediction(filePath, originalName) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Uploaded file not found at ${filePath}`);
    }

    try {
      const fileBuffer = await fs.promises.readFile(filePath);
      const ext = path.extname(originalName).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

      // Create standard FormData supported natively in Node.js 18+
      const formData = new FormData();
      const fileBlob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', fileBlob, originalName || 'leaf.jpg');

      const response = await fetch(`${config.AI_MODEL_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service responded with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        source: 'ai-model-service',
        ...data,
      };
    } catch (error) {
      // If AI service is not running or connection refused, log warning and provide helpful diagnostic
      console.warn(`[AIService] Failed to connect to Python service at ${config.AI_MODEL_URL}: ${error.message}`);
      
      // Check if connection was refused
      if (error.cause && error.cause.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
        throw new Error(
          `AI Model service is offline or unreachable at ${config.AI_MODEL_URL}. ` +
          `Please ensure the Python FastAPI service is running: (cd ai-model && python app.py)`
        );
      }

      throw error;
    }
  }

  /**
   * Check health of the Python AI service
   */
  async checkAIHealth() {
    try {
      const response = await fetch(`${config.AI_MODEL_URL}/`, { method: 'GET' });
      if (response.ok) {
        return await response.json();
      }
      return { status: 'offline', error: `HTTP ${response.status}` };
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  }
}

module.exports = new AIService();
