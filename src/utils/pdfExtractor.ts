// @ts-expect-error - Bypass Next.js Turbopack debug bug in pdf-parse's index.js
import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function extractPdfText(url: string): Promise<{ text: string; textLength: number; pageCount: number }> {
  try {
    // 1. Download PDF
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    // 2. Convert to Buffer
    const arrayBuffer = await response.arrayBuffer();
    const dataBuffer = Buffer.from(arrayBuffer);
    
    // 3. Extract text (Standard pdf-parse 1.1.1, no workers, no pdfjs-dist dependency)
    const data = await pdf(dataBuffer);
    
    const fullText = data.text || "";
    const numPages = data.numpages || 0;

    // Required logging
    console.log(`[PDF Extraction Success] URL: ${url}`);
    console.log(`Buffer Size: ${dataBuffer.length}`);
    console.log(`Pages: ${numPages}`);
    console.log(`Extracted Characters: ${fullText.length}`);

    // 4. Return
    return {
      text: fullText,
      textLength: fullText.length,
      pageCount: numPages
    };
  } catch (error) {
    console.error(`[PDF Extraction Failure] URL: ${url}`, error);
    throw error;
  }
}
