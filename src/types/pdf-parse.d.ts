declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: Record<string, any> | null;
    version: string;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: Record<string, any>): Promise<PDFData>;
  export default pdfParse;
}
