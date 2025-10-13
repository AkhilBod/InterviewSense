"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, FileText, Eye, EyeOff } from 'lucide-react';
import { WordImprovementSuggestion } from '@/types/resume';

interface HighlightablePDFViewerProps {
  file: File;
  wordImprovements?: WordImprovementSuggestion[];
  showHighlights?: boolean;
  onHighlightClick?: (improvement: WordImprovementSuggestion) => void;
}

const severityColors = {
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#22c55e'
};

const severityBorders = {
  red: '#dc2626',
  yellow: '#d97706',
  green: '#16a34a'
};

export default function HighlightablePDFViewer({ 
  file, 
  wordImprovements = [], 
  showHighlights = false,
  onHighlightClick 
}: HighlightablePDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [pdfText, setPdfText] = useState<Array<{ page: number; text: string; items: any[] }>>([]);
  const [isTextExtracted, setIsTextExtracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<WordImprovementSuggestion | null>(null);

  // Dynamic imports
  const [Document, setDocument] = useState<any>(null);
  const [Page, setPage] = useState<any>(null);
  const [pdfjs, setPdfjs] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    console.log('PDF Viewer - Word improvements updated:', {
      count: wordImprovements.length,
      showHighlights
    });
  }, [wordImprovements, showHighlights]);

  // Re-process positions when wordImprovements change
  useEffect(() => {
    if (wordImprovements.length > 0 && pdfText.length > 0 && isTextExtracted) {
      console.log('Re-processing word improvements with extracted text');
      matchImprovementsWithPositions(pdfText);
      // Force re-render by updating a state
      setPageNumber(prev => prev);
    }
  }, [wordImprovements, pdfText, isTextExtracted]);

  // Close tooltip when page changes
  useEffect(() => {
    setSelectedHighlight(null);
  }, [pageNumber]);

  useEffect(() => {
    // Dynamic import of react-pdf components
    const loadPdfComponents = async () => {
      try {
        const pdfModule = await import('react-pdf');
        setDocument(() => pdfModule.Document);
        setPage(() => pdfModule.Page);
        setPdfjs(pdfModule.pdfjs);
        
        // Configure worker
        pdfModule.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfModule.pdfjs.version}/build/pdf.worker.min.js`;
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF components:', error);
        setIsLoading(false);
      }
    };

    loadPdfComponents();
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    extractTextAndPositions();
  }

  const extractTextAndPositions = async () => {
    if (!pdfjs || !file) return;
    
    try {
      console.log('PDF Viewer - Starting improved text extraction with better positioning');
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      const textData: Array<{ page: number; text: string; items: any[] }> = [];

      // Only extract from first few pages for performance
      const maxPages = Math.min(pdf.numPages, 3);
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });
        
        let pageText = '';
        const textItems: any[] = [];
        
        // Use actual PDF text positioning with better coordinate mapping
        textContent.items.forEach((item: any, itemIndex: number) => {
          if (item.str && item.str.trim()) {
            const textBefore = pageText;
            pageText += item.str + ' ';
            
            // Use actual PDF coordinates with proper transform
            // PDF coordinates are from bottom-left, we need top-left
            const x = item.transform[4]; // PDF x position
            const y = viewport.height - item.transform[5]; // Convert to top-left origin
            
            textItems.push({
              text: item.str,
              x: x,
              y: y - (item.height || 12), // Adjust for text baseline
              width: item.width || (item.str.length * 8),
              height: item.height || 12,
              textStart: textBefore.length,
              textEnd: pageText.length - 1,
              transform: item.transform,
              fontName: item.fontName
            });
          }
        });
        
        textData.push({ page: pageNum, text: pageText, items: textItems });
      }
      
      console.log('PDF Viewer - Simplified text extraction completed');
      setPdfText(textData);
      setIsTextExtracted(true);
      
      // Process improvements immediately if available
      if (wordImprovements.length > 0) {
        console.log('PDF Viewer - Processing word improvements with simplified approach');
        matchImprovementsWithPositions(textData);
      }
    } catch (error) {
      console.error('Error in simplified PDF text extraction:', error);
      // Create fallback text data for basic functionality
      const fallbackData = [{
        page: 1,
        text: 'PDF content extracted',
        items: []
      }];
      setPdfText(fallbackData);
      setIsTextExtracted(true);
      
      if (wordImprovements.length > 0) {
        matchImprovementsWithPositions(fallbackData);
      }
    }
  };

  const matchImprovementsWithPositions = (textData: Array<{ page: number; text: string; items: any[] }>) => {
    console.log('PDF Viewer - Matching word improvements with improved positioning');

    wordImprovements.forEach((improvement, index) => {
      const searchText = improvement.original.toLowerCase().trim();
      let bestMatch = null;
      let bestScore = 0;
      
      // Search through all pages and text items for the best match
      for (const pageData of textData) {
        const pageText = pageData.text.toLowerCase();
        
        // Try to find exact match first
        let matchIndex = pageText.indexOf(searchText);
        if (matchIndex !== -1) {
          // Find the text item that contains this position
          for (const item of pageData.items) {
            if (item.textStart <= matchIndex && item.textEnd >= matchIndex) {
              bestMatch = {
                pageNumber: pageData.page,
                x: Number(item.x) || 0,
                y: Number(item.y) || 0,
                width: Math.max(Number(item.width) || 0, searchText.length * 8),
                height: Number(item.height) || 20
              };
              bestScore = 100; // Exact match
              break;
            }
          }
          if (bestMatch) break;
        }
        
        // If no exact match, try fuzzy matching for partial words
        if (!bestMatch && pageData.items.length > 0) {
          for (const item of pageData.items) {
            const itemText = item.text.toLowerCase().trim();
            if (itemText.includes(searchText.substring(0, Math.min(5, searchText.length)))) {
              const score = (itemText.length > 0) ? (searchText.length / itemText.length) * 50 : 0;
              if (score > bestScore) {
                bestMatch = {
                  pageNumber: pageData.page,
                  x: Number(item.x) || 0,
                  y: Number(item.y) || 0,
                  width: Math.max(Number(item.width) || 0, searchText.length * 8),
                  height: Number(item.height) || 20
                };
                bestScore = score;
              }
            }
          }
        }
      }
      
      // If still no match, use improved fallback positioning
      if (!bestMatch && textData.length > 0) {
        const pageNum = Math.min(1 + Math.floor(index / 8), textData.length);
        const row = index % 8;
        const col = Math.floor(index / 8) % 3;
        
        bestMatch = {
          pageNumber: pageNum,
          x: 60 + col * 180, // Better horizontal spacing
          y: 100 + row * 40,  // Better vertical spacing with proper offset
          width: Math.max(searchText.length * 8, 120),
          height: 20
        };
      }
      
      // Ensure bestMatch conforms to the expected type
      if (bestMatch) {
        improvement.textPosition = {
          pageNumber: bestMatch.pageNumber,
          x: bestMatch.x,
          y: bestMatch.y,
          width: bestMatch.width,
          height: bestMatch.height
        };
      }
      console.log(`PDF Viewer - Assigned position for "${improvement.original.substring(0, 30)}...":`, bestMatch);
    });
    
    console.log('PDF Viewer - Improved positioning complete for all improvements');
  };

  const renderHighlights = (pageNum: number) => {
    if (!showHighlights || !isTextExtracted) {
      console.log(`PDF Viewer - Not rendering highlights: showHighlights=${showHighlights}, isTextExtracted=${isTextExtracted}`);
      return null;
    }

    const pageImprovements = wordImprovements.filter(
      imp => imp.textPosition?.pageNumber === pageNum
    );

    console.log(`PDF Viewer - Rendering ${pageImprovements.length} highlights for page ${pageNum}`);

    const highlights = pageImprovements.map((improvement, index) => {
      if (!improvement.textPosition) {
        return null;
      }

      const { x, y, width, height } = improvement.textPosition;
      
      // Apply scale and add small adjustments for better positioning
      const finalStyle = {
        left: (x * scale) - 5, // Small horizontal offset with padding
        top: (y * scale) + 2,  // Small vertical offset to align better
        width: Math.max((width * scale) + 20, 100), // Increased width with minimum size
        height: (height * scale) + 5, // Slightly increased height
        backgroundColor: severityColors[improvement.severity],
        border: `2px solid ${severityBorders[improvement.severity]}`,
        borderRadius: '4px',
        opacity: 0.7,
        zIndex: 1000,
        position: 'absolute' as const,
        pointerEvents: 'auto' as const,
        cursor: 'pointer',
        transition: 'opacity 0.2s ease'
      };

      console.log(`PDF Viewer - Highlight ${index} style:`, {
        improvement: improvement.original.substring(0, 30) + '...',
        style: finalStyle,
        severity: improvement.severity
      });
      
      return (
        <div
          key={`highlight-${pageNum}-${index}`}
          className="absolute cursor-pointer"
          style={finalStyle}
          onClick={() => {
            console.log('Highlight clicked:', improvement);
            setSelectedHighlight(selectedHighlight === improvement ? null : improvement);
            onHighlightClick?.(improvement);
          }}
        >
          {/* Make highlight more visible with content */}
          <div className="w-full h-full bg-current opacity-80"></div>
          
          {/* Show tooltip if this highlight is selected */}
          {selectedHighlight === improvement && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <div className="text-white text-sm rounded-lg px-4 py-3 max-w-xs shadow-xl border border-white" style={{ backgroundColor: '#000000' }}>
                <div className="font-semibold text-yellow-300 mb-1">{improvement.severity.toUpperCase()}</div>
                <div className="text-red-200 mb-1 break-words">
                  <span className="font-medium">Original:</span> "{improvement.original}"
                </div>
                <div className="text-green-200 mb-2 break-words">
                  <span className="font-medium">Suggested:</span> "{improvement.improved}"
                </div>
                <div className="text-white break-words leading-relaxed">
                  {improvement.explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });

    console.log(`PDF Viewer - Created ${highlights.filter(h => h !== null).length} highlight elements`);
    return highlights;
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(numPages, prev + 1));
  const zoomIn = () => setScale(prev => Math.min(2.5, prev + 0.2));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.2));

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-slate-100 h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-slate-400">Loading PDF viewer...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Document || !Page) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-slate-100 h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">Error loading PDF components</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-400" />
            Resume Preview
            {showHighlights && wordImprovements.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {wordImprovements.length} highlights
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(1.2)}
              className="text-xs"
            >
              Reset Zoom
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {numPages > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <span className="text-slate-300">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
              >
                Next
              </Button>
            </div>
            
            {wordImprovements.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">
                  Highlights: {showHighlights ? 'ON' : 'OFF'}
                </span>
                {showHighlights ? (
                  <Eye className="h-4 w-4 text-green-400" />
                ) : (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        <div 
          ref={containerRef}
          className="relative bg-white rounded-lg overflow-auto shadow-2xl border-2 border-slate-600"
          style={{ height: '65vh' }}
          onClick={(e) => {
            // Close tooltip if clicking on the container but not on a highlight
            if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.page')) {
              setSelectedHighlight(null);
            }
          }}
        >
          <div className="relative w-full h-full">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading PDF...</div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">Error loading PDF</div>
                </div>
              }
            >
              <div className="relative inline-block">
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  loading={<div className="text-gray-500">Loading page...</div>}
                />
                {/* Render highlights overlay - positioned absolutely over the page */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="relative w-full h-full pointer-events-auto">
                    {renderHighlights(pageNumber)}
                  </div>
                </div>
              </div>
            </Document>
          </div>
        </div>
        
        {showHighlights && wordImprovements.length > 0 && (
          <div className="mt-4 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Urgent ({wordImprovements.filter(i => i.severity === 'red').length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Important ({wordImprovements.filter(i => i.severity === 'yellow').length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Minor ({wordImprovements.filter(i => i.severity === 'green').length})</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
