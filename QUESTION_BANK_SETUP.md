# 📚 Question Bank Feature - Complete Setup Guide

## 🎯 What This Adds

### 1. **Save Questions from Anywhere**
- Users can save questions to their personal question bank
- "Practice This Question" button on slug pages
- "Save Question" button on curated questions page

### 2. **Curated Questions Page** (`/questions`)
- 20 mixed behavioral + technical questions
- Filter by type (All, Behavioral, Technical)
- Company tags, difficulty levels, tips
- Same card format as slug pages
- Back to Dashboard button

### 3. **My Saved Questions** (`/dashboard/saved-questions`)
- View all saved questions
- Remove questions from bank
- Filter by type
- Stats dashboard (total, by type, practiced)
- Click to practice

---

## 📦 Files Created

### Database & Schema
- ✅ `prisma/schema.prisma` - Added `SavedQuestion` model and `QuestionType` enum
- ✅ Added `directUrl` for Supabase support

### Data
- ✅ `data/curated-questions.json` - 20 curated questions (10 behavioral, 10 technical)

### API Routes
- ✅ `/api/questions/save/route.ts` - Save question to user's bank
- ✅ `/api/questions/remove/route.ts` - Remove question from bank
- ✅ `/api/questions/saved/route.ts` - Get user's saved questions
- ✅ `/api/questions/check-saved/route.ts` - Check if question is saved

### Components
- ✅ `/components/SaveQuestionButton.tsx` - Reusable save/unsave button

### Pages
- ✅ `/questions/page.tsx` - Browse all curated questions
- ✅ `/dashboard/saved-questions/page.tsx` - User's saved questions

---

## 🚀 Setup Steps

### Step 1: Update Environment Variables

Create/update `.env.local`:

```bash
# Supabase connection
DATABASE_URL="postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres"

# Required for Supabase connection pooling
DIRECT_URL="postgresql://postgres:interviewSense12$$@db.bwpuycqxeimthzunyiiq.supabase.co:5432/postgres"

# Your other env variables...
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
# etc...
```

### Step 2: Run Migration

```bash
cd /Users/akhil/Desktop/InterviewSense

# Generate migration
npx prisma migrate dev --name add_question_bank

# Generate Prisma client
npx prisma generate

# Verify in Prisma Studio
npx prisma studio
```

**Check in Prisma Studio:**
- ✅ SavedQuestion table exists
- ✅ QuestionType enum exists (BEHAVIORAL, TECHNICAL)
- ✅ User model has savedQuestions relation

### Step 3: Test Locally

```bash
# Start dev server
npm run dev

# Test these URLs:
http://localhost:3000/questions              # Browse questions
http://localhost:3000/dashboard/saved-questions  # Saved questions
```

---

## 🧪 Testing Checklist

### Test Save Functionality
1. ✅ Go to `/questions`
2. ✅ Click "Save Question" button on any question
3. ✅ Should see toast: "Question saved!"
4. ✅ Button changes to "Saved" with checkmark icon
5. ✅ Go to `/dashboard/saved-questions`
6. ✅ Saved question appears in list

### Test Remove Functionality
1. ✅ In `/dashboard/saved-questions`, click trash icon
2. ✅ Confirm removal in dialog
3. ✅ Question removed from list
4. ✅ Stats update automatically

### Test Filters
1. ✅ Click "Behavioral" filter
2. ✅ Only behavioral questions show
3. ✅ Click "Technical" filter
4. ✅ Only technical questions show
5. ✅ Click "All" - all questions show

### Test Without Login
1. ✅ Logout
2. ✅ Go to `/questions`
3. ✅ Click "Save Question"
4. ✅ Should see: "Login required" toast

---

## 🔗 Integration Points

### Add to Dashboard

Update `/dashboard/page.tsx` to add a "Saved Questions" card:

```tsx
<Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500"
  onClick={() => router.push('/dashboard/saved-questions')}>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BookOpen className="h-5 w-5 text-blue-400" />
      My Saved Questions
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-slate-400">Practice your saved questions</p>
  </CardContent>
</Card>
```

### Add to Slug Pages

In your existing slug page components (like `/app/articles/[slug]/page.tsx`), add the Save button:

```tsx
import SaveQuestionButton from '@/components/SaveQuestionButton'

// In your question display section:
<SaveQuestionButton
  questionId={`slug_${slug}_${index}`}
  questionText={question.text}
  type={question.type} // 'BEHAVIORAL' or 'TECHNICAL'
  company={companyName}
  category={question.category}
  difficulty={question.difficulty}
/>
```

### Add "View All Questions" Link

Update your slug pages to link to `/questions`:

```tsx
<Button
  onClick={() => router.push('/questions')}
  className="bg-blue-600 hover:bg-blue-700"
>
  View All 220+ Questions →
</Button>
```

---

## 📊 Database Schema

### SavedQuestion Model

```prisma
model SavedQuestion {
  id           String       @id @default(cuid())
  userId       String
  user         User         @relation(fields: [userId], references: [id])

  questionId   String       // Unique identifier (e.g., "beh_001", "slug_meta_001")
  questionText String       @db.Text
  type         QuestionType // BEHAVIORAL | TECHNICAL
  company      String?
  difficulty   String?      // easy, medium, hard
  category     String?

  practiced    Boolean      @default(false)
  completed    Boolean      @default(false)
  notes        String?      @db.Text

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@unique([userId, questionId]) // Can't save same question twice
  @@index([userId, type])
}
```

---

## 📝 JSON File Structure

Questions are stored in `/data/curated-questions.json`:

```json
{
  "questions": [
    {
      "id": "beh_001",
      "type": "BEHAVIORAL",
      "question": "Tell me about a time...",
      "category": "Teamwork",
      "difficulty": "medium",
      "companies": ["Google", "Meta"],
      "tips": [
        "Use the STAR method",
        "Show empathy"
      ]
    }
  ]
}
```

**To add more questions:**
1. Edit `/data/curated-questions.json`
2. Add new question object with unique `id`
3. Restart dev server
4. Questions appear immediately

---

## 🎨 UI Features

### Question Card Components
- **Type Badge**: Behavioral (purple) or Technical (green)
- **Difficulty Badge**: Easy, Medium, Hard
- **Category**: Shows question category
- **Company Tags**: Which companies ask this question
- **Tips**: 2-3 actionable tips per question
- **Save Button**: Bookmark icon, changes to filled when saved
- **Practice Button**: Takes to appropriate interview page

### Saved Questions Page
- **Stats Cards**: Total, Behavioral, Technical, Practiced
- **Filters**: All, Behavioral, Technical
- **Remove Button**: Trash icon with confirmation
- **Empty State**: "No saved questions" with link to browse

---

## 🚢 Deploy Checklist

Before deploying to production:

1. ✅ Test all features locally
2. ✅ Verify database migration works
3. ✅ Test with real user accounts
4. ✅ Check save/remove functionality
5. ✅ Test filters and stats
6. ✅ Verify mobile responsiveness
7. ✅ Add more questions to JSON file (expand to 220+)

### Add More Questions

The current JSON has 20 questions. To reach 220+:

1. Continue the pattern in `curated-questions.json`
2. Use unique IDs: `beh_011`, `tech_011`, etc.
3. Mix difficulties: 40% easy, 40% medium, 20% hard
4. Cover various categories:
   - Behavioral: Teamwork, Leadership, Conflict, Learning
   - Technical: Fundamentals, APIs, Databases, Algorithms

---

## 💡 Future Enhancements

Consider adding these later:

- **Practice Status**: Mark questions as practiced/completed
- **Notes**: Let users add personal notes to questions
- **Collections**: Create custom question collections
- **Difficulty Filter**: Filter by easy/medium/hard
- **Search**: Search questions by keyword
- **Export**: Export saved questions to PDF
- **Spaced Repetition**: Remind users to practice old questions

---

## 🎯 User Flow

### Flow 1: Save from Curated Questions
1. User clicks "View All 220+ Questions" from anywhere
2. Lands on `/questions` page
3. Sees 20 mixed questions with filters
4. Clicks "Save Question" on interesting ones
5. Questions added to their bank
6. Can access anytime from Dashboard

### Flow 2: Practice Saved Questions
1. User goes to Dashboard
2. Clicks "My Saved Questions"
3. Sees all saved questions with stats
4. Filters by type if needed
5. Clicks "Practice Now" on a question
6. Taken to appropriate interview page

### Flow 3: Save from Slug Pages
1. User visits company slug page (e.g., `/google`)
2. Sees company-specific questions
3. Clicks "Practice This Question" button
4. Question saved with company metadata
5. Can practice later from saved questions

---

## 🔧 Troubleshooting

### Migration Fails
```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev
```

### Can't Save Questions
- Check user is logged in
- Verify API routes are accessible
- Check browser console for errors
- Test API directly: `curl http://localhost:3000/api/questions/saved`

### Questions Not Showing
- Verify JSON file exists: `data/curated-questions.json`
- Check JSON syntax is valid
- Restart dev server after editing JSON

### Supabase Connection Issues
- Verify DATABASE_URL and DIRECT_URL match
- Check Supabase dashboard for connection limits
- Test connection: `npx prisma db pull`

---

## ✅ Summary

You now have:
- ✅ Complete question bank system
- ✅ 20 curated questions (expandable to 220+)
- ✅ Save/unsave functionality
- ✅ User's saved questions page with stats
- ✅ Reusable components for any page
- ✅ Supabase-ready database setup
- ✅ All stored in JSON for easy editing

**Next**: Follow the setup steps above to get it running locally! 🚀
