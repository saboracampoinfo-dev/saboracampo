const processImages = (imageFiles) => {
    console.log('Ajustando fotos para subir en processImages');
    
    // Crear una lista de promesas para procesar cada archivo individualmente
    const processingPromises = Array.from(imageFiles).map((imageFile) => {
      return new Promise((resolve, reject) => {
        // Verificar que imageFile sea un Blob o File
        if (!(imageFile instanceof Blob || imageFile instanceof File)) {
          reject(new TypeError('El argumento no es un archivo de imagen válido.'));
          return;
        }
  
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src); // Liberar URL temporal
  
          // Crear un canvas para redimensionar y recortar
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          // Definir el tamaño de la imagen final (400x400 en este caso)
          const targetSize = 400;
          canvas.width = targetSize;
          canvas.height = targetSize;
  
          // Calcular el recorte para obtener una relación 1:1
          const side = Math.min(img.width, img.height);
          const offsetX = (img.width - side) / 2;
          const offsetY = (img.height - side) / 2;
  
          // Dibujar y redimensionar la imagen en el canvas
          ctx.drawImage(img, offsetX, offsetY, side, side, 0, 0, targetSize, targetSize);
  
          // Convertir el canvas a formato WebP
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Crear un archivo WebP para la imagen procesada
                const imgRetocada = new File([blob], 'image.webp', { type: 'image/webp' });
                resolve(imgRetocada);
              } else {
                reject(new Error('Error al procesar la imagen'));
              }
            },
            'image/webp',
            0.8 // Ajusta la calidad según lo necesario (0.8 es buena para balancear tamaño y calidad)
          );
        };
  
        img.onerror = reject;
        img.src = URL.createObjectURL(imageFile);
      });
    });
  
    // Esperar a que todas las imágenes se procesen y devolver la lista de imágenes procesadas
    return Promise.all(processingPromises);
  };
  
  export default processImages;
  