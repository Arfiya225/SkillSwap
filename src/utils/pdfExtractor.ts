import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configure PDF.js for Node.js (Next.js API route) execution
// This satisfies the library's requirement for a worker path, which allows it to 
// correctly initialize the fake worker (runs synchronously on the main thread)
// instead of attempting to spawn a browser Web Worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

export async function extractPdfText(buffer: ArrayBuffer, url: string): Promise<string> {
  try {
    const data = new Uint8Array(buffer);
    
    // Disable fonts and rendering specifics since we only need text
    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: true,
      disableFontFace: true,
      standardFontDataUrl: undefined
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    // Required logging
    console.log(`[PDF Extraction Success] URL: ${url} | Pages: ${numPages} | Text Length: ${fullText.length}`);

    return fullText;
  } catch (error) {
    console.error(`[PDF Extraction Failure] URL: ${url}`, error);
    throw error;
  }
}
