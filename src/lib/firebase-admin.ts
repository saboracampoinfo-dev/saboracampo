// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Normaliza la private_key del JSON de service account.
 */
function processPrivateKey(key: string): string {
  if (!key) {
    throw new Error('❌ Private key is empty');
  }

  let processedKey = key;

  // 1. Remover comillas externas si existen
  processedKey = processedKey.replace(/^["']|["']$/g, '');

  // 2. Reemplazar \n literales con saltos de línea reales
  processedKey = processedKey.replace(/\\n/g, '\n');

  // 3. Si la clave viene en una sola línea sin saltos, intentar decodificar Base64
  if (!processedKey.includes('\n') && processedKey.length > 100) {
    try {
      processedKey = Buffer.from(processedKey, 'base64').toString('utf-8');
    } catch {
      // No es base64, seguir como está
    }
  }

  // 4. Validar formato básico de la clave
  if (
    !processedKey.includes('BEGIN PRIVATE KEY') ||
    !processedKey.includes('END PRIVATE KEY')
  ) {
    throw new Error(
      '❌ Private key format is invalid. Must contain BEGIN and END markers.'
    );
  }

  // 5. Limpiar espacios extras
  processedKey = processedKey.trim();

  return processedKey;
}

/**
 * Carga credenciales desde FIREBASE_SERVICE_ACCOUNT_KEY (JSON completo).
 */
function getFirebaseCredentials(): ServiceAccount | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // Durante build time o sin env configurado, retornar null
  if (!rawJson || rawJson.trim() === '' || rawJson === '{}') {
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY no configurado en producción');
    }
    return null;
  }

  try {
    const serviceAccount = JSON.parse(rawJson);

    if (
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      throw new Error('❌ Service account JSON incompleto');
    }

    console.log('✅ Usando FIREBASE_SERVICE_ACCOUNT_KEY (JSON completo)');

    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: processPrivateKey(serviceAccount.private_key),
    } as ServiceAccount;
  } catch (error: any) {
    console.error('❌ Error parseando FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
    // Durante build, no lanzar error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('⚠️ Continuando build sin Firebase Admin configurado');
      return null;
    }
    throw new Error('❌ FIREBASE_SERVICE_ACCOUNT_KEY tiene formato JSON inválido');
  }
}

export function initAdmin() {
  if (getApps().length === 0) {
    try {
      const credentials = getFirebaseCredentials();
      if (!credentials) {
        console.warn('⚠️ Firebase Admin no inicializado - credenciales no disponibles');
        return;
      }
      
      initializeApp({
        credential: cert(credentials),
      });
      console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error: any) {
      console.error('❌ Error al inicializar Firebase Admin:', error.message);
      throw error;
    }
  }
}

export const adminAuth = () => {
  initAdmin();
  const apps = getApps();
  if (apps.length === 0) {
    throw new Error('Firebase Admin no está inicializado');
  }
  return getAuth();
};

export const adminDb = () => {
  initAdmin();
  const apps = getApps();
  if (apps.length === 0) {
    throw new Error('Firebase Admin no está inicializado');
  }
  return getFirestore();
};

// Intentar inicializar al cargar (solo si hay credenciales)
if (typeof window === 'undefined') {
  try {
    initAdmin();
  } catch (error) {
    console.warn('⚠️ Firebase Admin no se pudo inicializar automáticamente');
  }
}
