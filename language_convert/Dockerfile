FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (git is required to install IndicTransToolkit)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements with extended timeout and CPU PyTorch wheel (~180MB vs 2.8GB)
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 git+https://github.com/VarunGumma/IndicTransToolkit.git

# Copy microservice code
COPY app/ ./app

ENV HOST=0.0.0.0
ENV PORT=8010
ENV PYTHONUNBUFFERED=1

EXPOSE 8010

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8010"]
