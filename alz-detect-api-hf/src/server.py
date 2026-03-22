import os
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.absolute()
sys.path.append(str(PROJECT_ROOT))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.root_route import root_route
from src.routes.model_route import model_route, download_and_load_model
import threading

app = FastAPI(title="AlzDetect AI Engine (Cloud)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(root_route, prefix="", tags=["root"])
app.include_router(model_route, prefix="", tags=["model"])

@app.get("/health")
def health():
    return {"status": "healthy", "service": "AlzDetect AI Engine"}

@app.on_event("startup")
async def startup_event():
    # START DOWNLOAD IN BACKGROUND SO PORT BINDS INSTANTLY
    print("Initiating background Model Download...")
    thread = threading.Thread(target=download_and_load_model)
    thread.start()
    print("Cloud Engine started. Port 7860 is now active.")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
