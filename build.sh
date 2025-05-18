#!/bin/bash
# build.sh - Custom build script for Vercel deployment

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build Next.js application
echo "Building Next.js application..."
npm run next build

echo "Build completed successfully"
