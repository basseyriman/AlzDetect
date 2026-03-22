import gradio as gr
from fastapi import FastAPI
import uvicorn
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "smoke_test_success", "node": "16GB_RAM_POWERHOUSE"}

with gr.Blocks() as demo:
    gr.Markdown("# AlzDetect AI Engine (Final Sync)")
    gr.Markdown("Direct Build Connectivity Check")

final_app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(final_app, host="0.0.0.0", port=7860)
