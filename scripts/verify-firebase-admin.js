#!/usr/bin/env node

/**
 * Script para verificar la configuración de Firebase Admin
 * Úsalo para probar que las credenciales están correctamente configuradas
 * 
 * Uso: node scripts/verify-firebase-admin.js
 */

// Cargar variables de entorno manualmente desde .env.local
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Remover comillas si existen
          value = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
    console.log('✅ Variables de .env.local cargadas\n');
  } else {
    console.log('⚠️  .env.local no encontrado, usando variables de entorno del sistema\n');
  }
} catch (error) {
  console.log('⚠️  Error cargando .env.local:', error.message, '\n');
}

console.log('🔍 Verificando configuración de Firebase Admin...\n');

// 1. Verificar variables de entorno
console.log('📋 Paso 1: Verificando variables de entorno');
console.log('-------------------------------------------');

const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const hasIndividualVars = !!(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

if (hasServiceAccountKey) {
  console.log('✅ FIREBASE_SERVICE_ACCOUNT_KEY encontrada');
  console.log('   Longitud:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length, 'caracteres');
  
  try {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    console.log('✅ JSON válido');
    console.log('   Project ID:', parsed.project_id || '❌ FALTA');
    console.log('   Client Email:', parsed.client_email || '❌ FALTA');
    console.log('   Private Key:', parsed.private_key ? '✅ Presente' : '❌ FALTA');
  } catch (error) {
    console.log('❌ JSON inválido:', error.message);
  }
} else if (hasIndividualVars) {
  console.log('✅ Variables individuales encontradas:');
  console.log('   FIREBASE_ADMIN_PROJECT_ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
  console.log('   FIREBASE_ADMIN_CLIENT_EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  console.log('   FIREBASE_ADMIN_PRIVATE_KEY:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? '✅ Presente' : '❌ FALTA');
  
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    console.log('\n   📊 Análisis de PRIVATE_KEY:');
    console.log('   - Longitud:', key.length, 'caracteres');
    console.log('   - Tiene BEGIN:', key.includes('BEGIN PRIVATE KEY') ? '✅' : '❌');
    console.log('   - Tiene END:', key.includes('END PRIVATE KEY') ? '✅' : '❌');
    console.log('   - Saltos de línea reales:', key.includes('\n') && !key.includes('\\n') ? '✅' : '❌');
    console.log('   - \\n literales:', key.includes('\\n') ? '✅ (para dev)' : '❌');
    
    // Detectar formato
    if (key.includes('\\n')) {
      console.log('   📝 Formato: Para desarrollo local (.env.local)');
    } else if (key.includes('\n')) {
      console.log('   📝 Formato: Para producción (Vercel)');
    }
  }
} else {
  console.log('❌ No se encontraron credenciales de Firebase Admin');
  console.log('\n💡 Configura una de estas opciones:');
  console.log('   Opción A: FIREBASE_SERVICE_ACCOUNT_KEY (JSON completo)');
  console.log('   Opción B: FIREBASE_ADMIN_PROJECT_ID + CLIENT_EMAIL + PRIVATE_KEY');
  process.exit(1);
}

// 2. Intentar cargar Firebase Admin
console.log('\n📋 Paso 2: Intentando inicializar Firebase Admin');
console.log('-------------------------------------------');

try {
  const admin = require('firebase-admin');
  const cert = admin.credential.cert;

  // Función para procesar la clave privada
  function processPrivateKey(key) {
    let processedKey = key;
    processedKey = processedKey.replace(/^["']|["']$/g, '');
    processedKey = processedKey.replace(/\\n/g, '\n');
    
    if (!processedKey.includes('BEGIN PRIVATE KEY') || !processedKey.includes('END PRIVATE KEY')) {
      throw new Error('Formato de clave privada inválido');
    }
    
    return processedKey.trim();
  }

  let credentials;
  
  if (hasServiceAccountKey) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    credentials = {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: processPrivateKey(serviceAccount.private_key),
    };
  } else {
    credentials = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: processPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    };
  }

  // Inicializar Firebase Admin
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: cert(credentials),
    });
  }

  console.log('✅ Firebase Admin inicializado correctamente');
  console.log('   Project ID:', credentials.projectId);
  console.log('   Client Email:', credentials.clientEmail);

  // 3. Probar funcionalidad básica
  console.log('\n📋 Paso 3: Probando funcionalidad básica');
  console.log('-------------------------------------------');
  
  const auth = admin.auth();
  console.log('✅ Auth SDK cargado correctamente');
  
  // Intentar listar usuarios (solo los primeros 1)
  auth.listUsers(1)
    .then((listUsersResult) => {
      console.log('✅ Conexión con Firebase Auth exitosa');
      console.log('   Usuarios encontrados:', listUsersResult.users.length);
      console.log('\n🎉 ¡TODO ESTÁ CORRECTO!');
      console.log('   Firebase Admin está listo para usarse en producción.\n');
      process.exit(0);
    })
    .catch((error) => {
      console.log('❌ Error al conectar con Firebase Auth:', error.message);
      console.log('\n💡 Verifica:');
      console.log('   - Las credenciales son correctas');
      console.log('   - Tienes permisos en Firebase Console');
      console.log('   - El proyecto existe y está activo\n');
      process.exit(1);
    });

} catch (error) {
  console.log('❌ Error al inicializar:', error.message);
  console.log('\n💡 Revisa FIREBASE_ADMIN_PRODUCCION.md para más información\n');
  process.exit(1);
}
