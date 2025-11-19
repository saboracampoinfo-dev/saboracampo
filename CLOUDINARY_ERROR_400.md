# 🔧 Diagnóstico: Error 400 al subir imagen

## ✅ Variables Configuradas

Todas las variables de entorno están configuradas correctamente en tu `.env.local`.

## ❌ Problema Identificado

El error **400 Bad Request** indica que:

### El upload preset NO existe en tu cuenta de Cloudinary o está mal configurado

## 🛠️ Solución PASO A PASO

### 1️⃣ Verifica el nombre del preset en .env.local

Abre tu `.env.local` y copia el valor exacto de:
```bash
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=_____
```

**Copia este valor exactamente como está** (puede ser `sucursales_preset` o cualquier otro nombre).

### 2️⃣ Ve a Cloudinary Dashboard

1. Abre: https://cloudinary.com/console
2. Inicia sesión en tu cuenta

### 3️⃣ Navega a Upload Presets

1. Click en **Settings** (⚙️ arriba a la derecha)
2. En el menú lateral izquierdo: **Upload**
3. Luego: **Upload presets**

### 4️⃣ Busca tu preset

**¿Existe un preset con el nombre que copiaste en el paso 1?**

#### ❌ NO EXISTE:

**Crear nuevo preset:**

1. Click en **Add upload preset**
2. En **Upload preset name**: pega el nombre exacto de tu `.env.local`
3. ⚠️ **MUY IMPORTANTE**: En **Signing Mode** selecciona **Unsigned**
4. Opcional pero recomendado:
   - **Folder**: `sucursales`
   - **Access mode**: `Public`
   - **Unique filename**: ✅ Activado
5. Click en **Save**

#### ✅ SÍ EXISTE:

**Verificar configuración:**

1. Click en el preset para editarlo
2. ⚠️ **Verifica**: **Signing Mode** debe ser **Unsigned**
3. Si está en "Signed":
   - Cambia a **Unsigned**
   - Click en **Save**

### 5️⃣ Reinicia el servidor

```bash
# Detén el servidor (Ctrl+C en la terminal)
# Luego reinicia:
npm run dev
```

### 6️⃣ Recarga la página

- Abre el dashboard de administración
- Recarga completamente (Ctrl+Shift+R)
- Intenta subir una imagen nuevamente

## 🔍 Verificación con la Consola

Después de configurar, abre la consola del navegador (F12) y verás logs como:

```
📤 Subiendo imagen a Cloudinary...
☁️ Cloud Name: drb1kqoyo
📁 Upload Preset: sucursales_preset  <-- Debe coincidir con Cloudinary
📄 Archivo: imagen.jpg (0.5 MB)
✅ Imagen subida exitosamente: https://res.cloudinary.com/...
```

## ⚠️ Errores Específicos

### "Invalid upload preset"
- ❌ El preset NO existe en tu cuenta
- ✅ Crea el preset con el nombre exacto

### "Upload preset must allow unsigned uploading"
- ❌ El preset existe pero está en modo "Signed"
- ✅ Edita el preset y cambia a "Unsigned"

### "Invalid signature"
- ❌ El preset requiere autenticación
- ✅ Debe estar en modo "Unsigned"

## 📸 Screenshots de Cloudinary

### Donde encontrar Upload Presets:
```
Cloudinary Console
└── Settings (⚙️)
    └── Upload (menú lateral)
        └── Upload presets
            └── [Lista de presets]
```

### Configuración correcta:
```
Upload preset name: sucursales_preset
Signing Mode: Unsigned ⚠️ IMPORTANTE
Folder: sucursales (opcional)
Access mode: Public
Unique filename: ✅
```

## 🎯 Checklist Final

Antes de intentar subir otra imagen, verifica:

- [ ] El preset existe en Cloudinary
- [ ] El nombre del preset coincide EXACTAMENTE con .env.local
- [ ] Signing Mode está en "Unsigned"
- [ ] El servidor de Next.js fue reiniciado
- [ ] La página fue recargada completamente

## 💡 Tip Adicional

Si sigues teniendo problemas, puedes usar temporalmente el preset por defecto de Cloudinary:

1. En Cloudinary, busca si existe un preset llamado `ml_default`
2. Si existe y está en "Unsigned", cambia tu `.env.local`:
   ```bash
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
   ```
3. Reinicia el servidor

## 📞 Más Ayuda

- **CLOUDINARY_SETUP.md**: Documentación completa
- **CLOUDINARY_FIX.md**: Guía de solución rápida
- **verify-cloudinary.sh**: Script de verificación

¡Una vez configurado correctamente, podrás subir imágenes sin problemas! 🚀
