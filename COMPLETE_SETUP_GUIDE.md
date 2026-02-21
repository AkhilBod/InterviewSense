# 🚀 Complete Setup Guide - Supabase + Question Bank

## 📋 What You're Getting

### 1. **Supabase Database Migration**
- Switch from Neon to Supabase PostgreSQL
- All existing data preserved
- Connection pooling support with `directUrl`

### 2. **Question Bank System**
- Save questions from anywhere (slug pages, curated list)
- 20 curated questions (10 behavioral + 10 technical)
- Personal question bank with stats
- Practice saved questions anytime

---

## 🎯 Quick Start (5 Steps)

### Step 1: Update Environment Variables (1 min)

Update `.env.local`:

```bash
# OLD (comment out)
# DATABASE_URL="your-old-neon-url"

# NEW - Supabase
DATABASE_URL="postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres"
```

### Step 2: Install Dependencies (if needed)

```bash
npm install
# or
yarn install
```

### Step 3: Run Migrations (2 min)

```bash
# This applies BOTH credit system AND question bank
npx prisma migrate dev --name supabase_setup

# Generate Prisma client
npx prisma generate
```

### Step 4: Verify Database (30 sec)

```bash
# Open Prisma Studio
npx prisma studio
```

**Check for:**
- ✅ SavedQuestion table
- ✅ QuestionType enum
- ✅ FeatureType enum
- ✅ FeatureUsage table
- ✅ User has credit fields

### Step 5: Start & Test (1 min)

```bash
# Start dev server
npm run dev

# Test these URLs:
# http://localhost:3000/questions
# http://localhost:3000/dashboard/saved-questions
```

---

## 📁 Complete File Structure

```
InterviewSense/
├── .env.local                                  ← UPDATE THIS
├── data/
│   └── curated-questions.json                 ← 20 questions (NEW)
├── prisma/
│   └── schema.prisma                          ← UPDATED
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── credits/                       ← Credit system (EXISTING)
│   │   │   ├── questions/                     ← Question bank (NEW)
│   │   │   │   ├── save/route.ts
│   │   │   │   ├── remove/route.ts
│   │   │   │   ├── saved/route.ts
│   │   │   │   └── check-saved/route.ts
│   │   │   └── subscription/                  ← Subscription (EXISTING)
│   │   ├── questions/
│   │   │   └── page.tsx                       ← Browse questions (NEW)
│   │   └── dashboard/
│   │       └── saved-questions/
│   │           └── page.tsx                   ← User's saved questions (NEW)
│   ├── components/
│   │   ├── SaveQuestionButton.tsx             ← NEW
│   │   ├── SubscriptionGate.tsx               ← EXISTING
│   │   └── UserAccountDropdown.tsx            ← EXISTING (updated)
│   └── lib/
│       └── credits.ts                         ← Credit system (EXISTING)
└── Documentation/
    ├── SUPABASE_SETUP.md                      ← Database migration
    ├── QUESTION_BANK_SETUP.md                 ← Question bank details
    ├── CREDIT_SYSTEM_IMPLEMENTATION.md        ← Credit system
    └── COMPLETE_SETUP_GUIDE.md                ← THIS FILE
```

---

## 🔄 What Changed in Database

### Existing Tables (Credit System)
- `User` - Added `dailyCredits`, `dailyCreditLimit`, `lastCreditReset`
- `FeatureUsage` - Tracks credit usage
- `FeatureType` enum - All features with credit costs

### New Tables (Question Bank)
- `SavedQuestion` - User's saved questions
- `QuestionType` enum - BEHAVIORAL | TECHNICAL

### Schema Updates
- Added `directUrl` for Supabase
- Added `savedQuestions` relation to User model

---

## 🎯 Features You Can Now Use

### Feature 1: Save Questions from Curated List

```typescript
// In any component
import SaveQuestionButton from '@/components/SaveQuestionButton'

<SaveQuestionButton
  questionId="beh_001"
  questionText="Tell me about a time..."
  type="BEHAVIORAL"
  company="Google"
  difficulty="medium"
  category="Teamwork"
/>
```

### Feature 2: Browse All Questions Page

**URL**: `/questions`

**Features:**
- 20 curated questions (expandable to 220+)
- Filter by type (All, Behavioral, Technical)
- Company tags and difficulty levels
- Tips for each question
- Save to personal bank
- Practice button

### Feature 3: My Saved Questions Dashboard

**URL**: `/dashboard/saved-questions`

**Features:**
- View all saved questions
- Stats dashboard (total, by type, practiced)
- Filter by question type
- Remove questions
- Practice directly from saved list

---

## 🔗 Integration Examples

### Add to Dashboard

Update `/dashboard/page.tsx`:

```tsx
import { BookOpen } from 'lucide-react'

// Add this card to your dashboard
<Card
  className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500"
  onClick={() => router.push('/dashboard/saved-questions')}
>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BookOpen className="h-5 w-5 text-blue-400" />
      My Saved Questions
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-slate-400">
      Practice questions you've saved for later
    </p>
  </CardContent>
</Card>
```

### Add to Slug Pages

In `/app/articles/[slug]/page.tsx` or similar:

```tsx
import SaveQuestionButton from '@/components/SaveQuestionButton'

// Add save button next to each question
<div className="flex justify-between items-start">
  <h3 className="text-lg font-semibold">{question.text}</h3>
  <SaveQuestionButton
    questionId={`${slug}_q${index}`}
    questionText={question.text}
    type={question.type}
    company={companyName}
  />
</div>
```

### Add "View All Questions" Button

```tsx
<Button
  onClick={() => router.push('/questions')}
  className="bg-blue-600 hover:bg-blue-700"
>
  View All 220+ Questions →
</Button>
```

---

## 🧪 Testing Checklist

### Database Tests
- [ ] Run `npx prisma studio`
- [ ] Verify SavedQuestion table exists
- [ ] Verify QuestionType enum exists
- [ ] Check User model has savedQuestions relation
- [ ] Verify credit fields exist in User table

### Feature Tests
- [ ] Visit `/questions` page
- [ ] Click "Save Question" button (while logged in)
- [ ] See "Question saved!" toast
- [ ] Button changes to "Saved"
- [ ] Visit `/dashboard/saved-questions`
- [ ] Saved question appears in list
- [ ] Click trash icon to remove
- [ ] Question removed successfully
- [ ] Try filters (All, Behavioral, Technical)
- [ ] Stats update correctly

### Auth Tests
- [ ] Logout
- [ ] Try to save question
- [ ] Should see "Login required" message
- [ ] Login
- [ ] Save button should work

---

## 🎨 Customization

### Add More Questions

Edit `/data/curated-questions.json`:

```json
{
  "questions": [
    {
      "id": "beh_021",  // Increment ID
      "type": "BEHAVIORAL",
      "question": "Your new question here",
      "category": "Category name",
      "difficulty": "medium",
      "companies": ["Company1", "Company2"],
      "tips": [
        "Tip 1",
        "Tip 2",
        "Tip 3"
      ]
    }
  ]
}
```

**Restart server** after editing JSON to see changes.

### Change Credit Costs

Edit `/src/lib/credits.ts`:

```typescript
export const CREDIT_COSTS = {
  COVER_LETTER: 1,
  RESUME_REVIEW: 1,
  // ... add more or modify existing
}
```

### Customize Styling

All components use Tailwind CSS with slate theme:
- Primary: `blue-600`
- Background: `slate-900`, `slate-800`
- Behavioral: `purple-400`
- Technical: `green-400`

---

## 🚨 Troubleshooting

### "Connection refused" Error

**Problem**: Can't connect to Supabase

**Fix**:
1. Check DATABASE_URL in `.env.local`
2. Verify Supabase project is active
3. Check connection string has correct password
4. Test: `npx prisma db pull`

### "Table does not exist" Error

**Problem**: Migration not applied

**Fix**:
```bash
npx prisma migrate reset --force
npx prisma migrate dev
npx prisma generate
```

### Questions Not Showing

**Problem**: JSON file not loaded

**Fix**:
1. Verify file exists: `data/curated-questions.json`
2. Check JSON syntax (use JSON validator)
3. Restart dev server: `npm run dev`

### Save Button Not Working

**Problem**: User not authenticated or API error

**Fix**:
1. Check browser console for errors
2. Verify user is logged in
3. Test API: `curl http://localhost:3000/api/questions/saved`
4. Check network tab in DevTools

---

## 📊 Database Stats Query

Check your question bank usage:

```sql
-- Total saved questions by type
SELECT type, COUNT(*) as count
FROM "SavedQuestion"
GROUP BY type;

-- Most popular questions
SELECT questionId, COUNT(*) as saves
FROM "SavedQuestion"
GROUP BY questionId
ORDER BY saves DESC
LIMIT 10;

-- User engagement
SELECT
  u.email,
  COUNT(sq.id) as saved_questions,
  COUNT(CASE WHEN sq.practiced THEN 1 END) as practiced
FROM "User" u
LEFT JOIN "SavedQuestion" sq ON u.id = sq."userId"
GROUP BY u.email
ORDER BY saved_questions DESC;
```

---

## 🎯 Next Steps

After setup is complete:

1. **Test Everything Locally** ✅
   - Credit system works
   - Questions save/remove correctly
   - Filters work
   - Stats update

2. **Add More Questions** ✅
   - Expand to 50+ questions
   - Eventually reach 220+
   - Mix difficulties
   - Cover more companies

3. **Integrate with Existing Pages** ✅
   - Add SaveQuestionButton to slug pages
   - Add "View All" links
   - Add dashboard card

4. **Deploy to Production** ✅
   - Push to Git
   - Deploy to Vercel/Railway
   - Migrations run automatically
   - Test on production

5. **Monitor Usage** ✅
   - Check which questions are saved most
   - Track user engagement
   - Add more popular question types

---

## 📝 Summary

You now have:
- ✅ Supabase database connection
- ✅ Complete credit system (from previous work)
- ✅ Question bank system (new)
- ✅ 20 curated questions
- ✅ Save/remove functionality
- ✅ Personal question dashboard
- ✅ Reusable components
- ✅ Everything stored in JSON (easy to edit)

**Time to complete**: ~5 minutes
**Files created**: 10 new files
**Database tables**: 2 new tables
**Features**: 3 major features

---

## 🆘 Need Help?

Check these files:
- **Database issues** → `SUPABASE_SETUP.md`
- **Question bank details** → `QUESTION_BANK_SETUP.md`
- **Credit system** → `CREDIT_SYSTEM_IMPLEMENTATION.md`
- **Quick testing** → `QUICK_START.md`

**Ready to start? Run this:**

```bash
# 1. Update .env.local with Supabase URL
# 2. Then run:
npx prisma migrate dev
npx prisma generate
npm run dev
```

🎉 **You're all set!**
