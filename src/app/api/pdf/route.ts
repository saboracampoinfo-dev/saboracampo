import { NextResponse } from 'next/server';
import { PDFGenerator } from '@/utils/pdfGenerator';

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    const pdfGenerator = new PDFGenerator({
      title: title || 'Document',
      author: 'Sabor a Campo',
    });

    pdfGenerator
      .addTitle(title || 'Document')
      .addLineBreak()
      .addText(content || 'No content provided');

    const pdfBuffer = await pdfGenerator.generate();

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title || 'document'}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
