# Configuración de Cloudinary para Subida de Imágenes

## Variables de Entorno Necesarias

Asegúrate de tener estas variables en tu archivo `.env.local`:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drb1kqoyo
CLOUDINARY_API_KEY=367574758226883
CLOUDINARY_API_SECRET=FkN_xcO--ZAcYac3aofoPK7PdBY
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sucursales_preset
```

## Crear Upload Preset en Cloudinary

Para permitir subidas desde el cliente (browser), necesitas crear un **Upload Preset** en Cloudinary:

### Pasos:

1. **Accede a tu cuenta de Cloudinary**: https://cloudinary.com/console

2. **Ve a Settings (Configuración)**:
   - Click en el ícono de engranaje en la parte superior derecha

3. **Upload Presets**:
   - En el menú lateral, click en **Upload**
   - Luego click en **Upload presets**

4. **Crear nuevo preset**:
   - Click en **Add upload preset**
   - Configura los siguientes valores:
     - **Upload preset name**: `sucursales_preset` (o el nombre que prefieras)
     - **Signing mode**: **Unsigned** (importante para subidas desde el cliente)
     - **Folder**: `sucursales` (opcional, para organizar las imágenes)
     - **Access mode**: **Public**
     - **Unique filename**: ✅ Activado (recomendado)
     - **Overwrite**: ❌ Desactivado (recomendado)
     - **Format**: Dejar en Auto
     - **Resource type**: Image
     - **Max file size**: 5 MB (o el tamaño que prefieras)

5. **Guardar**:
   - Click en **Save**

6. **Actualizar .env.local**:
   - Agrega la variable:
     ```bash
     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sucursales_preset
     ```

## Estructura de Carpetas en Cloudinary

Las imágenes se organizarán automáticamente en:
```
cloudinary/
└── sucursales/
    ├── imagen1.jpg
    ├── imagen2.jpg
    └── ...
```

## Funcionalidad Implementada

### En SucursalesManager:

1. **Subir imagen desde archivo**:
   - Input de tipo `file` que acepta imágenes
   - Validación de tipo de archivo (solo imágenes)
   - Validación de tamaño (máximo 5MB)
   - Preview local antes de subir
   - Subida automática a Cloudinary
   - Feedback visual con loading state

2. **Ingresar URL manualmente**:
   - Input de texto para pegar URL directamente
   - Útil si ya tienes la imagen subida

3. **Preview de la imagen**:
   - Muestra la imagen seleccionada o subida
   - Botón para eliminar y cambiar la imagen

4. **Galería de imágenes**:
   - Campo de texto para agregar múltiples URLs separadas por coma
   - Se puede usar para imágenes adicionales de la sucursal

## Uso

1. Abre el panel de administración
2. Ve a **Gestión de Sucursales**
3. Click en **Nueva Sucursal** o **Editar** una existente
4. En la sección **Imagen de Portada**:
   - **Opción A**: Click en **Subir imagen** y selecciona un archivo
   - **Opción B**: Pega la URL en el campo de texto

## Seguridad

- Las subidas se realizan a través del preset configurado (unsigned)
- Las imágenes se almacenan en tu cuenta de Cloudinary
- El API secret no se expone al cliente
- Solo se pueden subir imágenes (validación de tipo)
- Límite de tamaño configurado (5MB por defecto)

## Eliminación de Imágenes

Para eliminar imágenes de Cloudinary, utiliza el endpoint:
```
POST /api/cloudinary/delete
Body: { "publicId": "sucursales/imagen_id" }
```

Esto requiere autenticación del lado del servidor.

## Troubleshooting

### Error: "Upload preset not found"
- Verifica que el preset esté creado en Cloudinary
- Asegúrate de que el nombre coincida exactamente
- Verifica que `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` esté configurado

### Error: "Invalid cloud name"
- Verifica que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` esté correctamente configurado
- Revisa que no tenga espacios o caracteres especiales

### Error: "File too large"
- Reduce el tamaño de la imagen antes de subirla
- Modifica el límite en el preset de Cloudinary

### La imagen no se muestra
- Verifica la URL generada
- Asegúrate de que la imagen sea pública
- Revisa la consola del navegador para errores de CORS

## Próximos Pasos

- [ ] Implementar subida múltiple para la galería
- [ ] Agregar recorte de imagen (cropping)
- [ ] Optimización automática de imágenes
- [ ] Generar thumbnails automáticamente
- [ ] Implementar eliminación de imágenes antiguas
