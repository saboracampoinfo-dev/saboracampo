// Upload an image to Cloudinary
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
    formData.append('folder', 'sucursales'); // Organizar en carpeta específica

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
      return null;
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload error:', errorData);
      return null;
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Upload error:', error);
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
