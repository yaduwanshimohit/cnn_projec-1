const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Upload an image file to the backend for disease classification
 * @param {File} file - The potato leaf image file
 * @returns {Promise<object>} Prediction details and disease information
 */
export async function uploadAndPredict(file) {
  if (!file) {
    throw new Error('Please select an image file to upload.');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[predictionService] Error predicting leaf:', error);
    throw error;
  }
}

/**
 * Check backend service and AI model health
 * @returns {Promise<object>} Health check status
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (!response.ok) {
      return { status: 'offline', error: `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

/**
 * Fetch supported disease categories
 * @returns {Promise<Array>} List of detectable classes
 */
export async function fetchSupportedClasses() {
  try {
    const response = await fetch(`${API_BASE_URL}/classes`, { method: 'GET' });
    if (!response.ok) return [];
    const data = await response.json();
    return data.classes || [];
  } catch (err) {
    console.warn('[predictionService] Could not fetch classes:', err);
    return [];
  }
}
