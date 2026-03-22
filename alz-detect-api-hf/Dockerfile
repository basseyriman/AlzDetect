FROM python:3.10-slim

# Install system dependencies (ESSENTIAL for OpenCV and TensorFlow)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pin the AI stack for 16GB RAM stability
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    tensorflow==2.15.0 \
    tensorflow-addons==0.23.0 \
    vit-keras \
    numpy==1.26.4 \
    pillow \
    huggingface_hub \
    python-multipart \
    python-dotenv \
    gradio

# Copy application code
COPY . .

# Set environment variables
ENV TF_USE_LEGACY_KERAS=1
ENV PORT=7860
EXPOSE 7860

# Command to run
CMD ["python", "app.py"]
