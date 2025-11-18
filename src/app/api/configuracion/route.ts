import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import { authenticateRequest } from '@/lib/auth';

// GET - Obtener configuración activa (público)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Buscar configuración activa o crear una por defecto
    let configuracion = await Configuracion.findOne({ activo: true });
    
    if (!configuracion) {
      configuracion = await Configuracion.create({
        nombreEmpresa: 'Sabor a Campo',
        correoAdministracion: 'admin@saboracampo.com',
        correoVentas: 'ventas@saboracampo.com',
        telefonoAdministracion: '+52 123 456 7890',
        telefonoVentas: '+52 123 456 7891',
        activo: true
      });
    }
    
    return NextResponse.json({
      success: true,
      data: configuracion
    });
  } catch (error: any) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la configuración',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración (solo admin)
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación y rol de administrador
    const { authenticated, user } = await authenticateRequest(request);
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado. Solo administradores pueden actualizar la configuración' 
        },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    
    // Obtener configuración activa
    let configuracion = await Configuracion.findOne({ activo: true });
    
    if (!configuracion) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se encontró configuración activa' 
        },
        { status: 404 }
      );
    }
    
    // Actualizar campos
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        (configuracion as any)[key] = body[key];
      }
    });
    
    await configuracion.save();
    
    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: configuracion
    });
  } catch (error: any) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la configuración',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva configuración (solo admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol de administrador
    const { authenticated, user } = await authenticateRequest(request);
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado. Solo administradores pueden crear configuración' 
        },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    
    // Crear nueva configuración (automáticamente desactivará las demás)
    const nuevaConfiguracion = await Configuracion.create(body);
    
    return NextResponse.json({
      success: true,
      message: 'Configuración creada correctamente',
      data: nuevaConfiguracion
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear configuración:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la configuración',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
