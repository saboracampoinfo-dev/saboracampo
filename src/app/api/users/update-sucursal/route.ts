import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const { sucursalId, sucursalNombre } = await request.json();

    if (!sucursalId || !sucursalNombre) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Actualizar sucursal del usuario
    const usuarioActualizado = await User.findByIdAndUpdate(
      user.userId,
      {
        sucursalId,
        sucursalNombre
      },
      { new: true }
    );

    if (!usuarioActualizado) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sucursal actualizada correctamente',
      user: {
        id: usuarioActualizado._id,
        sucursalId: usuarioActualizado.sucursalId,
        sucursalNombre: usuarioActualizado.sucursalNombre
      }
    });

  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    return NextResponse.json(
      { error: 'Error al actualizar sucursal' },
      { status: 500 }
    );
  }
}
