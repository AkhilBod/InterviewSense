#!/bin/bash
echo "Deploying to Vercel..."
git add .
git commit -m "Fix Next.js build issues: Move themeColor to viewport export and fix distDir setting"
git push
