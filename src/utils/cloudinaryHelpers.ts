// Example of uploading an image to Cloudinary
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // Configure in Cloudinary

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

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
