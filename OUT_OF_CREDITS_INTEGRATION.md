# 🪙 Out of Credits Modal Integration Guide

This guide shows how to add the out-of-credits popup when users run out of credits.

---

## Overview

When a user tries to access a service (resume review, interview, etc.) but doesn't have enough credits:

1. ✅ Check their credit balance
2. ❌ If insufficient → Show modal popup
3. ✅ If sufficient → Allow service access and deduct credits

---

## Component Usage

The `OutOfCreditsModal` component handles displaying the popup when users run out of credits.

### Import

```tsx
import { OutOfCreditsModal } from '@/components/OutOfCreditsModal'
```

### Props

```tsx
interface OutOfCreditsModalProps {
  isOpen: boolean                    // Modal visibility
  onClose: () => void               // Handler to close modal
  currentCredits: number            // User's current credits
  requiredCredits: number           // Credits needed for service
  serviceType: string               // Type of service (resume_review, etc.)
}
```

### Service Types

```tsx
'resume_review'        // 1 credit
'behavioral_interview' // 3 credits
'technical_interview'  // 3 credits
'cover_letter'        // 1 credit
'system_design'       // 4 credits
'portfolio_review'    // 3 credits
```

---

## Integration in Service Routes

### Example: Resume Checker

**File**: `src/app/resume-checker/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { OutOfCreditsModal } from '@/components/OutOfCreditsModal'
import { checkAndDeductCredits } from '@/lib/credits'
import { useSession } from 'next-auth/react'

export default function ResumeChecker() {
  const { data: session } = useSession()
  const [showOutOfCreditsModal, setShowOutOfCreditsModal] = useState(false)
  const [creditsInfo, setCreditsInfo] = useState({ current: 0, required: 1 })

  const handleCheckResume = async () => {
    if (!session?.user?.id) return

    // Check and deduct credits
    const result = await checkAndDeductCredits(session.user.id, 'resume_review')

    if (!result.success) {
      // Out of credits - show modal
      setCreditsInfo({
        current: result.currentBalance || 0,
        required: result.creditsNeeded || 1,
      })
      setShowOutOfCreditsModal(true)
      return
    }

    // User has enough credits - proceed with service
    console.log(`Credits remaining: ${result.creditsRemaining}`)
    // ... rest of resume check logic
  }

  return (
    <div>
      {/* Your resume checker UI */}
      <button onClick={handleCheckResume}>
        Check Resume
      </button>

      {/* Out of Credits Modal */}
      <OutOfCreditsModal
        isOpen={showOutOfCreditsModal}
        onClose={() => setShowOutOfCreditsModal(false)}
        currentCredits={creditsInfo.current}
        requiredCredits={creditsInfo.required}
        serviceType="resume_review"
      />
    </div>
  )
}
```

---

## Integration in API Routes

### Example: Resume API Endpoint

**File**: `src/app/api/resume-check/route.ts`

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { checkAndDeductCredits } from '@/lib/credits'

export async function POST(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check and deduct credits
  const creditResult = await checkAndDeductCredits(
    session.user.id,
    'resume_review'
  )

  if (!creditResult.success) {
    // Return 402 Payment Required with credit info
    return NextResponse.json(
      {
        error: 'Insufficient credits',
        currentBalance: creditResult.currentBalance,
        required: creditResult.creditsNeeded,
      },
      { status: 402 }
    )
  }

  // Credits deducted - proceed with service
  try {
    // ... your resume checking logic here
    const analysisResult = await analyzeResume(req)

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      creditsRemaining: creditResult.creditsRemaining,
    })
  } catch (error) {
    // If service fails, consider refunding credits
    return NextResponse.json(
      { error: 'Resume analysis failed' },
      { status: 500 }
    )
  }
}
```

---

## Client-Side Error Handling

### Handling 402 Payment Required

When your API returns 402 (insufficient credits), handle it on the client:

```tsx
const handleServiceRequest = async (serviceType: string) => {
  try {
    const response = await fetch('/api/your-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ /* your data */ }),
    })

    if (response.status === 402) {
      // Insufficient credits
      const errorData = await response.json()
      setCreditsInfo({
        current: errorData.currentBalance,
        required: errorData.required,
      })
      setShowOutOfCreditsModal(true)
      return
    }

    if (!response.ok) {
      throw new Error('Service failed')
    }

    const data = await response.json()
    // Handle success
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Styling Customization

The modal uses Tailwind CSS. Customize colors/sizes by editing `OutOfCreditsModal.tsx`:

```tsx
// Change modal background
<DialogContent className="bg-zinc-900 border-zinc-700">
  {/* ... */}
</DialogContent>

// Change button colors
<Button className="bg-blue-600 hover:bg-blue-500 text-white">

// Change accent colors
<Zap className="h-5 w-5 text-yellow-500" />
```

---

## Features of the Modal

✅ **Shows current credits** - Displays user's current balance
✅ **Shows required credits** - Shows how many credits are needed
✅ **Shows shortage** - Calculates and displays credit shortfall
✅ **Credit costs table** - Quick reference for all service costs
✅ **Upgrade options** - Direct links to Plus ($5) and Pro ($9) plans
✅ **Free tier info** - Explains weekly credit reset
✅ **Multiple CTAs** - Easy navigation to pricing page

---

## Implementation Checklist

### For Each Service Route

- [ ] Import `OutOfCreditsModal` component
- [ ] Import `checkAndDeductCredits` from `@/lib/credits`
- [ ] Add state for modal: `const [showOutOfCreditsModal, setShowOutOfCreditsModal] = useState(false)`
- [ ] Add state for credit info: `const [creditsInfo, setCreditsInfo] = useState({ current: 0, required: X })`
- [ ] Call `checkAndDeductCredits()` before allowing service access
- [ ] On insufficient credits → set state and open modal
- [ ] Add `<OutOfCreditsModal />` component to JSX
- [ ] Replace `serviceType` with correct service (resume_review, behavioral_interview, etc.)

### Service Types Reference

| Service | Constant | Credits |
|---------|----------|---------|
| Resume Review | `resume_review` | 1 |
| Behavioral Interview | `behavioral_interview` | 3 |
| Technical Interview | `technical_interview` | 3 |
| Cover Letter | `cover_letter` | 1 |
| System Design | `system_design` | 4 |
| Portfolio Review | `portfolio_review` | 3 |

---

## Example: Full Integration

Here's a complete example of a service component with the modal integrated:

```tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { OutOfCreditsModal } from '@/components/OutOfCreditsModal'
import { checkAndDeductCredits } from '@/lib/credits'
import { Button } from '@/components/ui/button'

export default function BehavioralInterview() {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [creditsInfo, setCreditsInfo] = useState({ current: 0, required: 3 })
  const [isLoading, setIsLoading] = useState(false)

  const handleStartInterview = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    const result = await checkAndDeductCredits(
      session.user.id,
      'behavioral_interview'
    )

    if (!result.success) {
      setCreditsInfo({
        current: result.currentBalance || 0,
        required: 3,
      })
      setShowModal(true)
      setIsLoading(false)
      return
    }

    // Start interview
    console.log('Starting interview...')
    // ... interview logic
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Behavioral Interview Prep</h1>
      
      <Button 
        onClick={handleStartInterview}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? 'Loading...' : 'Start Interview'}
      </Button>

      <OutOfCreditsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentCredits={creditsInfo.current}
        requiredCredits={creditsInfo.required}
        serviceType="behavioral_interview"
      />
    </div>
  )
}
```

---

## Troubleshooting

### Modal doesn't appear
- Check that `showOutOfCreditsModal` state is being set to `true`
- Verify `OutOfCreditsModal` component is imported
- Check browser console for errors

### Wrong credit display
- Ensure `checkAndDeductCredits` is returning correct `currentBalance` and `creditsNeeded`
- Verify database query in `src/lib/credits.ts`

### Modal style looks wrong
- Check that Tailwind CSS is properly configured
- Verify `@/components/ui/dialog` component exists
- Check for CSS conflicts in your global styles

---

## Next Steps

1. Add the modal to all service routes (resume, behavioral, technical, etc.)
2. Test with insufficient credits
3. Test upgrade flow from modal
4. Monitor analytics for how many users hit the out-of-credits flow

Done! Your payment system now prompts users to upgrade when they run out of credits! 🎉
