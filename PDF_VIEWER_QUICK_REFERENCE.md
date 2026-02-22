# PDF Highlight Viewer - Quick Reference Guide

## Component Usage

### Import
```typescript
import PDFHighlightViewer from '@/components/PDFHighlightViewer';
```

### Props
```typescript
interface PDFHighlightViewerProps {
  file: File;                              // PDF file object
  highlights?: ResumeHighlight[];         // Array of highlights to display
  onHighlightClick?: (highlight: ResumeHighlight) => void; // Click callback
}
```

### Basic Usage
```tsx
<PDFHighlightViewer 
  file={resumeFile} 
  highlights={extractedHighlights}
  onHighlightClick={(h) => console.log('Clicked:', h.title)}
/>
```

---

## Highlight Data Structure

```typescript
const highlight: ResumeHighlight = {
  id: "h-1",
  page: 1,                    // Which page (1-indexed)
  x: 0.1,                     // 10% from left
  y: 0.2,                     // 20% from top
  width: 0.4,                 // 40% wide
  height: 0.05,               // 5% tall
  color: "yellow",            // "green" | "yellow" | "red"
  title: "Weak quantification",
  feedback: "This bullet point lacks metrics. Consider adding specific numbers.",
  suggestion: "Added 50% faster API responses through optimization.",
  textExcerpt: "Added faster API responses"
};
```

---

## Color Reference

| Color  | Label       | Background       | Border    | Use Case          |
|--------|-------------|------------------|-----------|-------------------|
| green  | Strength    | rgba(34,197,94)  | #22c55e   | Positive feedback |
| yellow | Needs work  | rgba(234,179,8)  | #eab308   | Minor issues      |
| red    | Critical    | rgba(239,68,68)  | #ef4444   | Major issues      |

---

## Key Features

### 1. Text Matching ✅
- Automatically finds highlight text in PDF
- Fuzzy matching for flexibility
- Multi-word phrase matching
- Graceful degradation (skips if not found)

### 2. Interactive UI ✅
- Hover: Brightness increases
- Click: Popover appears
- Filter: Legend toggles
- Zoom: Scale updates

### 3. Responsive ✅
- Auto-scales to container width
- Adapts to window resize
- Mobile-friendly popover positioning
- Touch-friendly hit targets

### 4. Multi-page ✅
- Highlights on correct page only
- Page navigation controls
- Page counter display

### 5. Zoom Controls ✅
- Range: 50% to 200%
- Increments: 10% per click
- Reset: Fit-to-width button
- Live percentage display

---

## User Interactions

### Hover
```
Highlight box becomes brighter (30% opacity)
Visual feedback that element is interactive
```

### Click
```
Popover appears with:
├─ Title (category label)
├─ Feedback (full explanation)
├─ Suggestion (if available)
└─ Close button (×)
```

### Legend Toggle
```
Click color button to toggle visibility
Active: Full opacity, colored background
Inactive: 50% opacity, faded
Instant update to overlay
```

### Zoom In [+]
```
Scale increases by 10% (max 200%)
Canvas and highlights grow proportionally
Percentage display updates
```

### Zoom Out [−]
```
Scale decreases by 10% (min 50%)
Canvas and highlights shrink proportionally
Percentage display updates
```

### Reset [↺]
```
Scale resets to fit-to-width
Full page visible
Optimal readability
```

### Page Navigation
```
[◀] Page N of M [▶]
Previous: disabled on page 1
Next: disabled on last page
Highlights re-extracted per page
```

---

## Common Patterns

### Handling Click Events
```typescript
<PDFHighlightViewer
  onHighlightClick={(highlight) => {
    // Show in side panel
    setSidePanel({ type: 'highlight', data: highlight });
    
    // Or scroll to matching feedback
    scrollToFeedback(highlight.id);
    
    // Or update state
    setSelectedHighlight(highlight);
  }}
/>
```

### Filtering Highlights
```typescript
const filteredHighlights = highlights.filter(h => {
  // Only show red and yellow
  return ['red', 'yellow'].includes(h.color);
});

<PDFHighlightViewer highlights={filteredHighlights} />
```

### Conditional Rendering
```typescript
{pdfFile ? (
  <PDFHighlightViewer file={pdfFile} highlights={analysis.highlights} />
) : (
  <p>Please upload a PDF to view highlights</p>
)}
```

---

## Styling & Theming

### Dark Theme (Applied)
- Background: #111827
- Borders: #374151
- Text: #e5e7eb
- Icons: Gray (gray-400 to gray-600)

### Light Theme (If Needed)
```css
background: #ffffff
borders: #d1d5db
text: #1f2937
icons: gray-500
```

### Custom Colors
Edit `COLOR_MAP` in component:
```typescript
const COLOR_MAP = {
  green: { 
    bg: 'rgba(34, 197, 94, 0.18)',
    border: '#22c55e', 
    label: 'Strength' 
  },
  // ...
};
```

---

## Performance Tips

### Large PDFs
- Component is optimized for PDFs up to 200 pages
- For larger files, consider pagination
- Canvas rendering is efficient
- Text extraction is one-time only

### Many Highlights
- Component handles 100+ highlights efficiently
- Filtering improves performance
- Layer is cached per page

### Responsive Design
- ResizeObserver handles window resizing
- No performance lag on resize
- Mobile devices may need reduced zoom max

---

## Troubleshooting

### Highlights Not Showing
1. Check `highlights` array is not empty
2. Verify `page` matches current page
3. Check highlight `textExcerpt` exists in PDF
4. Look for console errors

### Text Not Matching
1. Ensure `textExcerpt` exactly matches PDF text
2. Try shorter excerpts
3. Check for special characters
4. Component skips non-matching highlights silently

### Zoom Not Working
1. Verify scale state updates
2. Check canvas width/height are correct
3. Ensure container has defined dimensions
4. Check for CSS overflow issues

### Popover Not Appearing
1. Verify `onHighlightClick` handler
2. Check popover state updates
3. Ensure proper z-index (50)
4. Verify highlight box is clickable

### Performance Issues
1. Reduce number of highlights
2. Use color filtering
3. Check PDF file size
4. Monitor canvas rendering time

---

## API Reference

### Methods
```typescript
// Component methods (via ref)
// None - component is stateless from parent perspective
```

### Callbacks
```typescript
onHighlightClick?: (highlight: ResumeHighlight) => void
```

### Refs
```typescript
// No refs exposed
// Component manages internal state
```

---

## Browser DevTools

### Inspecting Highlights
```javascript
// In console:
// Find all highlight boxes
const boxes = document.querySelectorAll('[style*="position: absolute"]');
console.log(boxes);
```

### Debugging Text Extraction
```typescript
// Add to component:
console.log('Text items:', textItems);
console.log('Highlight boxes:', highlightBoxes);
```

### Checking Canvas
```javascript
// In console:
const canvas = document.querySelector('canvas');
console.log('Canvas size:', canvas.width, 'x', canvas.height);
```

---

## Version History

### v1.0 (Current)
- ✅ Basic PDF rendering
- ✅ Highlight overlays
- ✅ Text matching
- ✅ Click popovers
- ✅ Legend filtering
- ✅ Zoom controls
- ✅ Multi-page support
- ✅ Dark theme

### Planned (v1.1)
- [ ] Highlight creation/editing
- [ ] Annotation export
- [ ] PDF text search
- [ ] Multi-select highlights
- [ ] Highlight persistence

---

## Related Components

- **resume-checker/page.tsx**: Main page using this viewer
- **/src/types/resume.ts**: ResumeHighlight type definition
- **/src/components/ResumeWordAnalysis**: Feedback generation

---

## Resources

- **PDF.js Documentation**: https://mozilla.github.io/pdf.js/
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **React Refs**: https://react.dev/learn/manipulating-the-dom-with-refs
- **Dark Theme**: Tailwind dark mode configuration

---

## Support & Questions

For issues or questions:
1. Check troubleshooting section above
2. Review console for error messages
3. Check PDF file validity
4. Verify highlight data structure
5. Review component props

---

**Component Status**: Production Ready ✅  
**Last Updated**: 2024  
**Maintenance**: Active
