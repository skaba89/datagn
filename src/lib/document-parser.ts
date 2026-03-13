const pdf = require('pdf-parse');
import mammoth from 'mammoth';

export async function parseDocument(file: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
        const data = await pdf(file);
        return data.text;
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file });
        return result.value;
    }

    throw new Error('Format de document non supporté. Veuillez utiliser PDF ou Docx.');
}
