FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pin the entire AI stack
RUN pip install --no-cache-dir \
    fastapi[standard] \
    uvicorn \
    tensorflow==2.15.0 \
    tensorflow-addons==0.23.0 \
    vit-keras \
    numpy==1.26.4 \
    pillow \
    huggingface_hub \
    python-multipart \
    python-dotenv \
    matplotlib \
    rich

# Copy application code
COPY . .

# Set environment variables
ENV TF_USE_LEGACY_KERAS=1
ENV PORT=7860
EXPOSE 7860

# Command to run (Direct python start)
CMD ["python", "app.py"]
