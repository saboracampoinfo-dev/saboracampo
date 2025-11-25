import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email es requerido',
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email inválido',
        },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    await dbConnect();

    // Verificar si el usuario existe en MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.warn('⚠️ Usuario no encontrado en MongoDB:', email);
      // Por seguridad, no revelar si el usuario existe o no
      // Firebase enviará el email si existe en Authentication
      return NextResponse.json(
        {
          success: true,
          message: 'Si el correo existe, recibirás un email para restablecer tu contraseña',
        },
        { status: 200 }
      );
    }

    // Verificar que el usuario tenga firebaseUid
    if (!user.firebaseUid) {
      console.error('❌ Usuario sin firebaseUid:', email);
      return NextResponse.json(
        {
          success: false,
          error: 'Este usuario no puede restablecer la contraseña. Contacta al administrador.',
        },
        { status: 400 }
      );
    }

    console.log('✅ Usuario verificado en MongoDB:', email);
    console.log('   Firebase UID:', user.firebaseUid);

    // El cliente se encargará de enviar el email usando Firebase
    return NextResponse.json({
      success: true,
      message: 'Usuario verificado. Puedes proceder con el restablecimiento.',
    });
  } catch (error: any) {
    console.error('❌ Error en reset-password:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
