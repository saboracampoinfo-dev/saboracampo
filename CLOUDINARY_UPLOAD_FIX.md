# Fix Error 500 en /api/uploadImage

## Problema
Error al subir imágenes de perfil: `POST /api/uploadImage 500 (Internal Server Error)`

## Causa
1. Faltaba la variable de entorno `CLOUDINARY_CLOUD_NAME` (sin prefijo NEXT_PUBLIC_)
2. El endpoint no manejaba errores correctamente
3. La respuesta del API no era consistente con lo que esperaban los componentes

## Soluciones Aplicadas

### 1. Variables de Entorno (.env.local)
Se agregó la variable faltante:

```env
CLOUDINARY_CLOUD_NAME=drb1kqoyo
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drb1kqoyo
CLOUDINARY_API_KEY=367574758226883
CLOUDINARY_API_SECRET=FkN_xcO--ZAcYac3aofoPK7PdBY
CLOUDINARY_URL=cloudinary://367574758226883:FkN_xcO--ZAcYac3aofoPK7PdBY@drb1kqoyo
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sucursales_preset
```

### 2. Endpoint Actualizado (src/app/api/uploadImage/route.js)
- ✅ Agregado `try-catch` para manejo de errores
- ✅ Respuesta consistente con `success`, `url`, `error`
- ✅ Mantiene retrocompatibilidad con `preview`, `name`, `isURL`
- ✅ Logs de error para debugging

### 3. Componente UploadImage.jsx
- ✅ Actualizado para manejar la nueva respuesta del API
- ✅ Mantiene retrocompatibilidad con código existente

## Configuración en Vercel

**IMPORTANTE**: Debes agregar estas variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```
CLOUDINARY_CLOUD_NAME=drb1kqoyo
CLOUDINARY_API_KEY=367574758226883
CLOUDINARY_API_SECRET=FkN_xcO--ZAcYac3aofoPK7PdBY
```

4. Redeploy tu aplicación para que tome las nuevas variables

## Verificación Local

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Prueba subir una imagen en cualquiera de los componentes:
   - MisDatosVendedor
   - MisDatosCajero
   - ProfileEditor (Cliente)
   - MisDatosAdmin

## Componentes Afectados

Todos estos componentes ahora pueden subir fotos de perfil:

- ✅ `src/components/vendedor/MisDatosVendedor.tsx`
- ✅ `src/components/cajero/MisDatosCajero.tsx`
- ✅ `src/components/ProfileEditor.tsx` (Cliente)
- ✅ `src/components/admin/MisDatosAdmin.tsx`
- ✅ `src/components/admin/UploadImage.jsx` (Productos)

## Testing

Para verificar que todo funciona:

1. Inicia sesión con cada rol (admin, vendedor, cajero, cliente)
2. Ve a "Mis Datos"
3. Haz clic en "Cambiar Foto"
4. Selecciona una imagen
5. Verifica que se sube correctamente y se muestra la preview

## Troubleshooting

Si sigue sin funcionar:

1. **Verifica las credenciales de Cloudinary**:
   - Ingresa a tu cuenta de Cloudinary
   - Ve a Settings → Access Keys
   - Confirma que las credenciales sean correctas

2. **Revisa los logs del servidor**:
   ```bash
   npm run dev
   ```
   Y observa la consola cuando intentas subir una imagen

3. **Verifica la configuración en Vercel**:
   - Asegúrate de que las variables estén en "All Environments"
   - Haz un nuevo deploy después de agregar las variables

4. **Revisa la consola del navegador**:
   - Abre DevTools (F12)
   - Pestaña Console y Network
   - Intenta subir una imagen y revisa los errores

## Cambios en el Código

### Archivos Modificados:
1. `src/app/api/uploadImage/route.js` - Mejorado manejo de errores y respuesta
2. `src/components/admin/UploadImage.jsx` - Compatibilidad con nueva respuesta
3. `.env.local` - Agregada variable CLOUDINARY_CLOUD_NAME

### Archivos que Usan el Endpoint:
- Todos los componentes MisDatos (Vendedor, Cajero, Admin)
- ProfileEditor (Cliente)
- UploadImage (Admin - Productos)
