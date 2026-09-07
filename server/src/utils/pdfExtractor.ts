import mammoth from 'mammoth';

// Dynamic import or require for pdf-parse v2 support
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfModule = require('pdf-parse');
    // Check if pdfModule has PDFParse class (v2) or is a function (v1)
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      if (typeof parser.load === 'function') {
        await parser.load();
      }
      const textResult = await parser.getText();
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
      return typeof textResult === 'string' ? textResult : (textResult?.text || '');
    } else if (typeof pdfModule === 'function') {
      const data = await pdfModule(buffer);
      return data.text || '';
    }
    throw new Error('Unsupported pdf-parse module format');
  } catch (error: any) {
    console.error('Error extracting PDF text:', error?.message || error);
    throw new Error(`Không thể đọc tệp PDF: ${error?.message || 'Tệp có thể bị hỏng hoặc đặt mật khẩu.'}`);
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error: any) {
    console.error('Error extracting DOCX text:', error?.message || error);
    throw new Error(`Không thể đọc tệp DOCX: ${error?.message || 'Tệp không đúng định dạng Word.'}`);
  }
}

export async function extractCvDocument(file: { buffer: Buffer; mimetype: string; originalname: string }): Promise<{
  text: string;
  wordCount: number;
  fileName: string;
  fileSize: number;
}> {
  const { buffer, mimetype, originalname } = file;
  const lowerName = originalname.toLowerCase();
  let extractedText = '';

  if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
    extractedText = await extractTextFromPdf(buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    lowerName.endsWith('.docx')
  ) {
    extractedText = await extractTextFromDocx(buffer);
  } else if (mimetype === 'text/plain' || lowerName.endsWith('.txt')) {
    extractedText = buffer.toString('utf-8');
  } else {
    throw new Error('Định dạng tệp không được hỗ trợ. Vui lòng tải lên PDF, DOCX hoặc TXT.');
  }

  // Clean whitespace & format
  const cleaned = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleaned || cleaned.length < 20) {
    throw new Error(
      'Nội dung CV quá ngắn hoặc tệp PDF dạng scan/hình ảnh không chứa lớp văn bản (text layer). Vui lòng sử dụng CV dạng text hoặc copy-paste trực tiếp.'
    );
  }

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  return {
    text: cleaned,
    wordCount,
    fileName: originalname,
    fileSize: buffer.length,
  };
}
