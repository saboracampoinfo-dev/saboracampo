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
      // Permitir que Firebase intente enviar el email de todas formas
      // Si el usuario existe en Firebase pero no en MongoDB, funcionará
      return NextResponse.json(
        {
          success: true,
          message: 'Usuario verificado. Puedes proceder con el restablecimiento.',
        },
        { status: 200 }
      );
    }

    // Si el usuario existe en MongoDB pero no tiene firebaseUid, es un caso especial
    if (!user.firebaseUid) {
      console.warn('⚠️ Usuario sin firebaseUid en MongoDB:', email);
      console.warn('   Intentando reset de todas formas (puede existir en Firebase)');
      // Permitir que Firebase intente enviar el email
      // Si el usuario existe en Firebase Authentication, funcionará
      return NextResponse.json({
        success: true,
        message: 'Usuario verificado. Puedes proceder con el restablecimiento.',
      });
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
