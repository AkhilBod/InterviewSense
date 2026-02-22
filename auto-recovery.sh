#!/bin/bash

# Database Recovery Auto-Retry Script
# Waits for database to come online, then runs schema push and data restoration

set -e

RETRY_INTERVAL=30  # seconds
MAX_RETRIES=120    # 120 retries = 1 hour max wait
ATTEMPT=0

echo "🔄 Database Recovery Auto-Retry Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Max wait time: $((MAX_RETRIES * RETRY_INTERVAL / 60)) minutes"
echo "Retry interval: $RETRY_INTERVAL seconds"
echo ""

# Wait for database to come online
echo "⏳ Waiting for database to come online..."
while [ $ATTEMPT -lt $MAX_RETRIES ]; do
  if npx prisma db push --skip-generate 2>/dev/null; then
    echo ""
    echo "✅ Database is online!"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  ELAPSED=$((ATTEMPT * RETRY_INTERVAL))
  MINS=$((ELAPSED / 60))
  
  echo -ne "\r⏳ Attempt $ATTEMPT/$MAX_RETRIES (${MINS}m elapsed) - Retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

if [ $ATTEMPT -eq $MAX_RETRIES ]; then
  echo ""
  echo "❌ Database failed to come online after $((MAX_RETRIES * RETRY_INTERVAL / 60)) minutes"
  echo "Please check Supabase dashboard and try manually"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Schema pushed successfully!"
echo ""

# Run data restoration
echo "🔄 Starting data restoration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx ts-node --transpile-only scripts/restore-data.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✨ Database recovery complete!"
  echo "All data has been restored successfully"
  echo ""
  echo "Next steps:"
  echo "1. Run 'npm run dev' to start the application"
  echo "2. Verify data in Supabase Studio: 'npx prisma studio'"
  echo "3. Test signup → questionnaire → pricing flow"
else
  echo ""
  echo "❌ Data restoration failed"
  echo "Check the error message above"
  exit 1
fi
