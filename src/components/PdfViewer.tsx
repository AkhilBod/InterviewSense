"use client";

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { WordImprovementSuggestion } from '@/types/resume'; // Assuming this type is correct

// PDF.js worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


interface PDFViewerProps {
  file: File | null;
  highlightPosition: WordImprovementSuggestion['textPosition'] | null;
}

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface TextLayerRenderedEvent {
  source: any; // The PageViewport object
  textDivs: HTMLElement[];
  textContent: {
    items: TextItem[];
    styles: any;
  };
}


export default function PDFViewer({ file, highlightPosition }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [renderKey, setRenderKey] = useState(0); // Used to force re-render for highlighting

  useEffect(() => {
    // Reset page number when file changes
    setPageNumber(1);
    setRenderKey(prev => prev + 1); // Force re-render when file or highlight changes
  }, [file, highlightPosition]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  const goToNextPage = () => setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));

  // This is a simplified highlight rendering.
  // For accurate highlighting based on coordinates, you'd need to:
  // 1. Get the text layer elements after they are rendered.
  // 2. Match `highlightPosition.text` with the text content.
  // 3. Use `highlightPosition.pageNumber` and `highlightPosition.coordinates`
  //    to draw an overlay on the correct page and position.
  // This often involves complex coordinate transformations.
  const customTextRenderer = (textLayer: TextLayerRenderedEvent) => {
    if (!highlightPosition || (highlightPosition.pageNumber && highlightPosition.pageNumber !== pageNumber)) {
      return null; // Don't render highlight if not on the correct page or no highlight
    }
  
    // If textPosition includes specific text to highlight and its coordinates
    if (highlightPosition.text && highlightPosition.coordinates && highlightPosition.coordinates.length > 0) {
      const { text: textToHighlight, coordinates, pageNumber: highlightPage } = highlightPosition;
  
      if (highlightPage && highlightPage !== pageNumber) return null;

      // The coordinates might be an array of [x, y, width, height] quads.
      // This is a very basic example assuming a single bounding box.
      // You'll need to adapt this based on your `textPosition` structure.
      // And transform viewport coordinates to page coordinates if necessary.
      
      // Example: Assuming coordinates are [x1, y1, x2, y2] for a bounding box
      // and are relative to the page.
      // This part is highly dependent on how your `textPosition.coordinates` are structured
      // and how `react-pdf` handles scaling and rendering.
      
      // Let's try to find the text and wrap it. This is simpler than coordinate-based highlighting
      // but less precise if the same text appears multiple times.
      textLayer.textDivs.forEach(div => {
        if (div.textContent?.includes(textToHighlight)) {
          // This is a very naive way to highlight.
          // A proper solution would involve splitting the text node and wrapping the match.
          // Or, using the coordinates to draw an absolute positioned div.
          const regex = new RegExp(`(${textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')})`, 'gi');
          if (div.innerHTML.match(regex)) {
            div.innerHTML = div.innerHTML.replace(regex, `<mark style="background-color: yellow; padding:1px;">$1</mark>`);
          }
        }
      });
    }
    return null; // Default rendering
  };


  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-700/30 rounded-lg">
        <p className="text-slate-400">No resume uploaded.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center bg-slate-700/30 rounded-lg p-4">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => console.error('Error loading PDF:', error)}
        className="flex flex-col items-center w-full h-full overflow-hidden"
        key={renderKey} // Force re-render
      >
        <div 
          className="overflow-auto w-full flex-grow mb-2 rounded-md border border-slate-600"
          // Style this container to control the size of the PDF page display area
        >
          <Page 
            pageNumber={pageNumber} 
            width={Math.min(window.innerWidth * 0.4, 700)} // Adjust width as needed
            renderTextLayer={true} // Ensure text layer is rendered for text selection/highlighting
            renderAnnotationLayer={true}
            customTextRenderer={customTextRenderer as any} // `as any` because of potential type mismatch with react-pdf's internal types
            key={`page-${pageNumber}-highlight-${JSON.stringify(highlightPosition)}`} // Force re-render of page on highlight change
          />
        </div>
      </Document>
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-2 text-slate-200">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="px-3 py-1 bg-slate-600 rounded hover:bg-slate-500 disabled:opacity-50">
            Prev
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="px-3 py-1 bg-slate-600 rounded hover:bg-slate-500 disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
