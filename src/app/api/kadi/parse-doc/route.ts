import { NextResponse } from 'next/server';
import { parseDocument } from '@/lib/document-parser';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await parseDocument(buffer, file.type);

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('[PARSE_DOC_ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
