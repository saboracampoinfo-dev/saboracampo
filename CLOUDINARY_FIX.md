# 🔧 Solución: No puedo subir imágenes a Cloudinary

## ❌ Problema Detectado

Tu archivo `.env.local` tiene configurado `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` pero **falta** la variable `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

## ✅ Solución Rápida

### Paso 1: Crear Upload Preset en Cloudinary

1. Ve a https://cloudinary.com/console
2. Click en **Settings** (⚙️ arriba a la derecha)
3. En el menú lateral: **Upload** → **Upload presets**
4. Click en **Add upload preset**
5. Configura:
   - **Upload preset name**: `sucursales_preset`
   - **Signing mode**: **Unsigned** ⚠️ (MUY IMPORTANTE)
   - **Folder**: `sucursales`
   - **Access mode**: Public
   - **Unique filename**: ✅ Activado
6. Click en **Save**

### Paso 2: Agregar Variable de Entorno

Abre tu archivo `.env.local` y agrega esta línea:

```bash
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sucursales_preset
```

Tu sección de Cloudinary debe quedar así:

```bash
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drb1kqoyo
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sucursales_preset
CLOUDINARY_API_KEY=367574758226883
CLOUDINARY_API_SECRET=FkN_xcO--ZAcYac3aofoPK7PdBY
```

### Paso 3: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

## 🔍 Verificación

Después de reiniciar, abre la consola del navegador (F12) y verás logs como:

```
📤 Subiendo imagen a Cloudinary...
☁️ Cloud Name: drb1kqoyo
📁 Upload Preset: sucursales_preset
📄 Archivo: imagen.jpg (0.5 MB)
✅ Imagen subida exitosamente: https://res.cloudinary.com/...
```

## ⚠️ Errores Comunes

### "Upload preset not found"
- ✅ Verifica que el preset se llame exactamente `sucursales_preset`
- ✅ Asegúrate de haberlo guardado en Cloudinary

### "Invalid signature" o "Signature required"
- ✅ El preset DEBE estar en modo **Unsigned**
- ✅ Si está en "Signed", cámbialo a "Unsigned" y guarda

### "La imagen no se sube"
- ✅ Reinicia el servidor de Next.js
- ✅ Recarga completamente la página (Ctrl+Shift+R)
- ✅ Abre la consola del navegador para ver errores específicos

## 📖 Más Información

Lee `CLOUDINARY_SETUP.md` para documentación completa sobre:
- Configuración detallada
- Seguridad
- Troubleshooting avanzado
- Funcionalidades adicionales

## 🎯 Próximos Pasos

Una vez configurado, podrás:
- ✅ Subir imágenes desde archivos locales
- ✅ Ver preview antes de guardar
- ✅ Validación automática de tamaño y tipo
- ✅ URLs públicas para tus sucursales
