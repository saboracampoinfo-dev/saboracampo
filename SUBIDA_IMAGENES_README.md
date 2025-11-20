# 📸 Subida de Imágenes para Productos

## Resumen

El sistema ahora permite subir imágenes de productos directamente desde la interfaz de administración usando Cloudinary.

## Uso en ProductsManager

### Crear/Editar Producto

1. Abre el modal de crear/editar producto
2. En la sección de imágenes verás:
   - **Componente UploadImage**: Botón para subir imágenes desde tu dispositivo
   - **Vista previa**: Las imágenes subidas se muestran con opción de eliminar
   - **Input manual**: Opción alternativa de ingresar URLs manualmente

### Proceso de Subida

1. Click en "Seleccionar imagen" o "Upload Image"
2. Selecciona una imagen desde tu computadora
3. La imagen se sube automáticamente a Cloudinary
4. Se muestra en la vista previa
5. Al guardar el producto, las URLs se incluyen automáticamente

### Características

- ✅ Subida directa a Cloudinary
- ✅ Validación de formato (JPG, PNG, WEBP, HEIC)
- ✅ Vista previa instantánea
- ✅ Múltiples imágenes por producto
- ✅ Eliminar imágenes antes de guardar
- ✅ Alternativa: Ingresar URLs manualmente

## Integración Técnica

### Componente UploadImage

Ya existe en: `src/components/admin/UploadImage.jsx`

Props requeridas:
- `imagenes`: Array de URLs actuales
- `updateImages`: Función para actualizar el array
- `handleRemoveImage`: Función para eliminar una imagen

### Uso en otros componentes

```tsx
import UploadImage from '@/components/admin/UploadImage';

// Estado
const [uploadedImages, setUploadedImages] = useState<string[]>([]);

// Función de eliminación
const handleRemoveImage = (url: string) => {
  setUploadedImages(prev => prev.filter(img => img !== url));
};

// Render
<UploadImage 
  imagenes={uploadedImages}
  updateImages={setUploadedImages}
  handleRemoveImage={handleRemoveImage}
/>
```

## API de Cloudinary

### Endpoint: POST /api/uploadImage

Ya configurado en: `src/app/api/uploadImage/route.js`

### Variables de Entorno Requeridas

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Consulta `CLOUDINARY_SETUP.md` para más detalles sobre la configuración.

## Tips

1. **Optimización**: Las imágenes se optimizan automáticamente en Cloudinary
2. **Formato**: Preferible usar imágenes cuadradas (1:1) para mejor visualización
3. **Tamaño**: Máximo recomendado 5MB por imagen
4. **Orden**: La primera imagen se usa como imagen principal del producto

## Troubleshooting

### Error al subir imagen
- Verifica las credenciales de Cloudinary en `.env.local`
- Revisa el formato de la imagen (debe ser JPG, PNG, WEBP o HEIC)
- Verifica el tamaño del archivo (máximo 10MB)

### Imagen no se muestra
- Verifica que la URL de Cloudinary sea válida
- Revisa la consola del navegador para errores
- Asegúrate de que el producto se guardó correctamente

### Componente no carga
- Verifica que UploadImage.jsx esté en la ruta correcta
- Revisa las dependencias (heic2any, sweetalert2, react-toastify)
- Comprueba la importación en ProductsManager.tsx
