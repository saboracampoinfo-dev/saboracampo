import { NextRequest, NextResponse } from 'next/server';

// POST - Logout de usuario
export async function POST(request: NextRequest) {
  try {
    // Crear respuesta
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso',
    });

    // Eliminar cookie de autenticación
    response.cookies.delete('auth-token');

    return response;
  } catch (error: any) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
