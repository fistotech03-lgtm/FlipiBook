#!/bin/sh
set -e

# Ensure runtime directories exist (in Docker Swarm /run is tmpfs and may be empty)
mkdir -p /app/storage /run/nginx /var/log/nginx

# Test Nginx configuration
echo "[Preview Entrypoint] Testing Nginx configuration..."
nginx -t

# Start Nginx in background
echo "[Preview Entrypoint] Starting Nginx on port 80..."
nginx

# Start Backend microservices via concurrently
echo "[Preview Entrypoint] Starting Backend microservices on port 8000..."
cd /app/Backend
exec npm run start
