#!/bin/bash

# This script ensures Prisma is properly initialized during deployment

# Exit on error
set -e

# Install Prisma CLI if needed
if ! command -v npx &>/dev/null; then
    echo "Installing npx..."
    npm install -g npx
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run any migrations if needed (uncomment if you want to auto-migrate)
# echo "Running database migrations..."
# npx prisma migrate deploy

echo "Prisma setup complete"
