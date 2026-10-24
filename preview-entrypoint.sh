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

if [ -f "services/payment-services/src/server.js" ]; then
  echo "[Preview Entrypoint] Payment service detected, launching 8 microservices..."
  exec npx concurrently -n "GATEWAY,AUTH,FLIPBOOK,PAGE_ED,PDF_ED,CUSTOM_ED,THREED_ED,PAYMENT" \
    -c "cyan,magenta,blue,yellow,green,red,white,yellow" \
    "npm run start:gateway" \
    "npm run start:auth" \
    "npm run start:myflipibook" \
    "npm run start:page-editor" \
    "npm run start:pdf-editor" \
    "npm run start:customized-editor" \
    "npm run start:threed-editor" \
    "npm run start:payment"
else
  exec npm run start
fi
