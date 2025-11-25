import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';
import { generateToken } from '@/lib/jwt';

// POST - Login de usuario
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { idToken } = body;

    // Validar que se proporcionó el token de Firebase
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Token de Firebase requerido' },
        { status: 400 }
      );
    }

    // Verificar el token de Firebase
    let decodedToken;
    try {
      decodedToken = await adminAuth().verifyIdToken(idToken);
    } catch (firebaseError: any) {
      console.error('Error verifying Firebase token:', firebaseError);
      return NextResponse.json(
        { success: false, error: 'Token de Firebase inválido o expirado' },
        { status: 401 }
      );
    }

    const { uid, email } = decodedToken;

    // Buscar usuario en MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    // Si el usuario no existe en MongoDB, crearlo (sync con Firebase)
    if (!user) {
      // Obtener información adicional de Firebase
      const firebaseUser = await adminAuth().getUser(uid);
      
      user = await User.create({
        firebaseUid: uid,
        name: firebaseUser.displayName || 'Usuario',
        email: email!.toLowerCase(),
        role: 'user',
        activo: true,
      });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return NextResponse.json(
        { success: false, error: 'Usuario desactivado. Contacte al administrador' },
        { status: 403 }
      );
    }

    // Generar JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name, // 👈 Agregar el nombre al token
      firebaseUid: user.firebaseUid!,
    });

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

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      data: userResponse,
      token,
      message: 'Login exitoso',
    });

    // Establecer cookie httpOnly con el token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
