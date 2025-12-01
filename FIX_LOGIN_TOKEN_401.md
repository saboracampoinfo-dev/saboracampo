# 🔐 Fix: Error de Token Firebase 401 en Login

## 📋 Problema Identificado

Error al iniciar sesión:
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Login error: Error: Token de Firebase inválido o expirado
```

## 🔍 Causa Raíz

El error ocurre cuando:

1. **Token expira durante la solicitud**: El token de Firebase tiene una vida útil limitada y puede expirar entre la generación y la verificación
2. **Firebase Admin no inicializado correctamente**: El SDK de Firebase Admin puede no estar configurado correctamente
3. **Tiempo del sistema desincronizado**: Diferencia de tiempo entre cliente y servidor
4. **Token no se refresca correctamente**: Se usa un token en caché en lugar de uno nuevo

## ✅ Soluciones Implementadas

### 1. **Forzar Refresh del Token (Login Frontend)**

**Archivo**: `src/app/login/page.tsx`

**Cambio**: Agregar `true` como parámetro a `getIdToken()` para forzar refresh

```typescript
// ❌ ANTES (puede usar token en caché que esté expirado)
const idToken = await userCredential.user.getIdToken();

// ✅ DESPUÉS (siempre obtiene un token nuevo y válido)
const idToken = await userCredential.user.getIdToken(true);
```

**Beneficio**: Garantiza que siempre se envía un token fresco al backend, eliminando errores de expiración.

---

### 2. **Mejorar Logging y Debugging (Login Frontend)**

**Archivo**: `src/app/login/page.tsx`

**Cambios**:
```typescript
// Agregar log cuando se obtiene el token
console.log('🔑 Token obtenido, enviando al backend...');

// Agregar logs detallados de errores del backend
console.error('❌ Error del backend:', {
  status: response.status,
  error: data.error,
  code: data.code,
});

// Log de éxito
console.log('✅ Login exitoso, usuario:', data.data.email);
```

**Beneficio**: Facilita el debugging y permite identificar exactamente dónde falla el proceso.

---

### 3. **Verificar Inicialización de Firebase Admin (Backend)**

**Archivo**: `src/app/api/auth/login/route.ts`

**Cambio**: Agregar verificación antes de procesar el token

```typescript
// Verificar que Firebase Admin esté inicializado
try {
  adminAuth();
} catch (adminError: any) {
  console.error('❌ Firebase Admin no inicializado:', adminError.message);
  return NextResponse.json(
    { success: false, error: 'Error de configuración del servidor. Contacte al administrador.' },
    { status: 500 }
  );
}
```

**Beneficio**: Detecta problemas de configuración tempranamente antes de intentar verificar tokens.

---

### 4. **Mensajes de Error Más Específicos (Backend)**

**Archivo**: `src/app/api/auth/login/route.ts`

**Cambio**: Agregar manejo detallado de códigos de error de Firebase

```typescript
try {
  console.log('🔐 Verificando token de Firebase...');
  decodedToken = await adminAuth().verifyIdToken(idToken);
  console.log('✅ Token verificado correctamente para:', decodedToken.email);
} catch (firebaseError: any) {
  console.error('❌ Error verifying Firebase token:', {
    code: firebaseError.code,
    message: firebaseError.message,
    tokenLength: idToken?.length || 0,
  });
  
  // Mensajes de error más específicos
  let errorMessage = 'Token de Firebase inválido o expirado';
  if (firebaseError.code === 'auth/id-token-expired') {
    errorMessage = 'El token de autenticación ha expirado. Por favor, intenta nuevamente.';
  } else if (firebaseError.code === 'auth/argument-error') {
    errorMessage = 'Token de autenticación inválido. Por favor, intenta nuevamente.';
  } else if (firebaseError.code === 'auth/invalid-id-token') {
    errorMessage = 'Token de autenticación inválido. Por favor, cierra sesión e intenta nuevamente.';
  }
  
  return NextResponse.json(
    { success: false, error: errorMessage, code: firebaseError.code },
    { status: 401 }
  );
}
```

**Beneficio**: Los usuarios reciben mensajes claros sobre qué salió mal y cómo solucionarlo.

---

### 5. **Script de Diagnóstico**

**Archivo**: `scripts/test-firebase-auth.js`

Script para verificar la configuración de Firebase Admin:

```bash
node scripts/test-firebase-auth.js
```

**Verifica**:
- ✅ Variables de entorno configuradas
- ✅ Firebase Admin se puede inicializar
- ✅ Credentials tienen el formato correcto
- ✅ Auth se puede obtener correctamente

---

## 🧪 Cómo Probar

### 1. **Reiniciar el Servidor de Desarrollo**

```bash
npm run dev
```

### 2. **Limpiar Caché del Navegador**

- Abrir DevTools (F12)
- Application/Storage → Clear storage
- O usar modo incógnito

### 3. **Intentar Login**

1. Ir a `/login`
2. Ingresar credenciales
3. Observar la consola del navegador para logs detallados
4. Observar la terminal del servidor para logs del backend

### 4. **Verificar Logs**

**Consola del navegador** debería mostrar:
```
🔑 Token obtenido, enviando al backend...
✅ Login exitoso, usuario: usuario@ejemplo.com
```

**Terminal del servidor** debería mostrar:
```
🔐 Verificando token de Firebase...
✅ Token verificado correctamente para: usuario@ejemplo.com
```

---

## 🚨 Si el Error Persiste

### 1. **Verificar Variables de Entorno**

Asegúrate de que `.env.local` tenga:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
# ... otras variables
```

### 2. **Ejecutar Script de Diagnóstico**

```bash
node scripts/test-firebase-auth.js
```

### 3. **Verificar Sincronización de Tiempo**

El servidor y cliente deben tener la hora sincronizada:

```bash
# Windows
w32tm /query /status

# Linux/Mac
date
```

### 4. **Revisar Logs Detallados**

Los nuevos logs te dirán exactamente qué código de error está devolviendo Firebase:

- `auth/id-token-expired` → Token expiró (debería resolverse con el refresh forzado)
- `auth/argument-error` → Token mal formado o vacío
- `auth/invalid-id-token` → Token inválido (revisar configuración de Firebase)

### 5. **Verificar Configuración de Firebase**

En Firebase Console:
1. Ir a Project Settings
2. Service Accounts
3. Verificar que las credenciales sean correctas
4. Generar nuevas credenciales si es necesario

---

## 📝 Archivos Modificados

- ✅ `src/app/login/page.tsx` - Forzar refresh de token + mejor logging
- ✅ `src/app/api/auth/login/route.ts` - Verificación de Admin + mensajes específicos
- ✅ `scripts/test-firebase-auth.js` - Script de diagnóstico (nuevo)

---

## 🔄 Próximos Pasos

1. **Probar el login** con las mejoras implementadas
2. **Revisar los logs** detallados en consola y terminal
3. **Ejecutar el script de diagnóstico** si el problema persiste
4. **Verificar variables de entorno** si Firebase Admin no se inicializa

---

## 💡 Prevención Futura

Para evitar este error en el futuro:

1. ✅ **Siempre usar `getIdToken(true)`** para login/signup
2. ✅ **Implementar refresh automático** de tokens en el frontend
3. ✅ **Monitorear logs** regularmente para detectar problemas temprano
4. ✅ **Mantener sincronizado** el tiempo del sistema
5. ✅ **Documentar errores** y sus soluciones

---

## 📚 Referencias

- [Firebase Admin SDK - Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Firebase Auth - Get User Token](https://firebase.google.com/docs/reference/js/auth.user#usergetidtoken)
- [Next.js API Routes Error Handling](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
