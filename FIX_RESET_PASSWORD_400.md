# 🔧 Solución Rápida: Error 400 en Reset Password

## ❌ Error

```
POST https://saboracampo.vercel.app/api/auth/reset-password 400 (Bad Request)
Error: Este usuario no puede restablecer la contraseña. Contacta al administrador.
```

## 🔍 Causa

El usuario no tiene `firebaseUid` en MongoDB, lo que significa que:
- Fue creado antes de la integración con Firebase
- No se sincronizó correctamente con Firebase Authentication
- Existe en MongoDB pero no en Firebase

## ✅ Solución Inmediata

### Opción 1: Sincronizar Todos los Usuarios (Recomendado)

```bash
node scripts/sync-users-to-firebase.js
```

Este script automáticamente:
1. ✅ Busca todos los usuarios sin `firebaseUid`
2. ✅ Verifica si existen en Firebase
3. ✅ Si existen: actualiza MongoDB con el UID
4. ✅ Si no existen: los crea en Firebase con contraseña temporal
5. ✅ Actualiza MongoDB con el nuevo UID

**Resultado:** Todos los usuarios podrán usar "Olvidé mi contraseña"

### Opción 2: Sincronizar Usuario Específico

```bash
node scripts/verify-user-sync.js
```

1. Ingresa el email del usuario
2. El script te mostrará si existe en MongoDB y Firebase
3. Te dará opción de actualizar contraseña si está sincronizado

## 🎯 Para Usuarios Afectados

Si eres un usuario que ve este error:

1. **Espera a que el admin sincronice los usuarios** (Opción 1)
2. **O contacta al admin** con tu email para que te sincronice manualmente

Después de la sincronización:
- Podrás usar "Olvidé mi contraseña" normalmente
- Recibirás un email de Firebase
- Podrás establecer tu nueva contraseña

## 🔒 Prevención

Para evitar este problema en el futuro:

### Al crear usuarios nuevos desde el admin panel:

El código ya está actualizado para:
- ✅ Crear usuario en Firebase primero
- ✅ Guardar el `firebaseUid` en MongoDB
- ✅ Validar la sincronización

### Al importar usuarios:

Si importas usuarios desde CSV u otra fuente:
1. Créalos usando la API `/api/users` (POST)
2. O ejecuta `sync-users-to-firebase.js` después de importar

## 📊 Verificar Estado

Para ver cuántos usuarios necesitan sincronización:

```bash
node scripts/sync-users-to-firebase.js
```

El script mostrará:
```
📊 Encontrados X usuarios sin firebaseUid

📊 RESUMEN:
✅ Usuarios sincronizados (ya existían): X
➕ Usuarios creados en Firebase: X
❌ Errores: X
```

## 🚀 Despliegue a Producción

Después de sincronizar en local, despliega los cambios:

```bash
git add .
git commit -m "Fix: Permitir reset de contraseña para usuarios sin firebaseUid"
git push
```

Vercel desplegará automáticamente con los cambios.

## 📝 Notas Importantes

- ✅ El backend ya NO rechaza usuarios sin `firebaseUid`
- ✅ Firebase intenta enviar el email de todas formas
- ✅ Si el usuario existe en Firebase, funcionará
- ⚠️ Si no existe en Firebase, mostrará error más claro
- 🔧 El script de sincronización es la solución definitiva

## 🆘 Si Persiste el Error

1. Ejecuta: `node scripts/verify-user-sync.js`
2. Ingresa el email del usuario
3. Comparte el output completo
4. Verifica que Firebase Admin esté configurado correctamente

---

**Última actualización:** 25 de noviembre de 2025
