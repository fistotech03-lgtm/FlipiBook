#!/bin/sh
set -e

# Ensure storage directory exists
mkdir -p /app/storage

# Start Nginx in background
echo "[Preview Entrypoint] Starting Nginx on port 80..."
nginx

# Start Backend microservices via concurrently
echo "[Preview Entrypoint] Starting Backend microservices on port 8000..."
cd /app/Backend
exec npm run start
