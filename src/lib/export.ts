import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "@/components/ui/use-toast";
import { TechnicalAssessmentResult } from '@/app/technical-assessment/results/page';
import { InterviewSummary } from './gemini';

// Function to create a PDF from an HTML element
export const exportToPDF = async (elementId: string, fileName: string): Promise<void> => {
  try {
    toast({
      title: "Preparing PDF...",
      description: "Please wait while we generate your report.",
    });
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Element not found");
    }

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#0F172A', // Slate-900 color
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate the PDF dimensions based on the canvas
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add first page
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    doc.save(`${fileName}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: `Your report has been saved as ${fileName}.pdf`,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast({
      title: "Error",
      description: "Failed to generate PDF. Please try again.",
      variant: "destructive"
    });
  }
};

// Function to print the current page
export const printReport = (): void => {
  try {
    toast({
      title: "Preparing to print...",
      description: "Your browser's print dialog will open shortly.",
    });
    
    setTimeout(() => {
      window.print();
    }, 500);
  } catch (error) {
    console.error('Error printing report:', error);
    toast({
      title: "Error",
      description: "Failed to open print dialog. Please try again.",
      variant: "destructive"
    });
  }
};

// Function to share report via a system share dialog (if supported) or copy link
export const shareReport = async (title: string, text: string): Promise<void> => {
  try {
    // Check if the Web Share API is available
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: text,
        url: window.location.href,
      });
      
      toast({
        title: "Shared successfully",
        description: "Your report has been shared.",
      });
    } else {
      // Fallback: Copy the URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      
      toast({
        title: "Link copied",
        description: "Report link has been copied to clipboard.",
      });
    }
  } catch (error) {
    console.error('Error sharing report:', error);
    toast({
      title: "Error",
      description: "Failed to share report. Please try again.",
      variant: "destructive"
    });
  }
};

// Format technical assessment data for sharing
export const formatTechnicalReportForSharing = (result: TechnicalAssessmentResult): string => {
  return `
Technical Assessment Report
--------------------------
Company: ${result.company}
Role: ${result.role}
Date: ${result.date}
Difficulty: ${result.difficulty}
Overall Score: ${result.overallScore}%

Strengths: ${result.strengths.join(', ')}
Areas for Improvement: ${result.improvementAreas.join(', ')}

View the full report at: ${window.location.href}
  `;
};

// Format interview feedback data for sharing
export const formatInterviewReportForSharing = (summary: InterviewSummary): string => {
  return `
Interview Feedback Report
--------------------------
Role: ${summary.jobRole}
Company: ${summary.company}
Date: ${summary.date}
Duration: ${summary.duration}
Overall Score: ${summary.overallScore}%

Strengths: ${summary.strengthAreas.join(', ')}
Areas for Improvement: ${summary.improvementAreas.join(', ')}

View the full report at: ${window.location.href}
  `;
};
