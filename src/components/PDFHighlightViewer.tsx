"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeHighlight } from '@/types/resume';

interface PDFHighlightViewerProps {
  file: File;
  highlights?: ResumeHighlight[];
}

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HighlightBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  highlight: ResumeHighlight;
}

// US Letter paper at 96 DPI
const TARGET_WIDTH = 816;   // 8.5 in × 96 dpi
const TARGET_HEIGHT = 1056; // 11  in × 96 dpi

const COLOR_MAP: Record<string, { bg: string; border: string; label: string }> = {
  green: { bg: 'rgba(34, 197, 94, 0.18)', border: '#22c55e', label: 'Strength' },
  yellow: { bg: 'rgba(234, 179, 8, 0.18)', border: '#eab308', label: 'Needs work' },
  red: { bg: 'rgba(239, 68, 68, 0.18)', border: '#ef4444', label: 'Critical' },
};

export default function PDFHighlightViewer({
  file,
  highlights = [],
}: PDFHighlightViewerProps) {
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [highlightBoxes, setHighlightBoxes] = useState<HighlightBox[]>([]);
  const [visibleColors, setVisibleColors] = useState(new Set(['green', 'yellow', 'red']));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Stabilize the highlights reference so useEffect doesn't re-fire every render
  const highlightsKey = highlights.map(h => h.id).join(',');
  const highlightsRef = useRef(highlights);
  highlightsRef.current = highlights;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const pdfjsRef = useRef<any>(null);
  const pdfScaleRef = useRef(1);

  // Load PDF.js library — sets pdfjsLoaded when done
  useEffect(() => {
    let cancelled = false;
    const initPdfJs = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        // Use the local worker bundled in node_modules (served by Next.js static)
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        if (!cancelled) {
          pdfjsRef.current = pdfjs;
          setPdfjsLoaded(true);
        }
      } catch (err) {
        console.error('Error loading PDF.js:', err);
        if (!cancelled) setLoadError('Failed to load PDF viewer');
      }
    };
    initPdfJs();
    return () => { cancelled = true; };
  }, []);

  // Load PDF document — only runs once PDF.js is ready AND file is present
  useEffect(() => {
    if (!file || !pdfjsLoaded || !pdfjsRef.current) return;

    let cancelled = false;
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise;
        if (!cancelled) {
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setLoadError(null);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!cancelled) setLoadError('Failed to load PDF file');
      }
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [file, pdfjsLoaded]);

  // Compute displayScale so the 816-wide paper fits the scroll wrapper
  const computeDisplayScale = useCallback(() => {
    if (!scrollWrapperRef.current) return;
    const available = scrollWrapperRef.current.clientWidth - 32; // 16px padding each side
    setDisplayScale(Math.min(1, available / TARGET_WIDTH));
  }, []);

  // Recompute on resize
  useEffect(() => {
    computeDisplayScale();
    const el = scrollWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => computeDisplayScale());
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeDisplayScale]);

  // Render page at exact 816×1056
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const naturalViewport = page.getViewport({ scale: 1 });
        const scale = TARGET_WIDTH / naturalViewport.width;
        pdfScaleRef.current = scale;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        const context = canvas.getContext('2d');
        if (!context) return;

        await page.render({
          canvasContext: context,
          viewport
        }).promise;

        // Extract and match highlights
        await matchHighlights(page, viewport, scale);
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageNum]);

  // Re-run highlight matching when highlights prop or visible filters change
  useEffect(() => {
    if (!pdfDoc) return;
    const reMatch = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const naturalViewport = page.getViewport({ scale: 1 });
        const scale = TARGET_WIDTH / naturalViewport.width;
        const viewport = page.getViewport({ scale });
        await matchHighlights(page, viewport, scale);
      } catch (err) {
        console.error('Error re-matching highlights:', err);
      }
    };
    reMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightsKey, visibleColors]);

  const matchHighlights = async (page: any, viewport: any, scale: number) => {
    const currentHighlights = highlightsRef.current;
    try {
      const textContent = await page.getTextContent();
      const textItems: TextItem[] = [];

      // Build a full-page text string and track the position of each text item within it.
      // This lets us match phrases that span across arbitrary PDF text-item boundaries.
      let fullPageText = '';
      const itemRanges: { start: number; end: number; itemIdx: number }[] = [];

      // Also build a "normalized" version where we strip all whitespace for fuzzy matching.
      // normalMap[i] = index into fullPageText for normalized position i
      let normalizedText = '';
      const normalToFull: number[] = []; // normalizedText position → fullPageText position

      (textContent.items as any[]).forEach((item: any) => {
        if (!item.str) return;

        const tx = item.transform;
        const fontHeight = Math.abs(tx[3]);
        const pdfX = tx[4];
        const pdfY = tx[5];
        const wPdf = item.width ?? 0;
        const hPdf = item.height || fontHeight;

        const canvasX = pdfX * scale;
        const canvasY = viewport.height - (pdfY * scale) - (hPdf * scale);
        const canvasW = wPdf * scale;
        const canvasH = hPdf * scale;

        const idx = textItems.length;
        textItems.push({
          str: item.str,
          x: canvasX,
          y: canvasY,
          width: Math.max(canvasW, 10),
          height: Math.max(canvasH, 8),
        });

        // Track where this item sits in the full-page string
        const start = fullPageText.length;
        fullPageText += item.str;
        itemRanges.push({ start, end: fullPageText.length, itemIdx: idx });

        // Build normalized (no-whitespace) mapping
        for (let ci = 0; ci < item.str.length; ci++) {
          const ch = item.str[ci];
          if (/\s/.test(ch)) continue; // skip whitespace in normalized
          normalToFull.push(start + ci);
          normalizedText += ch.toLowerCase();
        }

        // Add space separator in the full text
        fullPageText += ' ';
      });

      const fullPageLower = fullPageText.toLowerCase();

      console.log(`[PDFHighlight] Page ${pageNum}: ${textItems.length} text items, ${currentHighlights.length} highlights to match`);
      if (textItems.length > 0) {
        console.log(`[PDFHighlight] First 200 chars of page text: "${fullPageText.substring(0, 200)}"`);
      }

      const boxes: HighlightBox[] = [];
      currentHighlights.forEach((h) => {
        if (h.page !== pageNum) return;
        if (!visibleColors.has(h.color)) return;
        const textExcerpt = h.textExcerpt || h.title || h.feedback.substring(0, 50);
        const bbox = findTextBoundingBox(textItems, itemRanges, fullPageLower, normalizedText, normalToFull, textExcerpt);
        if (bbox) {
          boxes.push({
            id: h.id || `h-${Math.random()}`,
            x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height,
            highlight: h,
          });
          console.log(`[PDFHighlight] MATCHED: "${textExcerpt.substring(0, 50)}..." → box at (${Math.round(bbox.x)}, ${Math.round(bbox.y)})`);
        } else {
          console.log(`[PDFHighlight] NO MATCH: "${textExcerpt.substring(0, 60)}..."`);
        }
      });

      console.log(`[PDFHighlight] Total matched: ${boxes.length}/${currentHighlights.filter(h => h.page === pageNum).length}`);
      setHighlightBoxes(boxes);
    } catch (err) {
      console.error('Error matching highlights:', err);
    }
  };

  const findTextBoundingBox = (
    items: TextItem[],
    itemRanges: { start: number; end: number; itemIdx: number }[],
    fullPageLower: string,
    normalizedText: string,
    normalToFull: number[],
    search: string,
  ): { x: number; y: number; width: number; height: number } | null => {
    if (!search || !search.trim()) return null;

    // Normalize the query — strip leading bullet chars, collapse whitespace
    const rawQuery = search.toLowerCase().trim()
      .replace(/^[-•·▪▸►●○◦‣⁃]\s*/, '') // strip leading bullet markers
      .replace(/\s+/g, ' ');

    if (!rawQuery || rawQuery.length < 3) return null;

    // Helper: given a character position in fullPageText, find the bounding box of overlapping items
    const bboxFromFullRange = (pos: number, matchEnd: number) => {
      const overlapping = itemRanges.filter(
        r => r.end > pos && r.start < matchEnd
      );
      if (overlapping.length === 0) return null;

      const firstItem = items[overlapping[0].itemIdx];
      const lastItem = items[overlapping[overlapping.length - 1].itemIdx];
      const top = Math.min(...overlapping.map(r => items[r.itemIdx].y));
      const bottom = Math.max(...overlapping.map(r => items[r.itemIdx].y + items[r.itemIdx].height));

      return {
        x: firstItem.x,
        y: top,
        width: (lastItem.x + lastItem.width) - firstItem.x,
        height: bottom - top,
      };
    };

    // Helper: try exact match in fullPageLower
    const tryExact = (q: string) => {
      const pos = fullPageLower.indexOf(q);
      if (pos === -1) return null;
      return bboxFromFullRange(pos, pos + q.length);
    };

    // Helper: try normalized (whitespace-agnostic) match
    const tryNormalized = (q: string) => {
      const normQ = q.replace(/\s+/g, '').toLowerCase();
      if (normQ.length < 4) return null;
      const nPos = normalizedText.indexOf(normQ);
      if (nPos === -1) return null;

      // Map back to fullPageText positions
      const fullStart = normalToFull[nPos];
      const fullEnd = normalToFull[Math.min(nPos + normQ.length - 1, normalToFull.length - 1)] + 1;
      return bboxFromFullRange(fullStart, fullEnd);
    };

    // Strategy 1: Try the full query (up to 120 chars) — exact match
    const maxLen = 120;
    const fullQuery = rawQuery.length > maxLen ? rawQuery.substring(0, maxLen) : rawQuery;
    const result1 = tryExact(fullQuery);
    if (result1) return result1;

    // Strategy 2: Try normalized (whitespace-agnostic) match of the full query
    const result2 = tryNormalized(fullQuery);
    if (result2) return result2;

    // Strategy 3: Try progressively shorter prefixes (exact, then normalized)
    for (let len = Math.min(fullQuery.length - 5, 80); len >= 15; len -= 8) {
      const sub = fullQuery.substring(0, len);
      const r = tryExact(sub) || tryNormalized(sub);
      if (r) return r;
    }

    // Strategy 4: Try matching individual significant words (5+ chars)
    const words = rawQuery.split(/\s+/).filter(w => w.length >= 5);

    // Try pairs of consecutive words
    for (let i = 0; i < words.length - 1; i++) {
      const pair = words[i] + ' ' + words[i + 1];
      const r = tryExact(pair) || tryNormalized(pair);
      if (r) return r;
    }

    // Single distinctive word as last resort — prefer longer/more unique words
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    for (const word of sortedWords) {
      if (word.length < 5) continue;
      const r = tryExact(word) || tryNormalized(word);
      if (r) return r;
    }

    return null;
  };

  const toggleColor = (color: string) => {
    setVisibleColors(prev => {
      const next = new Set(prev);
      next.has(color) ? next.delete(color) : next.add(color);
      return next;
    });
  };

  const getColorStyle = (color: string) => {
    const c = COLOR_MAP[color] || COLOR_MAP.yellow;
    return {
      backgroundColor: hoveredId === color ? c.bg.replace('0.18', '0.3') : c.bg,
      borderColor: c.border,
    };
  };

  // Height the scaled paper actually occupies on screen
  const scaledHeight = TARGET_HEIGHT * displayScale;

  return (
    <div className="flex flex-col h-full">
      {/* Legend */}
      {highlights.length > 0 && (
        <div className="flex gap-4 items-center justify-center p-3 bg-[#1f2937] flex-wrap border-b border-gray-700">
          {(['green', 'yellow', 'red'] as const).map(color => {
            const isActive = visibleColors.has(color);
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-[#374151] shadow-lg' : 'bg-[#1f2937]/50 opacity-50 hover:opacity-75'
                }`}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR_MAP[color].border }} />
                <span className="text-sm text-gray-300 font-medium">{COLOR_MAP[color].label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Scroll wrapper — takes all remaining height, scrolls if needed */}
      <div
        ref={scrollWrapperRef}
        className="flex-1 min-h-0 bg-[#0a0f1e] overflow-auto flex justify-center"
        style={{ padding: 16 }}
      >
        {pdfDoc ? (
          /* Sized container — exactly the visual height the scaled paper occupies */
          <div style={{ width: TARGET_WIDTH * displayScale, height: scaledHeight, flexShrink: 0 }}>
            {/* Paper — 816×1056 native, scaled down with CSS transform */}
            <div
              style={{
                width: TARGET_WIDTH,
                height: TARGET_HEIGHT,
                transform: `scale(${displayScale})`,
                transformOrigin: 'top left',
                position: 'relative',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
                borderRadius: 4,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{ display: 'block', width: '100%', height: '100%' }}
              />

              {/* Highlight Overlay */}
              <div
                ref={overlayRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: TARGET_WIDTH, height: TARGET_HEIGHT }}
              >
                {highlightBoxes.map(box => {
                  const isHovered = hoveredId === box.id;
                  return (
                    <div key={box.id}>
                      <div
                        className="absolute transition-all cursor-pointer"
                        style={{
                          left: box.x, top: box.y, width: box.width, height: box.height,
                          ...getColorStyle(box.highlight.color),
                          borderBottomWidth: '2px', borderRadius: '2px', pointerEvents: 'auto',
                        }}
                        onMouseEnter={() => setHoveredId(box.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      />
                      {/* Tooltip */}
                      {isHovered && (
                        <div
                          className="absolute z-50 pointer-events-none"
                          style={{
                            left: Math.min(box.x, TARGET_WIDTH - 300),
                            top: box.y + box.height + 6,
                            width: 280,
                          }}
                        >
                          <div style={{
                            background: '#1e293b',
                            border: `1px solid ${COLOR_MAP[box.highlight.color]?.border || '#3b82f6'}`,
                            borderRadius: 8,
                            padding: '10px 12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: COLOR_MAP[box.highlight.color]?.border || '#3b82f6', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {box.highlight.title}
                            </div>
                            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: box.highlight.suggestion ? 8 : 0 }}>
                              {box.highlight.feedback}
                            </div>
                            {box.highlight.suggestion && (
                              <div style={{ fontSize: 12, color: '#93c5fd', lineHeight: 1.5, borderTop: '1px solid #334155', paddingTop: 6 }}>
                                <span style={{ fontWeight: 600, fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggestion: </span>
                                {box.highlight.suggestion}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Loading / Error state */
          <div className="flex items-center justify-center w-full" style={{ minHeight: 400 }}>
            {loadError ? (
              <p className="text-red-400">{loadError}</p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-500 border-t-blue-400 rounded-full animate-spin" />
                <p className="text-gray-400">Loading PDF...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-700 bg-[#111827]">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPageNum(Math.max(1, pageNum - 1))} disabled={pageNum <= 1} className="bg-[#1f2937] border-gray-600 text-gray-300 hover:bg-[#374151]">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1f2937] rounded text-sm text-gray-300">
            Page {pageNum} of {numPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPageNum(Math.min(numPages, pageNum + 1))} disabled={pageNum >= numPages} className="bg-[#1f2937] border-gray-600 text-gray-300 hover:bg-[#374151]">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1f2937] rounded text-sm text-gray-300">
          {Math.round(displayScale * 100)}%
        </div>
      </div>
    </div>
  );
}
