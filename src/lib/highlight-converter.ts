import { WordImprovementSuggestion, ResumeHighlight } from '@/types/resume';

/**
 * Convert WordImprovementSuggestions to ResumeHighlights with percentage-based coordinates
 * This is a fallback converter when exact bounding boxes aren't available from the API
 */
export function convertToHighlights(
  improvements: WordImprovementSuggestion[]
): ResumeHighlight[] {
  return improvements.map((improvement, index) => ({
    id: `highlight-${index}`,
    page: improvement.textPosition?.pageNumber || 1,
    x: improvement.textPosition?.x || 0,
    y: improvement.textPosition?.y || 0,
    width: improvement.textPosition?.width || 0.1,
    height: improvement.textPosition?.height || 0.03,
    color: mapSeverityToColor(improvement.severity),
    title: generateTitle(improvement),
    feedback: improvement.explanation,
    suggestion: improvement.improved,
    textExcerpt: improvement.original,
  }));
}

/**
 * Map severity level to highlight color
 */
function mapSeverityToColor(severity: 'red' | 'yellow' | 'green'): 'green' | 'yellow' | 'red' {
  const colorMap: Record<'red' | 'yellow' | 'green', 'green' | 'yellow' | 'red'> = {
    red: 'red',    // Critical issue
    yellow: 'yellow', // Could be improved
    green: 'green'   // Strength
  };
  return colorMap[severity];
}

/**
 * Generate a short title for the highlight based on category and severity
 */
function generateTitle(improvement: WordImprovementSuggestion): string {
  const categoryTitles: Record<string, string> = {
    'quantify_impact': 'Weak quantification',
    'communication': 'Unclear phrasing',
    'length_depth': 'Insufficient detail',
    'drive': 'Weak impact',
    'analytical': 'Vague claim',
    'general': 'Could be improved'
  };

  const category = improvement.category as keyof typeof categoryTitles;
  const baseTitle = categoryTitles[category] || 'Improvement needed';

  if (improvement.severity === 'red') {
    return `Critical: ${baseTitle}`;
  } else if (improvement.severity === 'yellow') {
    return `Needs work: ${baseTitle}`;
  } else {
    return `Strength: ${baseTitle}`;
  }
}

/**
 * Estimate bounding box coordinates for text in PDF
 * This is used when the AI doesn't provide exact coordinates
 */
export function estimateBoundingBox(
  textContent: string,
  targetText: string,
  pageIndex: number = 0,
  estimatedLineHeight: number = 0.04, // ~4% of page height
  estimatedCharWidth: number = 0.008  // ~0.8% of page width per char
): { x: number; y: number; width: number; height: number } {
  // Try to find the text in the content
  const index = textContent.toLowerCase().indexOf(targetText.toLowerCase());

  if (index === -1) {
    // Fallback: return a default position
    return {
      x: 0.05,
      y: pageIndex * 0.33 + 0.1,
      width: Math.min(0.9, targetText.length * estimatedCharWidth),
      height: estimatedLineHeight
    };
  }

  // Count newlines before the target text to estimate vertical position
  const textBefore = textContent.substring(0, index);
  const linesBefore = textBefore.split('\n').length - 1;

  // Estimate position within the line
  const lastNewline = textBefore.lastIndexOf('\n');
  const charOffsetInLine = lastNewline === -1 ? index : index - lastNewline - 1;

  return {
    x: 0.05 + (charOffsetInLine * estimatedCharWidth),
    y: Math.min(0.95, 0.05 + (linesBefore * estimatedLineHeight)),
    width: Math.min(0.9, targetText.length * estimatedCharWidth),
    height: estimatedLineHeight
  };
}

/**
 * Merge overlapping highlights (helper for cleanup)
 */
export function mergeOverlappingHighlights(highlights: ResumeHighlight[]): ResumeHighlight[] {
  return highlights.reduce((merged: ResumeHighlight[], current) => {
    const overlapping = merged.find(h =>
      h.page === current.page &&
      h.color === current.color &&
      rectsOverlap(h, current)
    );

    if (overlapping) {
      // Merge the two highlights
      const merged_ = {
        ...overlapping,
        x: Math.min(overlapping.x, current.x),
        y: Math.min(overlapping.y, current.y),
        width: Math.max(
          overlapping.x + overlapping.width,
          current.x + current.width
        ) - Math.min(overlapping.x, current.x),
        height: Math.max(
          overlapping.y + overlapping.height,
          current.y + current.height
        ) - Math.min(overlapping.y, current.y),
        feedback: [overlapping.feedback, current.feedback].join('\n\n'),
      };
      return [...merged.filter(h => h.id !== overlapping.id), merged_];
    }

    return [...merged, current];
  }, []);
}

/**
 * Check if two rectangles overlap
 */
function rectsOverlap(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
