# Remaining Bug Fixes & Features - Priority Guide

## Completed Tasks ✅

1. **Interactive Resume Highlighting** - COMPLETE
   - PDFHighlightViewer component implemented
   - Text-to-PDF coordinate matching
   - Click popovers with detailed feedback
   - Legend with color filtering
   - Zoom controls with dynamic scaling
   - Multi-page support
   - Dark theme styling
   - ResizeObserver for responsive behavior

2. **Resume PDF Zoom Fix** - COMPLETE
   - Canvas rendered at exact US Letter dimensions: 816×1056px (8.5×11in @ 96dpi)
   - CSS `transform: scale()` shrinks the paper to fit narrow panels
   - ResizeObserver recomputes displayScale on every resize
   - No hardcoded scales — PDF.js scale derived from `TARGET_WIDTH / naturalViewport.width`
   - Removed `maxHeight`, `objectFit`, manual zoom controls
   - White paper on dark background with box-shadow for realism
   - Scroll wrapper with overflow-auto for smaller viewports

3. **Fix max_tokens Error** - COMPLETE
   - All 16 instances replaced with `max_completion_tokens`
   - 11 API route files updated
   - Parameter standardization complete

4. **API Model Deprecation Fixes** - COMPLETE
   - gpt-4.1 → gpt-4o-mini (2 files)
   - All OpenAI models now current

5. **FeatureType Enum Correction** - COMPLETE
   - BEHAVIORAL_INTERVIEW → BEHAVIORAL_PRACTICE (2 instances)
   - All enum references now valid

6. **Gemini → OpenAI Migration** - COMPLETE
   - Transcription: Gemini → Whisper
   - Question generation: Gemini → GPT-4o-mini
   - Feedback analysis: Gemini → GPT-4o-mini
   - Interview summary: Gemini → GPT-4o-mini
   - All Gemini API calls removed
   - No quota limit errors from audio transcription

---

## Pending Tasks ⏳

### 1. Fix /interview Page Styling
**Priority**: HIGH  
**Scope**: Dark theme consistency  
**Estimated Time**: 30 min

**Task**:
- Locate the `/interview` page directory
- Identify any light-themed elements (bg-white, text-black, etc.)
- Apply dark theme classes consistent with landing page
- Check parent layout files for theme overrides

**Files to Check**:
- `/src/app/interview/page.tsx` or similar
- `/src/app/interview/layout.tsx` if it exists
- `/src/app/interview/[type]/page.tsx` variants
- Parent layout files up to `/src/app/layout.tsx`

**Implementation Pattern**:
```tsx
// ❌ Before (if present)
<div className="bg-white text-black">

// ✅ After
<div className="dark bg-[#09090b] text-white">
```

---

### 2. Interactive Voice Visualization
**Priority**: HIGH  
**Scope**: Audio reactivity  
**Estimated Time**: 1-2 hours

**Task**:
- Create AudioContext and AnalyserNode connection
- Hook up to agent audio element for real-time frequency analysis
- Drive visualization bars/waveform with frequency data
- Smooth animations for frequency updates

**Location**: `/src/app/system-design/results/page.tsx`  
**Current Implementation**: Agent animation (agentSpeaking state)

**Implementation Pattern**:
```typescript
// In component that plays audio
const audioRef = useRef<HTMLAudioElement>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const animationFrameRef = useRef<number>(0);

useEffect(() => {
  if (!audioRef.current) return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  const source = audioContext.createMediaElementAudioSource(audioRef.current);
  source.connect(analyser);
  analyser.connect(audioContext.destination);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const animate = () => {
    analyser.getByteFrequencyData(dataArray);
    // Update visualization bars with dataArray values
    // dataArray contains frequency data (0-255 range)
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    cancelAnimationFrame(animationFrameRef.current);
  };
}, []);
```

---

### 3. Cover Letter PDF Text Extraction
**Priority**: MEDIUM  
**Scope**: MIME type & text extraction  
**Estimated Time**: 45 min

**Task**:
- Identify where PDF is being passed to vision model
- Extract text from PDF using `pdf-parse` library before model input
- Update prompt to use plain string instead of PDF
- Verify response quality and format

**File**: `/src/app/api/generate-cover-letter/route.ts`

**Implementation Pattern**:
```typescript
import pdf from 'pdf-parse';

// Extract text from PDF buffer
const pdfBuffer = await resumeFile.arrayBuffer();
const pdfData = await pdf(Buffer.from(pdfBuffer));
const resumeText = pdfData.text;

// Use extracted text in prompt
const analysisPrompt = `Analyze this resume text:
${resumeText}

Job description: ${jobDescription}

Generate a cover letter...`;
```

**Dependencies to Add**:
```bash
npm install pdf-parse
```

---

### 4. Technical Problem Generator Loading State
**Priority**: MEDIUM  
**Scope**: Button UI feedback  
**Estimated Time**: 30 min

**Task**:
- Add `isGenerating` boolean state
- Update button text during generation
- Add loading indicator (spinner or pulsing effect)
- Disable button while generating
- Clear state on completion or error

**File**: `/src/app/dashboard/technical/page.tsx`

**Implementation Pattern**:
```typescript
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerateProblem = async () => {
  setIsGenerating(true);
  try {
    const response = await fetch('/api/technical-assessment/generate', {
      method: 'POST',
      body: JSON.stringify({ /* params */ })
    });
    
    const result = await response.json();
    setProblem(result);
  } catch (error) {
    console.error('Generation failed:', error);
  } finally {
    setIsGenerating(false);
  }
};

// In button
<button 
  disabled={isGenerating}
  onClick={handleGenerateProblem}
  className={isGenerating ? 'opacity-70 cursor-not-allowed' : ''}
>
  {isGenerating ? (
    <>
      <span className="animate-spin inline-block mr-2">⏳</span>
      Generating...
    </>
  ) : (
    'Generate Problem'
  )}
</button>
```

---

### 5. Global Gemini Cleanup
**Priority**: LOW  
**Scope**: Code cleanup  
**Estimated Time**: 15 min

**Task**:
- Remove remaining Gemini imports and unused code
- Update comments that reference Gemini
- Clean up @google/generative-ai package references
- Verify no residual Gemini model references

**Remaining Items** (mostly comments/cleanup):
1. Comments in `/src/components/TechnicalAssessment.tsx` (lines 1243-1267)
2. Comments in `/src/app/system-design/results/page.tsx` (line 46)
3. Comments in various API routes about Gemini behavior
4. Package.json: Remove @google/generative-ai dependency

**Optional** (Keep if useful for context):
- `src/lib/gemini.ts` - Keep file but rename to `openai-services.ts` for clarity
- Update export statements in dependent files

---

## Testing Checklist

### Phase 1: Dark Theme Fix
- [ ] Navigate to /interview page
- [ ] Verify all text is readable on dark background
- [ ] Check for any white boxes or light elements
- [ ] Test on mobile/tablet viewports
- [ ] Check dark mode toggle if implemented

### Phase 2: Voice Visualization
- [ ] Record system design interview response
- [ ] Play back and observe agent animation
- [ ] Verify visualization bars move with audio
- [ ] Test with different audio volumes
- [ ] Verify smooth animations without lag

### Phase 3: Cover Letter
- [ ] Upload resume (PDF and DOCX formats)
- [ ] Generate cover letter for multiple job descriptions
- [ ] Verify text extraction accuracy
- [ ] Check letter quality and personalization
- [ ] Test with various resume formats

### Phase 4: Button Loading State
- [ ] Generate technical problem
- [ ] Observe button state during generation
- [ ] Verify text changes to "Generating..."
- [ ] Check for visual loading indicator
- [ ] Test error scenarios
