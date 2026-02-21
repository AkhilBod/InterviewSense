# 🚀 Supabase + Question Bank Setup Guide

## Step 1: Update Database Connection (Local First)

### 1.1 Update `.env.local`

```bash
# Old Neon connection (comment out)
# DATABASE_URL="your-old-neon-url"

# New Supabase connection
DATABASE_URL="postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres"

# Add direct URL for migrations (important for Supabase)
DIRECT_URL="postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres"
```

### 1.2 Update `prisma/schema.prisma`

Add this at the top of your datasource block:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Add this line for Supabase
}
```

### 1.3 Test Connection

```bash
# Test Supabase connection
npx prisma db pull

# If successful, you'll see your schema synced
```

---

## Step 2: Add Question Bank to Database

The new Prisma schema will include:
- `SavedQuestion` model - Stores user's saved questions
- Questions stored in JSON files for easy management

---

## Step 3: Question Bank Features

### Feature 1: Save Question from Slug Pages
- User clicks "Practice This Question" on any slug page
- Question gets saved to their personal question bank
- Toast notification confirms save

### Feature 2: View All Questions Page (`/questions`)
- Shows 10-20 curated questions (behavioral + technical mix)
- Same card format as slug pages
- "Back to Dashboard" button
- "Save Question" button on each card
- Stored in `/data/curated-questions.json`

### Feature 3: My Saved Questions (`/dashboard/saved-questions`)
- View all saved questions
- Remove questions from bank
- Filter by type (behavioral/technical)
- Click to practice

---

## File Structure

```
InterviewSense/
├── data/
│   └── curated-questions.json          # 10-20 mixed questions
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── questions/
│   │   │       ├── save/route.ts       # Save question to bank
│   │   │       ├── remove/route.ts     # Remove from bank
│   │   │       └── saved/route.ts      # Get user's saved questions
│   │   ├── questions/
│   │   │   └── page.tsx                # View all 220+ questions page
│   │   └── dashboard/
│   │       └── saved-questions/
│   │           └── page.tsx            # User's saved questions
│   └── components/
│       ├── QuestionCard.tsx            # Reusable question card
│       └── SaveQuestionButton.tsx      # Save button component
└── prisma/
    └── schema.prisma                   # Updated with SavedQuestion model
```

---

## Testing Steps

1. **Update DATABASE_URL** in `.env.local`
2. **Run migration** to Supabase: `npx prisma migrate dev`
3. **Create test questions** in JSON file
4. **Test saving** questions from slug pages
5. **Test viewing** saved questions in dashboard
6. **Test removing** questions from bank

---

## Migration to Supabase

```bash
# 1. Backup current data (if needed)
npx prisma db pull --force

# 2. Update .env.local with Supabase connection

# 3. Push schema to Supabase
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Verify connection
npx prisma studio
```

---

## What Gets Stored in JSON vs Database

### JSON Files (`/data/`)
- ✅ Curated questions for "View All" page
- ✅ Question metadata (type, difficulty, company)
- ✅ Easy to edit and version control

### Supabase Database
- ✅ User's saved questions (references to JSON questions)
- ✅ Save timestamp
- ✅ User's practice history
- ✅ Question status (completed/in-progress)

---

## Next Steps After Setup

1. I'll create all the files you need
2. You update `.env.local` with Supabase URL
3. Run migration locally
4. Test the features
5. Deploy when ready

Ready to proceed? 🚀
