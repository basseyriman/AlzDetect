# Use official TensorFlow image to skip the heavy 500MB+ installation step
FROM tensorflow/tensorflow:2.15.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install only the lightweight wrappers
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    vit-keras \
    huggingface_hub \
    pillow \
    python-multipart \
    python-dotenv \
    gradio

# Copy application code
COPY . .

# Environment
ENV TF_USE_LEGACY_KERAS=1
ENV PORT=7860
EXPOSE 7860

# CMD
CMD ["python", "app.py"]
