"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeHighlight } from '@/types/resume';

interface PDFHighlightViewerProps {
  file: File;
  highlights?: ResumeHighlight[];
  onHighlightClick?: (highlight: ResumeHighlight) => void;
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
  onHighlightClick
}: PDFHighlightViewerProps) {
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [highlightBoxes, setHighlightBoxes] = useState<HighlightBox[]>([]);
  const [visibleColors, setVisibleColors] = useState(new Set(['green', 'yellow', 'red']));
  const [popover, setPopover] = useState<{ highlight: ResumeHighlight; x: number; y: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
  }, [highlights, visibleColors]);

  const matchHighlights = async (page: any, viewport: any, scale: number) => {
    try {
      const textContent = await page.getTextContent();
      const textItems: TextItem[] = [];

      // PDF.js text items have:
      //   item.str        — the text string
      //   item.transform   — [scaleX, skewX, skewY, scaleY, translateX, translateY]
      //   item.width       — advance width of the string in device (PDF user) space units
      //   item.height      — height of the string in device (PDF user) space units
      //
      // We scale from PDF user space → canvas pixels, and flip Y (PDF is bottom-up).

      (textContent.items as any[]).forEach((item: any) => {
        if (!item.str || !item.str.trim()) return;

        const tx = item.transform;
        const fontHeight = Math.abs(tx[3]); // vertical font scale
        const pdfX = tx[4]; // x position in PDF user space
        const pdfY = tx[5]; // y position in PDF user space (baseline, bottom-left origin)

        // item.width and item.height are already in PDF user-space units
        const wPdf = item.width ?? 0;
        const hPdf = item.height || fontHeight; // fallback to font scale if height is 0

        // Convert to canvas pixel coordinates (top-left origin)
        const canvasX = pdfX * scale;
        const canvasY = viewport.height - (pdfY * scale) - (hPdf * scale);
        const canvasW = wPdf * scale;
        const canvasH = hPdf * scale;

        textItems.push({
          str: item.str,
          x: canvasX,
          y: canvasY,
          width: Math.max(canvasW, 10), // at least 10px so it's visible
          height: Math.max(canvasH, 8),
        });
      });

      const boxes: HighlightBox[] = [];
      highlights.forEach((h) => {
        if (h.page !== pageNum) return;
        if (!visibleColors.has(h.color)) return;
        const textExcerpt = h.textExcerpt || h.title || h.feedback.substring(0, 50);
        const bbox = findTextBoundingBox(textItems, textExcerpt);
        if (bbox) {
          boxes.push({
            id: h.id || `h-${Math.random()}`,
            x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height,
            highlight: h,
          });
        }
      });
      setHighlightBoxes(boxes);
    } catch (err) {
      console.error('Error matching highlights:', err);
    }
  };

  const findTextBoundingBox = (items: TextItem[], search: string): { x: number; y: number; width: number; height: number } | null => {
    const query = search.toLowerCase().trim();
    if (!query) return null;

    // Strategy 1: Find a single text item that contains the full query
    for (const item of items) {
      const itemText = item.str.toLowerCase();
      if (itemText.includes(query)) {
        return { x: item.x, y: item.y, width: item.width, height: item.height };
      }
    }

    // Strategy 2: Find consecutive items whose combined text contains the query
    // Build a running window of consecutive items
    for (let i = 0; i < items.length; i++) {
      let combined = '';
      let endIdx = i;
      for (let j = i; j < Math.min(i + 8, items.length); j++) {
        combined += (j > i ? ' ' : '') + items[j].str;
        endIdx = j;
        if (combined.toLowerCase().includes(query)) {
          // Found it — bounding box spans items[i] through items[endIdx]
          const first = items[i];
          const last = items[endIdx];
          const top = Math.min(...items.slice(i, endIdx + 1).map(t => t.y));
          const bottom = Math.max(...items.slice(i, endIdx + 1).map(t => t.y + t.height));
          return {
            x: first.x,
            y: top,
            width: (last.x + last.width) - first.x,
            height: bottom - top,
          };
        }
      }
    }

    // Strategy 3: Match the first few significant words of the query
    // (the AI excerpt may be a long phrase; try matching at least the first 3+ words)
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length >= 2) {
      // Try progressively shorter prefixes: first 5 words, then 4, then 3, then 2
      for (let wordCount = Math.min(5, queryWords.length); wordCount >= 2; wordCount--) {
        const partial = queryWords.slice(0, wordCount).join(' ');
        for (let i = 0; i < items.length; i++) {
          let combined = '';
          for (let j = i; j < Math.min(i + 8, items.length); j++) {
            combined += (j > i ? ' ' : '') + items[j].str;
            if (combined.toLowerCase().includes(partial)) {
              const first = items[i];
              const last = items[j];
              const top = Math.min(...items.slice(i, j + 1).map(t => t.y));
              const bottom = Math.max(...items.slice(i, j + 1).map(t => t.y + t.height));
              return {
                x: first.x,
                y: top,
                width: (last.x + last.width) - first.x,
                height: bottom - top,
              };
            }
          }
        }
      }
    }

    // Strategy 4: Match any single item that contains a significant word (4+ chars)
    // Only as a last resort — pick the first significant word from the query
    for (const word of queryWords) {
      if (word.length < 4) continue;
      for (const item of items) {
        if (item.str.toLowerCase().includes(word)) {
          return { x: item.x, y: item.y, width: item.width, height: item.height };
        }
      }
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
        onClick={() => setPopover(null)}
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
                {highlightBoxes.map(box => (
                  <div
                    key={box.id}
                    className="absolute cursor-pointer transition-all"
                    style={{
                      left: box.x, top: box.y, width: box.width, height: box.height,
                      ...getColorStyle(box.highlight.color),
                      borderBottomWidth: '2px', borderRadius: '2px', pointerEvents: 'auto',
                    }}
                    onMouseEnter={() => setHoveredId(box.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setPopover({ highlight: box.highlight, x: rect.left, y: rect.top });
                      onHighlightClick?.(box.highlight);
                    }}
                  />
                ))}
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

      {/* Popover */}
      {popover && (
        <div
          className="fixed z-50 bg-[#111827] border border-gray-700 rounded-lg p-4 w-80 shadow-2xl"
          style={{
            left: `${Math.max(10, Math.min(popover.x - 160, window.innerWidth - 320))}px`,
            top: `${popover.y - 200}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR_MAP[popover.highlight.color]?.border }} />
              <h3 className="text-sm font-semibold text-white">{popover.highlight.title}</h3>
            </div>
            <button onClick={() => setPopover(null)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-gray-300 mb-3 leading-relaxed">{popover.highlight.feedback}</p>
          {popover.highlight.suggestion && (
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-xs text-blue-300 font-medium">Try:</p>
              <p className="text-sm text-gray-300 mt-1">{popover.highlight.suggestion}</p>
            </div>
          )}
        </div>
      )}

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
