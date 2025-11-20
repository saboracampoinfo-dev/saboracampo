/**
 * Script de Prueba - Firebase Admin Credentials (JavaScript Version)
 * 
 * Este script verifica que las credenciales de Firebase Admin estén configuradas correctamente
 * 
 * Uso: node scripts/test-firebase-admin.js
 */

const { readFileSync } = require('fs');
const { resolve } = require('path');

// Cargar variables de entorno manualmente desde .env.local
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remover comillas si existen
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      process.env[key] = value;
    }
  });
  console.log('✅ Variables de entorno cargadas desde .env.local\n');
} catch (error) {
  console.error('❌ No se pudo cargar .env.local:', error.message);
  process.exit(1);
}

async function testFirebaseAdmin() {
  console.log('\n🔥 Verificando credenciales de Firebase Admin...\n');

  // 1. Verificar variables de entorno
  console.log('📋 Paso 1: Verificando variables de entorno...');
  
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId) {
    console.error('❌ FIREBASE_ADMIN_PROJECT_ID no está definida');
    return;
  } else {
    console.log('✅ FIREBASE_ADMIN_PROJECT_ID:', projectId);
  }

  if (!clientEmail) {
    console.error('❌ FIREBASE_ADMIN_CLIENT_EMAIL no está definida');
    return;
  } else {
    console.log('✅ FIREBASE_ADMIN_CLIENT_EMAIL:', clientEmail);
  }

  if (!privateKey) {
    console.error('❌ FIREBASE_ADMIN_PRIVATE_KEY no está definida');
    return;
  } else {
    const keyPreview = privateKey.substring(0, 50);
    console.log('✅ FIREBASE_ADMIN_PRIVATE_KEY:', keyPreview + '...');
    
    // Verificar formato de la clave
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      console.error('⚠️  La clave privada no tiene el formato correcto');
      console.error('   Debe comenzar con "-----BEGIN PRIVATE KEY-----"');
      return;
    }
    
    if (!privateKey.includes('END PRIVATE KEY')) {
      console.error('⚠️  La clave privada no tiene el formato correcto');
      console.error('   Debe terminar con "-----END PRIVATE KEY-----"');
      return;
    }
  }

  console.log('\n📋 Paso 2: Intentando inicializar Firebase Admin...');

  try {
    // Importar Firebase Admin
    const admin = require('firebase-admin');

    // Verificar si ya hay apps inicializadas
    if (admin.apps.length > 0) {
      console.log('ℹ️  Firebase Admin ya estaba inicializado, eliminando...');
      await Promise.all(admin.apps.map(app => app?.delete()));
    }

    // Inicializar Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin inicializado correctamente');

    console.log('\n📋 Paso 3: Verificando conexión con Firebase Auth...');

    const auth = admin.auth();
    
    // Intentar listar usuarios (incluso si está vacío)
    const usersList = await auth.listUsers(1);
    console.log('✅ Conexión exitosa con Firebase Auth');
    console.log(`📊 Usuarios registrados: ${usersList.users.length > 0 ? usersList.users.length + ' (mostrando 1)' : '0'}`);

    console.log('\n🎉 ¡Todo funciona correctamente!');
    console.log('✅ Las credenciales de Firebase Admin son válidas');
    console.log('✅ Puedes proceder a registrar usuarios\n');

    // Limpiar
    await admin.app().delete();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error al conectar con Firebase Admin:\n');
    console.error('Mensaje:', error.message);
    
    if (error.message?.includes('invalid_grant') || error.message?.includes('Invalid JWT')) {
      console.error('\n🔧 SOLUCIÓN:');
      console.error('   El error "invalid_grant" o "Invalid JWT Signature" significa que');
      console.error('   las credenciales de Firebase Admin son inválidas o han expirado.');
      console.error('\n   Para solucionarlo:');
      console.error('   1. Ve a https://console.firebase.google.com/');
      console.error('   2. Selecciona tu proyecto: saboracampo');
      console.error('   3. Ve a Configuración > Cuentas de servicio');
      console.error('   4. Haz clic en "Generar nueva clave privada"');
      console.error('   5. Actualiza las variables en .env.local con los valores del JSON descargado');
      console.error('   6. Reinicia el servidor: npm run dev\n');
      console.error('   📖 Guía detallada: Ver archivo FIREBASE_ADMIN_FIX.md\n');
    } else if (error.code === 'auth/invalid-credential') {
      console.error('\n🔧 SOLUCIÓN:');
      console.error('   Las credenciales son inválidas. Verifica que:');
      console.error('   - FIREBASE_ADMIN_PROJECT_ID sea correcto');
      console.error('   - FIREBASE_ADMIN_CLIENT_EMAIL sea correcto');
      console.error('   - FIREBASE_ADMIN_PRIVATE_KEY esté completa (con BEGIN y END)\n');
    } else {
      console.error('\nDetalles adicionales:', error);
    }
    
    process.exit(1);
  }
}

// Ejecutar la prueba
testFirebaseAdmin().catch(console.error);
