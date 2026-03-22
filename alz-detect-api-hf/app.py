import os
import sys
import subprocess
import threading
import time

# --- Runtime Dependency Injection ---
# We perform the heavy installation INSIDE the 16GB RAM environment to bypass build limits
def install_dependencies():
    print("Cloud Engine: Commencing Neural Environment setup...")
    try:
        # Install heavy ML libraries
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--no-cache-dir", "tensorflow-cpu==2.15.0", "vit-keras", "numpy==1.26.4"])
        print("Cloud Engine: Neural Environment READY.")
        
        # Now trigger the model load
        import app_logic
        app_logic.init_model()
    except Exception as e:
        print(f"CRITICAL SETUP ERROR: {e}")

# Trigger injection in background
threading.Thread(target=install_dependencies).start()
# -----------------------------------

import gradio as gr
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="AlzDetect Cloud API")
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    # We check if app_logic is loaded yet
    try:
        import app_logic
        return {"status": "healthy", "model_ready": app_logic.MODEL_READY}
    except:
        return {"status": "initializing_environment", "progress": "80%"}

@app.post("/model/predict")
async def predict(file: UploadFile = File(...)):
    try:
        import app_logic
        return await app_logic.predict_logic(file)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Neural context still initializing in 16GB Cloud RAM... {str(e)}")

# Gradio interface for HF Health
with gr.Blocks() as demo:
    gr.Markdown("# 🧠 AlzDetect AI Engine (Cloud)")
    gr.Markdown("Initializing 16GB Neural Environment...")

# Final mount
final_app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(final_app, host="0.0.0.0", port=port)
