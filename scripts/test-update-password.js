// Test script para verificar actualización de contraseña en Firebase
require('dotenv').config({ path: '.env.local' });

async function testFirebaseAdmin() {
  console.log('🔧 Iniciando test de Firebase Admin...\n');

  try {
    // Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('FIREBASE_SERVICE_ACCOUNT_KEY:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ Configurado' : '❌ No configurado');
    console.log('');

    // Importar Firebase Admin
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getAuth } = require('firebase-admin/auth');

    if (getApps().length === 0) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY no está configurado');
      }

      const serviceAccount = JSON.parse(serviceAccountKey);
      
      console.log('🔑 Service Account:');
      console.log('Project ID:', serviceAccount.project_id);
      console.log('Client Email:', serviceAccount.client_email);
      console.log('Private Key:', serviceAccount.private_key ? `${serviceAccount.private_key.substring(0, 50)}...` : '❌ No presente');
      console.log('');

      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin inicializado correctamente\n');
    }

    const auth = getAuth();

    // Solicitar email del usuario para probar
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('📧 Ingresa el email del usuario para probar actualización de contraseña: ', async (email) => {
      try {
        console.log(`\n🔍 Buscando usuario: ${email}`);
        
        // Buscar usuario por email
        const userRecord = await auth.getUserByEmail(email);
        console.log('✅ Usuario encontrado en Firebase:');
        console.log('UID:', userRecord.uid);
        console.log('Email:', userRecord.email);
        console.log('Display Name:', userRecord.displayName);
        console.log('');

        readline.question('🔑 Ingresa la nueva contraseña para probar (mínimo 6 caracteres): ', async (newPassword) => {
          try {
            if (newPassword.length < 6) {
              console.log('❌ La contraseña debe tener al menos 6 caracteres');
              readline.close();
              return;
            }

            console.log('\n🔄 Actualizando contraseña en Firebase...');
            await auth.updateUser(userRecord.uid, {
              password: newPassword
            });

            console.log('✅ Contraseña actualizada exitosamente en Firebase');
            console.log('');
            console.log('🎉 El usuario ahora puede iniciar sesión con:');
            console.log(`   Email: ${email}`);
            console.log(`   Contraseña: ${newPassword}`);
            console.log('');

          } catch (error) {
            console.error('❌ Error al actualizar contraseña:', error.message);
            console.error('Código de error:', error.code);
          } finally {
            readline.close();
          }
        });

      } catch (error) {
        console.error('❌ Error al buscar usuario:', error.message);
        console.error('Código de error:', error.code);
        readline.close();
      }
    });

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFirebaseAdmin();
