#!/bin/bash
# This script handles the build process for deployment

echo "Starting InterviewSense build process..."

# Install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Install Prisma if needed
if ! npm list prisma --depth=0 &>/dev/null; then
  echo "Installing Prisma..."
  npm install prisma@6.8.2 --save-dev
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build Next.js application
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"
