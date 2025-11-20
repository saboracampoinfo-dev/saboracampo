import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/lib/firebase-admin';
import { generateToken } from '@/lib/jwt';

// POST - Register nuevo usuario
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, name, telefono, domicilio } = body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe en MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Crear usuario en Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({
        email: email.toLowerCase(),
        password: password,
        displayName: name,
        emailVerified: false,
      });
    } catch (firebaseError: any) {
      console.error('Error al crear usuario en Firebase:', {
        message: firebaseError.message,
        code: firebaseError.code,
        stack: firebaseError.stack,
      });
      
      // Manejar errores específicos de Firebase
      if (firebaseError.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { success: false, error: 'El email ya está registrado en Firebase' },
          { status: 409 }
        );
      }
      
      // Error de credenciales de Firebase Admin
      if (firebaseError.message?.includes('invalid_grant') || 
          firebaseError.message?.includes('Invalid JWT')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error de configuración de Firebase Admin. Por favor, contacta al administrador.',
            details: 'Las credenciales de Firebase Admin necesitan ser regeneradas.'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Error al crear usuario en Firebase: ' + firebaseError.message },
        { status: 500 }
      );
    }

    // Crear usuario en MongoDB con role por defecto 'user'
    const newUser = await User.create({
      firebaseUid: firebaseUser.uid,
      name,
      email: email.toLowerCase(),
      role: 'user', // Role por defecto, no se puede elegir en el registro
      telefono,
      domicilio,
      activo: true,
    });

    // Generar JWT token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      firebaseUid: firebaseUser.uid,
    });

    // Preparar respuesta sin datos sensibles
    const userResponse = {
      _id: newUser._id,
      firebaseUid: newUser.firebaseUid,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      telefono: newUser.telefono,
      domicilio: newUser.domicilio,
      activo: newUser.activo,
      createdAt: newUser.createdAt,
    };

    // Crear respuesta con cookie
    const response = NextResponse.json(
      {
        success: true,
        data: userResponse,
        token,
        message: 'Usuario registrado exitosamente',
      },
      { status: 201 }
    );

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
    console.error('Error in register:', error);

    // Si hubo error después de crear en Firebase, intentar limpiar
    // (Opcional: podrías implementar rollback más sofisticado)

    return NextResponse.json(
      { success: false, error: error.message || 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
