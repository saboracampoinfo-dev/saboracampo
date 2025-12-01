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

  addCheckbox(label: string, y?: number): this {
    const x = 50;
    const boxY = y || this.doc.y;
    const boxSize = 15;
    
    // Dibujar el checkbox
    this.doc
      .rect(x, boxY, boxSize, boxSize)
      .stroke();
    
    // Agregar el label
    this.doc
      .fontSize(10)
      .text(label, x + boxSize + 10, boxY + 3, { width: 500 });
    
    this.doc.moveDown(0.5);
    return this;
  }

  addHorizontalLine(): this {
    const y = this.doc.y;
    this.doc
      .moveTo(50, y)
      .lineTo(this.doc.page.width - 50, y)
      .stroke();
    this.doc.moveDown();
    return this;
  }

  async generateTransferenciaMasiva(data: {
    transferencia: any;
    grupos: Array<{
      sucursalOrigen: any;
      sucursalDestino: any;
      items: any[];
    }>;
    totalProductos: number;
    totalUnidades: number;
    generadoPor: string;
  }): Promise<Buffer> {
    const { transferencia, grupos, totalProductos, totalUnidades, generadoPor } = data;
    const fecha = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Encabezado
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('ORDEN DE TRANSFERENCIA MASIVA', { align: 'center' });
    
    this.doc.moveDown(0.5);
    
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Fecha de Generación: ${fecha}`, { align: 'center' });
    
    this.doc.moveDown(1.5);

    // Información general
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('INFORMACIÓN GENERAL');
    
    this.doc.moveDown(0.5);
    this.addHorizontalLine();

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generado por: ${generadoPor}`, 50);
    
    this.doc.text(`Total de productos: ${totalProductos}`, 50);
    this.doc.text(`Total de unidades: ${totalUnidades}`, 50);
    this.doc.text(`Número de rutas: ${grupos.length}`, 50);

    if (transferencia.notas) {
      this.doc.moveDown(0.5);
      this.doc
        .font('Helvetica-Bold')
        .text('Notas: ', 50, this.doc.y, { continued: true })
        .font('Helvetica')
        .text(transferencia.notas);
    }

    this.doc.moveDown(1.5);

    // Procesar cada grupo (ruta)
    grupos.forEach((grupo, grupoIndex) => {
      // Verificar si necesitamos nueva página
      if (this.doc.y > 650) {
        this.doc.addPage();
      }

      // Título del grupo
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`RUTA ${grupoIndex + 1}: ${grupo.sucursalOrigen.nombre} → ${grupo.sucursalDestino.nombre}`);
      
      this.doc.moveDown(0.3);
      this.addHorizontalLine();

      // Información de sucursales
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('ORIGEN:', 50);
      
      this.doc
        .font('Helvetica')
        .text(`${grupo.sucursalOrigen.nombre}`, 120, this.doc.y - 12);
      
      if (grupo.sucursalOrigen.direccion?.calle) {
        this.doc.text(`Dirección: ${grupo.sucursalOrigen.direccion.calle}`, 50);
      }
      
      this.doc.moveDown(0.3);

      this.doc
        .font('Helvetica-Bold')
        .text('DESTINO:', 50);
      
      this.doc
        .font('Helvetica')
        .text(`${grupo.sucursalDestino.nombre}`, 120, this.doc.y - 12);
      
      if (grupo.sucursalDestino.direccion?.calle) {
        this.doc.text(`Dirección: ${grupo.sucursalDestino.direccion.calle}`, 50);
      }

      this.doc.moveDown(0.8);

      // Tabla de productos para este grupo
      const tableTop = this.doc.y;
      const col1X = 50;   // N°
      const col2X = 80;   // Producto
      const col3X = 320;  // Cantidad
      const col4X = 400;  // Stock Origen
      const col5X = 490;  // Stock Destino

      this.doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('N°', col1X, tableTop)
        .text('Producto', col2X, tableTop)
        .text('Cant.', col3X, tableTop)
        .text('Stock O.', col4X, tableTop, { width: 80, align: 'center' })
        .text('Stock D.', col5X, tableTop, { width: 80, align: 'center' });

      this.doc.moveDown(0.5);
      const lineY = this.doc.y;
      this.doc
        .moveTo(col1X, lineY)
        .lineTo(570, lineY)
        .stroke();

      this.doc.moveDown(0.3);

      // Productos del grupo
      this.doc.font('Helvetica').fontSize(8);
      
      grupo.items.forEach((item, itemIndex) => {
        const startY = this.doc.y;
        
        // Verificar espacio
        if (startY > 730) {
          this.doc.addPage();
          this.doc.y = 50;
        }

        const currentY = this.doc.y;

        this.doc
          .text(`${itemIndex + 1}`, col1X, currentY)
          .text(item.nombreProducto, col2X, currentY, { width: 230 })
          .text(item.cantidad.toString(), col3X, currentY)
          .text(item.stockOrigenDespues?.toString() || '0', col4X, currentY, { width: 80, align: 'center' })
          .text(item.stockDestinoDespues?.toString() || '0', col5X, currentY, { width: 80, align: 'center' });

        this.doc.moveDown(0.6);
      });

      this.doc.moveDown(1);
    });

    // Nueva página para checkboxes y firmas
    this.doc.addPage();

    // Sección de verificación
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('VERIFICACIÓN Y CONTROL', { align: 'center' });
    
    this.doc.moveDown(2);

    // Checkboxes de control
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('CONTROLES DE PROCESO:');
    
    this.doc.moveDown(1);

    // Checkbox 1
    const checkbox1Y = this.doc.y;
    this.doc
      .rect(50, checkbox1Y, 20, 20)
      .stroke();
    
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .text('1. VERIFICACIÓN DE STOCK EN ORIGEN', 80, checkbox1Y + 5);
    
    this.doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Se verificó que todos los productos y cantidades están disponibles en las sucursales de origen.', 80, checkbox1Y + 22, { width: 480 });

    this.doc.moveDown(2.5);
    this.doc.fillColor('#000000');

    // Checkbox 2
    const checkbox2Y = this.doc.y;
    this.doc
      .rect(50, checkbox2Y, 20, 20)
      .stroke();
    
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .text('2. CARGA EN TRANSPORTE', 80, checkbox2Y + 5);
    
    this.doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Todos los productos fueron cargados correctamente en el vehículo de transporte.', 80, checkbox2Y + 22, { width: 480 });

    this.doc.moveDown(2.5);
    this.doc.fillColor('#000000');

    // Checkbox 3
    const checkbox3Y = this.doc.y;
    this.doc
      .rect(50, checkbox3Y, 20, 20)
      .stroke();
    
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .text('3. DESCARGA EN DESTINO', 80, checkbox3Y + 5);
    
    this.doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Los productos fueron descargados y verificados en todas las sucursales de destino.', 80, checkbox3Y + 22, { width: 480 });

    this.doc.fillColor('#000000');
    this.doc.moveDown(4);

    // Sección de firmas
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('FIRMAS Y AUTORIZACIONES:');
    
    this.doc.moveDown(2);

    const signatureY = this.doc.y;

    // Firma 1: Preparado por
    this.doc
      .moveTo(50, signatureY + 40)
      .lineTo(200, signatureY + 40)
      .stroke();
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Preparado por:', 50, signatureY + 45, { width: 150, align: 'center' });
    
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text('(Sucursal Origen)', 50, signatureY + 60, { width: 150, align: 'center' });

    // Firma 2: Transportista
    this.doc.fillColor('#000000');
    this.doc
      .moveTo(220, signatureY + 40)
      .lineTo(370, signatureY + 40)
      .stroke();
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Transportista:', 220, signatureY + 45, { width: 150, align: 'center' });
    
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text('(Conductor)', 220, signatureY + 60, { width: 150, align: 'center' });

    // Firma 3: Recibido por
    this.doc.fillColor('#000000');
    this.doc
      .moveTo(390, signatureY + 40)
      .lineTo(545, signatureY + 40)
      .stroke();
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Recibido por:', 390, signatureY + 45, { width: 155, align: 'center' });
    
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text('(Sucursal Destino)', 390, signatureY + 60, { width: 155, align: 'center' });

    this.doc.fillColor('#000000');
    this.doc.moveDown(6);

    // Fecha y hora de cada firma
    const dateY = this.doc.y;
    
    this.doc
      .fontSize(8)
      .text('Fecha: ___/___/___', 50, dateY, { width: 150, align: 'center' });
    
    this.doc
      .text('Hora: ___:___', 50, dateY + 12, { width: 150, align: 'center' });

    this.doc
      .text('Fecha: ___/___/___', 220, dateY, { width: 150, align: 'center' });
    
    this.doc
      .text('Hora: ___:___', 220, dateY + 12, { width: 150, align: 'center' });

    this.doc
      .text('Fecha: ___/___/___', 390, dateY, { width: 155, align: 'center' });
    
    this.doc
      .text('Hora: ___:___', 390, dateY + 12, { width: 155, align: 'center' });

    // Pie de página
    this.doc.moveDown(4);
    this.addHorizontalLine();
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'Este documento es una orden de transferencia masiva oficial. Debe ser firmado por las partes involucradas.',
        50,
        this.doc.y,
        { align: 'center', width: this.doc.page.width - 100 }
      );

    return this.generate();
  }

  async generateTransferenciaOrden(data: {
    transferencia: any;
    sucursalOrigen: any;
    sucursalDestino: any;
    items: any[];
    generadoPor: string;
  }): Promise<Buffer> {
    const { transferencia, sucursalOrigen, sucursalDestino, items, generadoPor } = data;
    const fecha = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Encabezado
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('ORDEN DE TRANSFERENCIA DE STOCK', { align: 'center' });
    
    this.doc.moveDown(0.5);
    
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Fecha de Generación: ${fecha}`, { align: 'center' });
    
    this.doc.moveDown(1.5);

    // Información de Origen y Destino
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('INFORMACIÓN DE TRANSFERENCIA');
    
    this.doc.moveDown(0.5);
    this.addHorizontalLine();

    // Origen
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('SUCURSAL ORIGEN:', 50);
    
    this.doc
      .font('Helvetica')
      .text(`${sucursalOrigen.nombre}`, 200, this.doc.y - 15);
    
    if (sucursalOrigen.direccion?.calle) {
      this.doc.text(`Dirección: ${sucursalOrigen.direccion.calle}`, 50);
    }
    
    if (sucursalOrigen.direccion?.ciudad) {
      this.doc.text(`Ciudad: ${sucursalOrigen.direccion.ciudad}`, 50);
    }
    
    if (sucursalOrigen.telefono) {
      this.doc.text(`Teléfono: ${sucursalOrigen.telefono}`, 50);
    }

    this.doc.moveDown(1);

    // Destino
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('SUCURSAL DESTINO:', 50);
    
    this.doc
      .font('Helvetica')
      .text(`${sucursalDestino.nombre}`, 200, this.doc.y - 15);
    
    if (sucursalDestino.direccion?.calle) {
      this.doc.text(`Dirección: ${sucursalDestino.direccion.calle}`, 50);
    }
    
    if (sucursalDestino.direccion?.ciudad) {
      this.doc.text(`Ciudad: ${sucursalDestino.direccion.ciudad}`, 50);
    }
    
    if (sucursalDestino.telefono) {
      this.doc.text(`Teléfono: ${sucursalDestino.telefono}`, 50);
    }

    this.doc.moveDown(1);
    this.addHorizontalLine();
    this.doc.moveDown(0.5);

    // Información adicional
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generado por: ${generadoPor}`, 50);
    
    this.doc.text(`Total de productos: ${items.length}`, 50);
    
    const totalUnidades = items.reduce((sum, item) => sum + item.cantidad, 0);
    this.doc.text(`Total de unidades: ${totalUnidades}`, 50);

    if (transferencia.notas) {
      this.doc.moveDown(0.5);
      this.doc
        .font('Helvetica-Bold')
        .text('Notas: ', 50, this.doc.y, { continued: true })
        .font('Helvetica')
        .text(transferencia.notas);
    }

    this.doc.moveDown(1.5);

    // Tabla de productos
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('PRODUCTOS A TRANSFERIR');
    
    this.doc.moveDown(0.5);

    // Headers de la tabla
    const tableTop = this.doc.y;
    const col1X = 50;   // N°
    const col2X = 80;   // Producto
    const col3X = 320;  // Cantidad
    const col4X = 400;  // Stock Origen
    const col5X = 490;  // Stock Destino

    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('N°', col1X, tableTop)
      .text('Producto', col2X, tableTop)
      .text('Cantidad', col3X, tableTop)
      .text('Stock Origen', col4X, tableTop, { width: 80, align: 'center' })
      .text('Stock Destino', col5X, tableTop, { width: 80, align: 'center' });

    // Línea debajo de headers
    this.doc.moveDown(0.5);
    const lineY = this.doc.y;
    this.doc
      .moveTo(col1X, lineY)
      .lineTo(570, lineY)
      .stroke();

    this.doc.moveDown(0.5);

    // Productos
    this.doc.font('Helvetica').fontSize(9);
    
    items.forEach((item, index) => {
      const startY = this.doc.y;
      
      // Verificar si hay espacio suficiente para el item
      if (startY > 700) {
        this.doc.addPage();
        this.doc.y = 50;
      }

      const currentY = this.doc.y;

      this.doc
        .text(`${index + 1}`, col1X, currentY)
        .text(item.nombreProducto, col2X, currentY, { width: 230 })
        .text(item.cantidad.toString(), col3X, currentY)
        .text(item.stockOrigenDespues?.toString() || '0', col4X, currentY, { width: 80, align: 'center' })
        .text(item.stockDestinoDespues?.toString() || '0', col5X, currentY, { width: 80, align: 'center' });

      this.doc.moveDown(0.8);
    });

    this.doc.moveDown(2);

    // Nueva página para checkboxes y firmas
    this.doc.addPage();

    // Sección de verificación
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('VERIFICACIÓN Y CONTROL', { align: 'center' });
    
    this.doc.moveDown(2);

    // Checkboxes de control
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('CONTROLES DE PROCESO:');
    
    this.doc.moveDown(1);

    // Checkbox 1
    const checkbox1Y = this.doc.y;
    this.doc
      .rect(50, checkbox1Y, 20, 20)
      .stroke();
    
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .text('1. VERIFICACIÓN DE STOCK EN ORIGEN', 80, checkbox1Y + 5);
    
    this.doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Se verificó que todos los productos y cantidades están disponibles en la sucursal de origen.', 80, checkbox1Y + 22, { width: 480 });

    this.doc.moveDown(2.5);
    this.doc.fillColor('#000000');

    // Checkbox 2
    const checkbox2Y = this.doc.y;
    this.doc
      .rect(50, checkbox2Y, 20, 20)
      .stroke();
    
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .text('2. CARGA EN TRANSPORTE', 80, checkbox2Y + 5);
    
    this.doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Todos los productos fueron cargados correctamente en el vehículo de transporte.', 80, checkbox2Y + 22, { width: 480 });

    this.doc.moveDown(2.5);
    this.doc.fillColor('#000000');

    // Checkbox 3
    const checkbox3Y = this.doc.y;
    this.doc
      .rect(50, checkbox3Y, 20, 20)
      .stroke();
    
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .text('3. DESCARGA EN DESTINO', 80, checkbox3Y + 5);
    
    this.doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Los productos fueron descargados y verificados en la sucursal de destino.', 80, checkbox3Y + 22, { width: 480 });

    this.doc.fillColor('#000000');
    this.doc.moveDown(4);

    // Sección de firmas
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('FIRMAS Y AUTORIZACIONES:');
    
    this.doc.moveDown(2);

    const signatureY = this.doc.y;

    // Firma 1: Preparado por
    this.doc
      .moveTo(50, signatureY + 40)
      .lineTo(200, signatureY + 40)
      .stroke();
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Preparado por:', 50, signatureY + 45, { width: 150, align: 'center' });
    
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text('(Sucursal Origen)', 50, signatureY + 60, { width: 150, align: 'center' });

    // Firma 2: Transportista
    this.doc.fillColor('#000000');
    this.doc
      .moveTo(220, signatureY + 40)
      .lineTo(370, signatureY + 40)
      .stroke();
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Transportista:', 220, signatureY + 45, { width: 150, align: 'center' });
    
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text('(Conductor)', 220, signatureY + 60, { width: 150, align: 'center' });

    // Firma 3: Recibido por
    this.doc.fillColor('#000000');
    this.doc
      .moveTo(390, signatureY + 40)
      .lineTo(545, signatureY + 40)
      .stroke();
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Recibido por:', 390, signatureY + 45, { width: 155, align: 'center' });
    
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text('(Sucursal Destino)', 390, signatureY + 60, { width: 155, align: 'center' });

    this.doc.fillColor('#000000');
    this.doc.moveDown(6);

    // Fecha y hora de cada firma
    const dateY = this.doc.y;
    
    this.doc
      .fontSize(8)
      .text('Fecha: ___/___/___', 50, dateY, { width: 150, align: 'center' });
    
    this.doc
      .text('Hora: ___:___', 50, dateY + 12, { width: 150, align: 'center' });

    this.doc
      .text('Fecha: ___/___/___', 220, dateY, { width: 150, align: 'center' });
    
    this.doc
      .text('Hora: ___:___', 220, dateY + 12, { width: 150, align: 'center' });

    this.doc
      .text('Fecha: ___/___/___', 390, dateY, { width: 155, align: 'center' });
    
    this.doc
      .text('Hora: ___:___', 390, dateY + 12, { width: 155, align: 'center' });

    // Pie de página
    this.doc.moveDown(4);
    this.addHorizontalLine();
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'Este documento es una orden de transferencia oficial. Debe ser firmado por las partes involucradas.',
        50,
        this.doc.y,
        { align: 'center', width: this.doc.page.width - 100 }
      );

    return this.generate();
  }

  async generateTransferenciaAgrupada(data: {
    transferencia: any;
    grupos: Array<{
      sucursalOrigen: any;
      sucursalDestino: any;
      items: any[];
      transferenciasIds: string[];
    }>;
    totalProductos: number;
    totalUnidades: number;
    generadoPor: string;
  }): Promise<Buffer> {
    const { transferencia, grupos, totalProductos, totalUnidades, generadoPor } = data;
    const fecha = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Encabezado
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('ORDEN DE PICKING - TRANSFERENCIAS', { align: 'center' });
    
    this.doc.moveDown(0.5);
    
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Fecha de Generación: ${fecha}`, { align: 'center' });
    
    this.doc.moveDown(1.5);

    // Información general
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('INFORMACIÓN GENERAL');
    
    this.doc.moveDown(0.5);
    this.addHorizontalLine();

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generado por: ${generadoPor}`, 50);
    
    this.doc.text(`Total de productos: ${totalProductos}`, 50);
    this.doc.text(`Total de unidades: ${totalUnidades}`, 50);
    this.doc.text(`Número de rutas: ${grupos.length}`, 50);
    
    const totalTransferencias = grupos.reduce((sum, g) => sum + g.transferenciasIds.length, 0);
    this.doc.text(`Transferencias agrupadas: ${totalTransferencias}`, 50);

    if (transferencia.notas) {
      this.doc.moveDown(0.5);
      this.doc
        .font('Helvetica-Bold')
        .text('Notas: ', 50, this.doc.y, { continued: true })
        .font('Helvetica')
        .text(transferencia.notas);
    }

    this.doc.moveDown(1.5);

    // Procesar cada grupo (ruta)
    grupos.forEach((grupo, grupoIndex) => {
      // Verificar si necesitamos nueva página
      if (this.doc.y > 650) {
        this.doc.addPage();
      }

      // Título del grupo - ocupando todo el ancho
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`${grupo.sucursalOrigen.nombre} → ${grupo.sucursalDestino.nombre}`, 50, this.doc.y, {
          width: 495,
          align: 'left'
        });
      
      this.doc.moveDown(0.5);
      this.addHorizontalLine();

      // Información de sucursales en formato compacto
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('DE: ', 50, this.doc.y, { continued: true })
        .font('Helvetica')
        .fontSize(10);
      
      const origenText = grupo.sucursalOrigen.direccion?.calle 
        ? `${grupo.sucursalOrigen.nombre} (${grupo.sucursalOrigen.direccion.calle})`
        : grupo.sucursalOrigen.nombre;
      
      this.doc.text(origenText, { width: 490 });
      
      this.doc.moveDown(0.3);

      this.doc
        .font('Helvetica-Bold')
        .text('A: ', 50, this.doc.y, { continued: true })
        .font('Helvetica')
        .fontSize(10);
      
      const destinoText = grupo.sucursalDestino.direccion?.calle 
        ? `${grupo.sucursalDestino.nombre} (${grupo.sucursalDestino.direccion.calle})`
        : grupo.sucursalDestino.nombre;
      
      this.doc.text(destinoText, { width: 490 });

      this.doc.moveDown(1);

      // Tabla de productos con checkboxes para este grupo
      const tableTop = this.doc.y;
      const checkboxX = 50;  // Checkbox de picking
      const col1X = 75;      // Número
      const col2X = 100;     // Producto
      const col3X = 350;     // Cantidad
      const col4X = 410;     // Cargó
      const col5X = 460;     // Descargó

      this.doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('☐', checkboxX, tableTop)
        .text('N°', col1X, tableTop)
        .text('Producto', col2X, tableTop)
        .text('Cant.', col3X, tableTop)
        .text('Cargó', col4X, tableTop)
        .text('Descargó', col5X, tableTop);

      this.doc.moveDown(0.5);
      const lineY = this.doc.y;
      this.doc
        .moveTo(checkboxX, lineY)
        .lineTo(545, lineY)
        .stroke();

      this.doc.moveDown(0.5);

      // Productos del grupo con checkboxes
      this.doc.font('Helvetica').fontSize(9);
      
      grupo.items.forEach((item, itemIndex) => {
        const startY = this.doc.y;
        
        // Verificar espacio
        if (startY > 700) {
          this.doc.addPage();
          this.doc.y = 50;
          
          // Repetir headers en nueva página
          this.doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('☐', checkboxX, this.doc.y)
            .text('N°', col1X, this.doc.y)
            .text('Producto', col2X, this.doc.y)
            .text('Cant.', col3X, this.doc.y)
            .text('Cargó', col4X, this.doc.y)
            .text('Descargó', col5X, this.doc.y);
          
          this.doc.moveDown(0.5);
          const newLineY = this.doc.y;
          this.doc
            .moveTo(checkboxX, newLineY)
            .lineTo(545, newLineY)
            .stroke();
          
          this.doc.moveDown(0.5);
        }

        const currentY = this.doc.y;

        // Checkbox principal de picking
        this.doc
          .rect(checkboxX, currentY + 1, 14, 14)
          .stroke();

        // Número del item
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .text((itemIndex + 1).toString(), col1X, currentY + 3);

        // Nombre del producto (más ancho ahora)
        const maxWidth = 235;
        const nombreProducto = item.nombreProducto || 'Producto sin nombre';
        
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .text(nombreProducto, col2X, currentY + 3, { 
            width: maxWidth,
            ellipsis: true
          });

        // Cantidad en negrita
        this.doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(item.cantidad.toString(), col3X, currentY + 3, { width: 50, align: 'center' });

        // Checkbox "Cargó"
        this.doc
          .font('Helvetica')
          .rect(col4X + 5, currentY + 1, 14, 14)
          .stroke();

        // Checkbox "Descargó"
        this.doc
          .rect(col5X + 10, currentY + 1, 14, 14)
          .stroke();

        this.doc.moveDown(1.3);
      });

      // Línea de separación
      this.doc.moveDown(0.5);
      const separatorY = this.doc.y;
      this.doc
        .moveTo(checkboxX, separatorY)
        .lineTo(545, separatorY)
        .stroke();
      
      this.doc.moveDown(0.5);

      // Totales del grupo en una sola línea
      const totalCantidadGrupo = grupo.items.reduce((sum, item) => sum + item.cantidad, 0);
      
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`TOTAL: ${grupo.items.length} productos | ${totalCantidadGrupo} unidades`, 50);

      // Sección de firmas para cada ruta
      this.doc.moveDown(1.5);
      
      const signatureY = this.doc.y;
      
      // Verificar espacio para firmas
      if (signatureY > 680) {
        this.doc.addPage();
      }

      // Tres columnas de firmas más compactas
      const sig1X = 50;
      const sig2X = 213;
      const sig3X = 376;
      const sigWidth = 155;

      // Líneas de firma
      this.doc
        .moveTo(sig1X, this.doc.y + 25)
        .lineTo(sig1X + sigWidth, this.doc.y + 25)
        .stroke();
      
      this.doc
        .moveTo(sig2X, this.doc.y + 25)
        .lineTo(sig2X + sigWidth, this.doc.y + 25)
        .stroke();
      
      this.doc
        .moveTo(sig3X, this.doc.y + 25)
        .lineTo(sig3X + sigWidth, this.doc.y + 25)
        .stroke();

      const textY = this.doc.y + 30;
      
      this.doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Preparó', sig1X, textY, { width: sigWidth, align: 'center' })
        .text('Transportó', sig2X, textY, { width: sigWidth, align: 'center' })
        .text('Recibió', sig3X, textY, { width: sigWidth, align: 'center' });

      this.doc
        .fontSize(7)
        .fillColor('#666666')
        .text('(Origen)', sig1X, textY + 12, { width: sigWidth, align: 'center' })
        .text('(Conductor)', sig2X, textY + 12, { width: sigWidth, align: 'center' })
        .text('(Destino)', sig3X, textY + 12, { width: sigWidth, align: 'center' });

      this.doc.fillColor('#000000');
      
      this.doc.moveDown(3.5);

      // Si hay más grupos, agregar separación o nueva página
      if (grupoIndex < grupos.length - 1) {
        // Verificar si hay espacio para el siguiente grupo
        if (this.doc.y > 600) {
          this.doc.addPage();
        } else {
          // Agregar separador visual
          this.doc.moveDown(1);
          this.addHorizontalLine();
          this.doc.moveDown(1);
        }
      }
    });

    // Pie de página final
    this.doc.moveDown(2);
    this.addHorizontalLine();
    this.doc
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'Orden de picking generada automáticamente. Verificar y firmar cada ruta.',
        50,
        this.doc.y,
        { align: 'center', width: this.doc.page.width - 100 }
      );

    return this.generate();
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
