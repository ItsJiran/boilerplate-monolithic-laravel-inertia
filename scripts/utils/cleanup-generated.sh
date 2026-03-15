#!/bin/bash
# Clean up generated configuration files

echo "🧹 Cleaning up generated configuration..."

rm -f .env .env.backend .env.devops
rm -f infra/nginx/default.conf

echo "✅ Cleaned up: .env* and infra/nginx/default.conf"
