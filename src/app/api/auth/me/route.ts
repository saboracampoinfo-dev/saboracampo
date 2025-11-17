import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - Verificar sesión actual y obtener datos del usuario
export async function GET(request: NextRequest) {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Conectar a DB y obtener usuario actualizado
    await connectDB();
    const user = await User.findById(decoded.userId).select('-__v');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { success: false, error: 'Usuario desactivado' },
        { status: 403 }
      );
    }

    // Preparar respuesta sin datos sensibles
    const userResponse = {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      imgProfile: user.imgProfile,
      role: user.role,
      telefono: user.telefono,
      domicilio: user.domicilio,
      activo: user.activo,
    };

    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error: any) {
    console.error('Error in verify session:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}
