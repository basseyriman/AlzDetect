FROM python:3.11-slim

# Install system dependencies for OpenCV and Matplotlib
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV TF_USE_LEGACY_KERAS=1
ENV PORT=7860

# Hugging Face Spaces uses port 7860 by default
EXPOSE 7860

# Run the application
CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "7860"]
