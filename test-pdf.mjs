import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

pdfjsLib.getDocument({data: new Uint8Array([37, 80, 68, 70, 45, 49, 46])}).promise
  .then(() => console.log('SUCCESS'))
  .catch(e => console.error(e));
