import io
import json
import os
from pathlib import Path
from PIL import Image
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "best_model.keras"
CLASS_NAMES_PATH = BASE_DIR / "class_names.json"

IMG_SIZE = (128, 128)

# Load class names
if CLASS_NAMES_PATH.exists():
    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        CLASS_NAMES = json.load(f)
else:
    CLASS_NAMES = ["Potato___Early_blight", "Potato___Late_blight", "Potato___healthy"]

# Comprehensive agricultural knowledge base
DISEASE_DETAILS = {
    "Potato___Early_blight": {
        "display_name": "Early Blight",
        "scientific_name": "Alternaria solani",
        "severity": "Moderate to High",
        "status": "Infected",
        "description": "Early blight is a common fungal disease of potato and tomato plants caused by Alternaria solani. It primarily affects older foliage first, producing characteristic concentric brown-black target-like rings.",
        "symptoms": [
            "Dark brown to black concentric ring spots (target-board appearance) on older leaves.",
            "Yellowing (chlorosis) surrounding leaf lesions.",
            "Premature defoliation, leading to reduced tuber size and yield loss.",
            "Dark, sunken, dry rot spots on infected tubers."
        ],
        "causes": [
            "Warm temperatures (24°C–29°C / 75°F–85°F) combined with alternating wet and dry conditions.",
            "Overwintering fungal spores in infected plant debris or nightshade weeds.",
            "Water splashing from overhead irrigation or rain."
        ],
        "treatments": [
            "Apply copper-based fungicides or chlorothalonil at the first sign of symptoms.",
            "Apply bio-fungicides containing Bacillus subtilis for organic cultivation.",
            "Prune and safely dispose of severely infected lower leaves."
        ],
        "prevention": [
            "Practice 2 to 3-year crop rotation with non-solanaceous crops (e.g., corn, legumes).",
            "Use drip or furrow irrigation instead of overhead watering to keep foliage dry.",
            "Space plants adequately to ensure good air circulation.",
            "Apply balanced fertilizer; avoid plant stress and nitrogen deficiency."
        ]
    },
    "Potato___Late_blight": {
        "display_name": "Late Blight",
        "scientific_name": "Phytophthora infestans",
        "severity": "Critical / Severe",
        "status": "Infected",
        "description": "Late blight is a devastating water-mold disease caused by Phytophthora infestans. It was the primary cause of the historical Irish Potato Famine and can destroy entire fields within days under cool, humid conditions.",
        "symptoms": [
            "Water-soaked, pale-to-dark green or brownish-black lesions rapidly expanding across leaves and stems.",
            "Delicate white fungal-like downy growth on the underside of leaves during high humidity.",
            "Foul odor produced by decomposing, collapsing plant foliage.",
            "Tubers develop purplish-brown skin discoloration with dry, granular, reddish-brown rot underneath."
        ],
        "causes": [
            "Cool, wet weather (10°C–21°C / 50°F–70°F) with relative humidity above 90%.",
            "Infected seed tubers or volunteer potato plants acting as primary inoculum reservoirs.",
            "Windblown sporangia travelling miles under overcast, humid skies."
        ],
        "treatments": [
            "Apply targeted systemic fungicides such as metalaxyl, mandipropamid, or cymoxanil immediately.",
            "Remove and incinerate or deeply bury infected plants to halt field spread.",
            "Kill potato vines 2-3 weeks before harvest to prevent tuber contamination during digging."
        ],
        "prevention": [
            "Plant only certified disease-free seed tubers.",
            "Destroy cull piles and volunteer potato sprouts early in the season.",
            "Select resistant or tolerant potato varieties (e.g., Defender, Elba, Sarpo Mira).",
            "Monitor local late-blight forecast and spray preventive contact fungicides before wet spells."
        ]
    },
    "Potato___healthy": {
        "display_name": "Healthy Leaf",
        "scientific_name": "Solanum tuberosum",
        "severity": "None",
        "status": "Healthy",
        "description": "The leaf shows no visible signs of fungal or bacterial infection. Tissue exhibits vibrant green coloration, intact veins, and normal physiological development.",
        "symptoms": [
            "Uniform green leaf pigmentation with no necrotic lesions or chlorosis.",
            "Firm, upright plant stems and leaves without wilting.",
            "Absence of mold, downy growth, or spots."
        ],
        "causes": [],
        "treatments": [
            "No chemical intervention needed.",
            "Continue standard agronomic practices."
        ],
        "prevention": [
            "Maintain regular inspection schedules (scouting 1-2 times weekly).",
            "Ensure proper soil nutrition and water management.",
            "Keep farm equipment sanitized between fields."
        ]
    }
}

# Lazy model loader
_model = None

def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        try:
            import tensorflow as tf
            # Load Keras model
            _model = tf.keras.models.load_model(str(MODEL_PATH))
            print(f"[AI Model] Successfully loaded model from {MODEL_PATH}")
        except Exception as e:
            print(f"[AI Model] Error loading model: {e}")
            raise
    return _model

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Read bytes, convert to RGB, resize to (128, 128), and add batch dimension."""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    # The model's first layer is tf.keras.layers.Rescaling(1.0/255), so pass raw 0..255 float32
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_leaf(image_bytes: bytes) -> dict:
    """Preprocess image, run model prediction, and return structured analysis."""
    img_array = preprocess_image(image_bytes)
    
    try:
        model = get_model()
        scores = model.predict(img_array, verbose=0)[0]
    except Exception as e:
        # If TensorFlow environment issue occurs, return a clear error
        raise RuntimeError(f"Prediction execution failed: {str(e)}")

    best_idx = int(np.argmax(scores))
    predicted_class = CLASS_NAMES[best_idx]
    confidence = float(scores[best_idx])

    # Build per-class breakdown
    breakdown = []
    for idx, name in enumerate(CLASS_NAMES):
        info = DISEASE_DETAILS.get(name, {})
        breakdown.append({
            "class_raw": name,
            "display_name": info.get("display_name", name.replace("Potato___", "").replace("_", " ")),
            "probability": round(float(scores[idx]) * 100, 2)
        })

    # Sort breakdown highest to lowest
    breakdown.sort(key=lambda x: x["probability"], reverse=True)

    details = DISEASE_DETAILS.get(predicted_class, {
        "display_name": predicted_class.replace("Potato___", "").replace("_", " "),
        "scientific_name": "N/A",
        "severity": "Unknown",
        "status": "Unknown",
        "description": "No detailed metadata found.",
        "symptoms": [],
        "causes": [],
        "treatments": [],
        "prevention": []
    })

    return {
        "success": True,
        "prediction": {
            "class_raw": predicted_class,
            "display_name": details["display_name"],
            "scientific_name": details["scientific_name"],
            "confidence": round(confidence * 100, 2),
            "severity": details["severity"],
            "status": details["status"],
            "description": details["description"],
            "symptoms": details["symptoms"],
            "causes": details["causes"],
            "treatments": details["treatments"],
            "prevention": details["prevention"],
            "breakdown": breakdown
        }
    }
