FROM python:3.10-slim

# System setup for Computer Vision & ML
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install production AI stack
# We include uvicorn and gunicorn for production stability
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    tensorflow-cpu==2.15.0 \
    vit-keras \
    numpy==1.26.4 \
    pillow \
    huggingface_hub \
    python-multipart \
    python-dotenv \
    gradio

# Copy application layers
COPY . .

# Environment & Ports
ENV TF_USE_LEGACY_KERAS=1
ENV PORT=7860
EXPOSE 7860

# Production Command
CMD ["python", "main.py"]
