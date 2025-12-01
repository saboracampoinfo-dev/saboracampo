import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerator } from '@/utils/pdfGenerator';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [API] POST /api/transferencias/pdf');
    const { authenticated, user } = await authenticateRequest(request);
    
    if (!authenticated || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      transferencia,
      sucursalOrigen,
      sucursalDestino,
      items,
      grupos,
      totalProductos,
      totalUnidades
    } = body;

    // Verificar el tipo de transferencia
    const esMasiva = transferencia?.esMasiva;
    const esAgrupada = transferencia?.esAgrupada || (grupos && !esMasiva);

    if (esAgrupada) {
      // Transferencia AGRUPADA - múltiples transferencias organizadas por sucursales
      console.log('📦 Generando PDF AGRUPADO (Orden de Picking)');
      console.log('📊 Total productos:', totalProductos);
      console.log('📊 Total unidades:', totalUnidades);
      console.log('📊 Número de grupos:', grupos?.length);
      
      if (!grupos || !Array.isArray(grupos) || grupos.length === 0) {
        console.error('❌ Faltan grupos para PDF agrupado');
        return NextResponse.json(
          { error: 'Faltan datos de grupos para generar el PDF agrupado' },
          { status: 400 }
        );
      }

      const pdfGenerator = new PDFGenerator({
        title: 'Orden de Picking - Transferencias Agrupadas',
        author: 'Sabor a Campo',
        subject: 'Transferencias agrupadas por sucursales'
      });

      console.log('🔄 Generando PDF agrupado...');
      const pdfBuffer = await pdfGenerator.generateTransferenciaAgrupada({
        transferencia,
        grupos,
        totalProductos: totalProductos || 0,
        totalUnidades: totalUnidades || 0,
        generadoPor: user.name || user.email
      });

      console.log('✅ PDF generado. Tamaño:', pdfBuffer.length, 'bytes');

      const fileName = `orden_picking_agrupada_${Date.now()}.pdf`;

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });

    } else if (esMasiva) {
      // Transferencia MASIVA - una única orden con múltiples sucursales
      console.log('📦 Generando PDF MASIVO');
      console.log('📊 Total productos:', totalProductos);
      console.log('📊 Total unidades:', totalUnidades);
      console.log('📊 Número de grupos:', grupos?.length);
      
      if (!grupos || !Array.isArray(grupos) || grupos.length === 0) {
        console.error('❌ Faltan grupos para PDF masivo');
        return NextResponse.json(
          { error: 'Faltan datos de grupos para generar el PDF masivo' },
          { status: 400 }
        );
      }

      const pdfGenerator = new PDFGenerator({
        title: 'Orden de Transferencia de Stock Masiva',
        author: 'Sabor a Campo',
        subject: 'Transferencia masiva de productos'
      });

      console.log('🔄 Generando PDF masivo...');
      const pdfBuffer = await pdfGenerator.generateTransferenciaMasiva({
        transferencia,
        grupos,
        totalProductos: totalProductos || 0,
        totalUnidades: totalUnidades || 0,
        generadoPor: user.name || user.email
      });

      console.log('✅ PDF generado. Tamaño:', pdfBuffer.length, 'bytes');

      const fileName = `orden_transferencia_masiva_${Date.now()}.pdf`;

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });

    } else {
      // Transferencia INDIVIDUAL del historial
      console.log('📦 Generando PDF INDIVIDUAL');
      console.log('📊 Sucursal origen:', sucursalOrigen?.nombre);
      console.log('📊 Sucursal destino:', sucursalDestino?.nombre);
      console.log('📊 Items:', items?.length);
      
      if (!transferencia || !sucursalOrigen || !sucursalDestino || !items) {
        console.error('❌ Faltan datos para PDF individual');
        return NextResponse.json(
          { error: 'Faltan datos para generar el PDF' },
          { status: 400 }
        );
      }

      const pdfGenerator = new PDFGenerator({
        title: 'Orden de Transferencia de Stock',
        author: 'Sabor a Campo',
        subject: `Transferencia de ${sucursalOrigen.nombre} a ${sucursalDestino.nombre}`
      });

      console.log('🔄 Generando PDF individual...');
      const pdfBuffer = await pdfGenerator.generateTransferenciaOrden({
        transferencia,
        sucursalOrigen,
        sucursalDestino,
        items,
        generadoPor: user.name || user.email
      });

      console.log('✅ PDF generado. Tamaño:', pdfBuffer.length, 'bytes');

      const fileName = `orden_transferencia_${Date.now()}.pdf`;

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    }

  } catch (error: any) {
    console.error('Error al generar PDF de transferencia:', error);
    return NextResponse.json(
      { error: 'Error al generar PDF', details: error.message },
      { status: 500 }
    );
  }
}
