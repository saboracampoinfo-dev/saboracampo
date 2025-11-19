// Upload an image to Cloudinary
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string } | null> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName) {
      console.error('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado en .env.local');
      return null;
    }

    if (!uploadPreset) {
      console.error('❌ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no está configurado en .env.local');
      console.error('📖 Revisa CLOUDINARY_SETUP.md para instrucciones de configuración');
      return null;
    }

    console.log('📤 Subiendo imagen a Cloudinary...');
    console.log('☁️ Cloud Name:', cloudName);
    console.log('📁 Upload Preset:', uploadPreset);
    console.log('📄 Archivo:', file.name, '(', (file.size / 1024 / 1024).toFixed(2), 'MB)');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'sucursales'); // Organizar en carpeta específica

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Cloudinary - Status:', response.status);
      console.error('📋 Detalles del error:', JSON.stringify(errorData, null, 2));
      console.error('🔍 Mensaje de error:', errorData.error?.message || errorData.message);
      console.error('💡 Posibles causas:');
      
      if (errorData.error?.message?.includes('Invalid upload preset')) {
        console.error('   ❌ El upload preset "' + uploadPreset + '" NO EXISTE en tu cuenta de Cloudinary');
        console.error('   ✅ Solución: Ve a Cloudinary → Settings → Upload → Upload presets');
        console.error('   ✅ Crea un preset llamado "' + uploadPreset + '" en modo "Unsigned"');
      } else if (errorData.error?.message?.includes('Upload preset must allow unsigned uploading')) {
        console.error('   ❌ El upload preset existe pero está en modo "Signed"');
        console.error('   ✅ Solución: Cambia el preset a modo "Unsigned"');
      } else {
        console.error('   - Upload preset no existe o está mal escrito');
        console.error('   - Upload preset no está configurado como "unsigned"');
        console.error('   - Cloud name incorrecto');
      }
      
      return null;
    }

    const data = await response.json();
    console.log('✅ Imagen subida exitosamente:', data.secure_url);
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    return null;
  }
}

// Example of deleting an image from Cloudinary (server-side)
export async function deleteFromCloudinary(publicId: string) {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
