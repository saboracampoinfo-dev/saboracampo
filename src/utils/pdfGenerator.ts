import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface PDFOptions {
  title: string;
  author?: string;
  subject?: string;
}

export class PDFGenerator {
  private doc: PDFKit.PDFDocument;

  constructor(options: PDFOptions) {
    this.doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: options.title,
        Author: options.author || 'Sabor a Campo',
        Subject: options.subject || '',
      },
    });
  }

  addTitle(title: string): this {
    this.doc.fontSize(20).text(title, { align: 'center' });
    this.doc.moveDown();
    return this;
  }

  addText(text: string, options?: PDFKit.Mixins.TextOptions): this {
    this.doc.fontSize(12).text(text, options);
    return this;
  }

  addTable(headers: string[], rows: string[][]): this {
    // Simple table implementation
    const tableTop = this.doc.y;
    const itemHeight = 30;
    const columnWidth = (this.doc.page.width - 100) / headers.length;

    // Headers
    this.doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
      this.doc.text(header, 50 + i * columnWidth, tableTop, {
        width: columnWidth,
        align: 'left',
      });
    });

    // Rows
    this.doc.font('Helvetica');
    rows.forEach((row, rowIndex) => {
      const y = tableTop + itemHeight * (rowIndex + 1);
      row.forEach((cell, cellIndex) => {
        this.doc.text(cell, 50 + cellIndex * columnWidth, y, {
          width: columnWidth,
          align: 'left',
        });
      });
    });

    this.doc.moveDown(rows.length + 2);
    return this;
  }

  addLineBreak(): this {
    this.doc.moveDown();
    return this;
  }

  async generate(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      this.doc.on('data', (chunk) => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);
      this.doc.end();
    });
  }

  getStream(): Readable {
    this.doc.end();
    return this.doc as unknown as Readable;
  }
}
