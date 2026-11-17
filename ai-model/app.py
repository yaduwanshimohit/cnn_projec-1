import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import predict_leaf, CLASS_NAMES, DISEASE_DETAILS

app = FastAPI(
    title="Potato Leaf Disease AI Service",
    description="Deep Learning API for classifying potato leaf diseases using Convolutional Neural Networks (CNN)",
    version="1.0.0"
)

# Enable CORS for backend and frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Potato Leaf Disease Classification API",
        "supported_classes": CLASS_NAMES,
        "version": "1.0.0"
    }

@app.get("/classes")
def get_classes():
    return {
        "classes": [
            {
                "key": key,
                "display_name": info.get("display_name", key),
                "severity": info.get("severity", "N/A"),
                "status": info.get("status", "N/A")
            }
            for key, info in DISEASE_DETAILS.items()
        ]
    }

@app.post("/predict")
async def predict_endpoint(file: UploadFile = File(...)):
    # Validate content type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image (JPEG, PNG, WEBP, etc.)")
    
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
        result = predict_leaf(contents)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
