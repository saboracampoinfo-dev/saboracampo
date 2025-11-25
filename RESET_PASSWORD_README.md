# 🔐 Funcionalidad de Restablecimiento de Contraseña

## 📋 Implementación

Se ha agregado la funcionalidad de "Olvidé mi contraseña" en la página de login.

## ✨ Características

### 1. **Modal de Restablecimiento**
- ✅ Botón "¿Olvidaste tu contraseña?" en la página de login
- ✅ Modal con formulario para ingresar el email
- ✅ Validación de email
- ✅ Mensajes de éxito y error

### 2. **Verificación en Backend**
- ✅ Endpoint `/api/auth/reset-password` (POST)
- ✅ Verifica si el usuario existe en MongoDB
- ✅ Verifica que el usuario tenga `firebaseUid`
- ✅ Validación de formato de email

### 3. **Envío de Email con Firebase**
- ✅ Usa Firebase Authentication para enviar el email
- ✅ Link de restablecimiento generado automáticamente
- ✅ Manejo de errores específicos de Firebase

## 🔧 Configuración Requerida

### 1. Configurar Email Templates en Firebase

Para personalizar el email que se envía, debes configurar las plantillas en Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `saboracampo`
3. Ve a **Authentication** → **Templates**
4. Busca **Password reset** (Restablecimiento de contraseña)
5. Personaliza el template:

```
Asunto: Restablece tu contraseña de Sabor a Campo

Cuerpo:
Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Sabor a Campo.

Haz clic en el siguiente enlace para crear una nueva contraseña:
%LINK%

Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.

Saludos,
Equipo de Sabor a Campo
```

### 2. Configurar Dominio Autorizado

Asegúrate de que tu dominio esté autorizado en Firebase:

1. En Firebase Console → **Authentication** → **Settings**
2. En **Authorized domains**, agrega:
   - `localhost` (para desarrollo)
   - `saboracampo.vercel.app` (tu dominio de producción)
   - Cualquier otro dominio que uses

### 3. Variables de Entorno

Verifica que `.env.local` tenga:

```env
# Firebase Client (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=saboracampo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=saboracampo
...

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=https://saboracampo.vercel.app/
```

## 🎯 Flujo de Usuario

### 1. Usuario olvida su contraseña

```
1. Va a /login
2. Click en "¿Olvidaste tu contraseña?"
3. Se abre modal
4. Ingresa su email
5. Click en "Enviar"
```

### 2. Sistema verifica y envía email

```
1. Backend verifica si existe el usuario en MongoDB
2. Verifica que tenga firebaseUid
3. Firebase envía email con link de restablecimiento
4. Muestra mensaje de éxito
```

### 3. Usuario recibe email y cambia contraseña

```
1. Usuario recibe email
2. Click en el link del email
3. Se abre página de Firebase: 
   https://saboracampo.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=...
4. Ingresa nueva contraseña
5. Firebase actualiza la contraseña
6. Redirige a la URL configurada (tu app)
```

## 🔗 Link de Restablecimiento

Firebase genera automáticamente un link con este formato:

```
https://[tu-proyecto].firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=[codigo-unico]&apiKey=[api-key]&lang=es
```

Parámetros:
- `mode=resetPassword` - Indica que es para restablecer contraseña
- `oobCode` - Código único de un solo uso
- `apiKey` - Tu API key de Firebase
- `lang` - Idioma del formulario (se puede configurar)

## 🎨 Personalizar Página de Restablecimiento

Firebase provee una página por defecto, pero puedes personalizarla:

### Opción 1: Usar la página de Firebase (Recomendado)
- ✅ Ya está implementada
- ✅ Maneja todos los casos de error
- ✅ Multiidioma
- ❌ Diseño genérico

### Opción 2: Crear tu propia página
Deberías crear una página en tu app (`/reset-password`) que:
1. Lea los parámetros `oobCode` de la URL
2. Muestre formulario para nueva contraseña
3. Use Firebase para confirmar el cambio

```typescript
// Ejemplo básico
import { confirmPasswordReset } from 'firebase/auth';

const handleConfirmReset = async (oobCode: string, newPassword: string) => {
  await confirmPasswordReset(auth, oobCode, newPassword);
};
```

## 🐛 Problemas Comunes

### Error: "Este usuario no puede restablecer la contraseña"

**Causa:** Usuario sin `firebaseUid` en MongoDB o no existe en Firebase

**Solución:**
```bash
# Sincronizar todos los usuarios de MongoDB a Firebase
node scripts/sync-users-to-firebase.js
```

Este script:
- ✅ Encuentra usuarios sin `firebaseUid` en MongoDB
- ✅ Verifica si existen en Firebase
- ✅ Si existen: sincroniza el UID
- ✅ Si no existen: los crea con contraseña temporal
- ✅ Usuario debe usar "Olvidé mi contraseña" para establecer su contraseña

### Email no llega

**Causas posibles:**
1. Usuario no existe en Firebase
2. Email en spam/correo no deseado
3. Dominio no autorizado en Firebase
4. Template de email no configurado

**Solución:**
```bash
# Verificar usuario
node scripts/verify-user-sync.js
# Ingresa el email y verifica que tenga firebaseUid
```

### Error: "auth/user-not-found"

**Causa:** Usuario no existe en Firebase Authentication

**Solución:**
```bash
# Opción 1: Sincronizar automáticamente
node scripts/sync-users-to-firebase.js

# Opción 2: Verificar manualmente
node scripts/verify-user-sync.js
```

### Error: "auth/invalid-email"

**Causa:** Formato de email inválido

**Solución:**
- Verificar que el email tenga formato válido
- La validación se hace en frontend y backend

### Error: "auth/too-many-requests"

**Causa:** Demasiados intentos de restablecimiento

**Solución:**
- Esperar unos minutos
- Firebase tiene rate limiting por seguridad

## 📱 Testing

### En Desarrollo (localhost)

1. Ir a `http://localhost:3000/login`
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar email de prueba
4. Revisar email

### En Producción

1. Ir a `https://saboracampo.vercel.app/login`
2. Mismo flujo que en desarrollo

## 🔒 Seguridad

### Medidas Implementadas

1. **No revelar si el usuario existe**
   - Mismo mensaje de éxito si existe o no
   - Previene enumeración de usuarios

2. **Validación de email**
   - En frontend (HTML5)
   - En backend (regex)
   - En Firebase

3. **Rate limiting**
   - Firebase limita intentos automáticamente
   - Previene ataques de fuerza bruta

4. **Links de un solo uso**
   - El `oobCode` expira después de usarse
   - Expira después de 1 hora (configurable en Firebase)

5. **Verificación en MongoDB**
   - Solo usuarios registrados pueden restablecer
   - Deben tener `firebaseUid`

## 📊 Logs y Monitoreo

### Logs en el servidor

```javascript
// Éxito
✅ Email de restablecimiento enviado a: usuario@ejemplo.com

// Usuario no encontrado
⚠️ Usuario no encontrado en MongoDB: usuario@ejemplo.com

// Usuario sin firebaseUid
❌ Usuario sin firebaseUid: usuario@ejemplo.com

// Error de Firebase
❌ Error al generar link de restablecimiento: [error]
```

### Logs en el navegador

```javascript
// Éxito
✅ Email de restablecimiento enviado a: usuario@ejemplo.com

// Error
❌ Reset password error: [error]
```

## 🚀 Deployment

### Vercel (Producción)

Asegúrate de configurar las variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega todas las variables de Firebase
4. Redeploy

### Variables críticas para reset password:

```env
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_BASE_URL
FIREBASE_SERVICE_ACCOUNT_KEY
```

## 📚 Archivos Modificados/Creados

- ✅ `src/app/login/page.tsx` - Agregado modal y lógica de reset
- ✅ `src/app/api/auth/reset-password/route.ts` - Endpoint de verificación
- ✅ `RESET_PASSWORD_README.md` - Esta documentación

## 🎓 Referencias

- [Firebase Password Reset](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email)
- [Firebase Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)
- [Firebase Action URLs](https://firebase.google.com/docs/auth/custom-email-handler#action_url)

---

**Última actualización:** 25 de noviembre de 2025
