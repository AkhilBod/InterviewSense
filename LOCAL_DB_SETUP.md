# 🗄️ Local Database Setup for Testing

## Why Local Database?

- ✅ Don't mess up production Supabase data
- ✅ Faster development (no network latency)
- ✅ Can reset/delete data anytime
- ✅ Free and isolated

---

## Option 1: Docker (Recommended - Easiest)

### Step 1: Install Docker Desktop

**macOS:**
- Download from: https://www.docker.com/products/docker-desktop/
- Or: `brew install --cask docker`

**Windows/Linux:**
- Download from: https://www.docker.com/products/docker-desktop/

### Step 2: Start Local Database

```bash
cd /Users/akhil/Desktop/InterviewSense

# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps
```

You should see:
```
CONTAINER ID   IMAGE         PORTS                    NAMES
xxxxx          postgres:15   0.0.0.0:5432->5432/tcp   interviewsense-local-db
```

### Step 3: Run Migrations

```bash
# Apply all migrations to local DB
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio to verify
npx prisma studio
```

**Verify these tables exist:**
- ✅ User
- ✅ Subscription
- ✅ PaymentHistory
- ✅ FeatureUsage
- ✅ SavedQuestion

### Step 4: Start Testing

Your app is now using the local database! The `.env.local` is already configured:

```bash
DATABASE_URL=postgresql://postgres:localdev123@localhost:5432/interviewsense_dev
```

---

## Option 2: Install PostgreSQL Directly (No Docker)

### macOS

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb interviewsense_dev
```

### Windows

1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Open pgAdmin or command line
4. Create database: `CREATE DATABASE interviewsense_dev;`

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb interviewsense_dev

# Set password for postgres user
sudo -u postgres psql
ALTER USER postgres PASSWORD 'localdev123';
\q
```

### Then Update .env.local

The `.env.local` is already set up for local PostgreSQL:
```bash
DATABASE_URL=postgresql://postgres:localdev123@localhost:5432/interviewsense_dev
```

### Run Migrations

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

---

## 🎯 Quick Commands

### Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f

# Reset database (DELETE ALL DATA!)
docker-compose down -v
docker-compose up -d
npx prisma migrate dev

# Access PostgreSQL shell
docker exec -it interviewsense-local-db psql -U postgres -d interviewsense_dev
```

### Prisma Commands

```bash
# Create new migration
npx prisma migrate dev --name description_here

# Reset database (DELETE ALL DATA!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio

# Pull schema from database
npx prisma db pull

# Push schema without migration
npx prisma db push
```

---

## 🧪 Testing Workflow

### 1. Start Local Services

```bash
# Terminal 1: Start database
docker-compose up -d

# Terminal 2: Start dev server
npm run dev

# Terminal 3: Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Test Subscription Flow

1. Go to http://localhost:3000
2. Sign up with test email
3. Subscribe with test card: `4242 4242 4242 4242`
4. Watch webhooks in Terminal 3
5. Check Prisma Studio for data

### 3. Verify Data

```bash
# Open Prisma Studio
npx prisma studio

# Or use PostgreSQL directly
docker exec -it interviewsense-local-db psql -U postgres -d interviewsense_dev

# Then run SQL:
SELECT email, "dailyCredits", "dailyCreditLimit" FROM "User";
```

---

## 🔄 Switch Between Local & Production

### For Local Testing (Current)

```bash
# In .env.local:
DATABASE_URL=postgresql://postgres:localdev123@localhost:5432/interviewsense_dev
```

### For Production

```bash
# In .env.local, uncomment Supabase:
DATABASE_URL=postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres
```

---

## 🐛 Troubleshooting

### "Port 5432 already in use"

Another PostgreSQL is running. Either:
```bash
# Stop other PostgreSQL
brew services stop postgresql  # macOS

# Or change port in docker-compose.yml:
ports:
  - '5433:5432'  # Use port 5433 instead

# Then update .env.local:
DATABASE_URL=postgresql://postgres:localdev123@localhost:5433/interviewsense_dev
```

### "Connection refused"

```bash
# Check if Docker is running
docker ps

# Restart container
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs -f
```

### "Database does not exist"

```bash
# Create database
docker exec -it interviewsense-local-db createdb -U postgres interviewsense_dev

# Or run migrations
npx prisma migrate dev
```

### Can't Connect to Database

```bash
# Test connection
docker exec -it interviewsense-local-db psql -U postgres -c "SELECT 1"

# Verify credentials match .env.local
docker exec -it interviewsense-local-db env | grep POSTGRES
```

---

## 📊 Useful SQL Queries

```sql
-- Check all users
SELECT id, email, "dailyCredits", "dailyCreditLimit", "lastCreditReset"
FROM "User";

-- Check subscriptions
SELECT u.email, s.plan, s.status, s."currentPeriodEnd"
FROM "User" u
JOIN "Subscription" s ON u.id = s."userId";

-- Check credit usage
SELECT u.email, fu.feature, fu."creditsUsed", fu."createdAt"
FROM "FeatureUsage" fu
JOIN "User" u ON fu."userId" = u.id
ORDER BY fu."createdAt" DESC
LIMIT 10;

-- Check saved questions
SELECT u.email, COUNT(sq.id) as saved_questions
FROM "User" u
LEFT JOIN "SavedQuestion" sq ON u.id = sq."userId"
GROUP BY u.email;

-- Reset user credits (testing)
UPDATE "User" SET "dailyCredits" = "dailyCreditLimit", "lastCreditReset" = NOW();
```

---

## 🎉 You're Ready!

Your local database is set up! Now run:

```bash
# Start everything
docker-compose up -d
npm run dev
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test at http://localhost:3000
```

When ready for production, just uncomment Supabase in `.env.local` and deploy! 🚀
