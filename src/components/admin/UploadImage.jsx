'use client'
import React, { useState } from "react";
import { Button, styled } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import heic2any from "heic2any";
import Swal from 'sweetalert2';
import processImage from "../../utils/proccesImage";

export default function UploadImage({ imagenes, updateImages, handleRemoveImage }) {
// Inicializar el estado con URLs y archivos
  const [archivos, setArchivos] = useState(
    imagenes
      .filter(Boolean) // Filtrar elementos vacíos
      .map((img) => ({
        name:  typeof img ==='string' && img.split('/').pop(), // Extraer el nombre del archivo desde la URL
        preview: img,
        isURL: true,
      }))
  );
  
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });
  
  // Verificar si la imagen tiene una relación de aspecto 1:1
  const isAspectRatioOneToOne = (image) => {
    const img2 = processImage(image)
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const isOneToOne = img.width === img.height;
        resolve(isOneToOne);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(image);
    });
  };

  // Manejar la selección de archivos
  const handleArchivoSeleccionado = async (e) => {
    const nuevosArchivos = [...archivos];
    const archivito = await processImage(e.target.files)
    console.log('archivito:', archivito);
    
    const filesToUpload = archivito;

    
    // Verificar que no se superen los 4 archivos
    if (archivos.length + filesToUpload.length > 4) {
      toast.error("Solo se pueden cargar hasta 4 fotos.");
      return;
    }
    Swal.fire({
      title: 'Cargando...',
      text: 'Subiendo imagen(es), por favor espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    for (let i = 0; i < filesToUpload.length; i++) {
      let archivo = filesToUpload[i];
  
      // Verificar si el archivo es una imagen
      if (!archivo.type.startsWith('image/')) {
        toast.error("Solo se pueden cargar archivos de imagen.");
        continue;
      }
      // convertir archivs a webp y recortar para terner una relacion 1:1
      // Convertir HEIC a JPEG si es necesario
      const isHEIC = archivo.type === 'image/heic' || archivo.type === 'image/heif' || archivo.name.endsWith('.heic') || archivo.name.endsWith('.heif');
      if (isHEIC) {
        try {
          const convertedBlob = await heic2any({ blob: archivo, toType: "image/jpeg" });
          archivo = new File([convertedBlob], archivo.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
        } catch (error) {
          console.error("Error al convertir HEIC a JPEG:", error);
          toast.error("Error al convertir archivo HEIC.");
          continue;
        }
      }
  
      // Verificar que el archivo no esté ya en la lista
      const existe = archivos.some((a) => a.name === archivo.name);
      if (!existe) {
        // Verificar relación de aspecto 1:1
        const isOneToOne = await isAspectRatioOneToOne(archivo);
        if (isOneToOne) {
          archivo.preview = URL.createObjectURL(archivo);
          const res =await submitUpdateImage(archivo)
          nuevosArchivos.push(res);
        } else {
          toast.error("La imagen debe tener una relación de aspecto 1:1.");
        }
      }
    }
  
    setArchivos(nuevosArchivos);
    updateImages(nuevosArchivos.map(archivo => archivo));

    Swal.close();
  };

  // Manejar la eliminación de archivos
  const handleEliminarArchivo = async (index) => {
    const [imgPrevAEliminar] = archivos.filter((_, i) => i === index)[0].name.split('.');
    const imgAEliminar = `Products/${imgPrevAEliminar}`;

    Swal.fire({
      title: 'Eliminando...',
      text: 'Eliminando imagen, por favor espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const res = await fetch('api/deleteImage', {
        method: 'DELETE',
        body: JSON.stringify({ file: imgAEliminar }) // Correctly pass the image to be deleted
    });

    const data = await res.json();
    
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    const archivoAEliminar = archivos[index];
    if (!archivoAEliminar.isURL && archivoAEliminar.preview) {
      URL.revokeObjectURL(archivoAEliminar.preview);
    }
    handleRemoveImage(index);

    setArchivos(nuevosArchivos);
    updateImages(nuevosArchivos.map(archivo => archivo));

    Swal.close();
  };

  // Manejar la visualización de archivos
  const handleVerArchivo = (archivo) => {
    if (archivo.preview) {
      window.open(archivo.preview);
    } else {
      window.open(URL.createObjectURL(archivo));
    }
  };


  const submitUpdateImage = async(file) => {
    const formData = new FormData()
    formData.append('file', file);

     const res = await fetch ( 'api/uploadImage', {
       method:'POST',
       body: formData
     })
      const data = await res.json()
      
      // Mantener retrocompatibilidad con la respuesta
      if (data.success && !data.preview) {
        return {
          ...data,
          preview: data.url,
          isURL: true,
          name: data.name || file.name
        }
      }
      
      return data
    }
  

  return (
    <div>
      <ToastContainer
        className="toast-container"
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex mt-4">
        <Button
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
          title="Subir imágenes de producto"
          aria-label="Subir imágenes de producto"
        >
          Subir Archivo
          <VisuallyHiddenInput type="file" multiple onChange={handleArchivoSeleccionado} aria-label="Seleccionar archivos de imagen" />
        </Button>
      </div>

      {archivos.length !== 0 && (
        <div className="relative pb-12 bg-white mt-4 rounded-md ">
          <div className="grid grid-cols-4 gap-4">
            {archivos.map((archivo, index) => (
              <div key={index} className="relative shadow-md rounded-lg">
                {/* Vista previa de la imagen */}
                <img
                  src={archivo.preview || URL.createObjectURL(archivo)}
                  alt={archivo.name || 'Preview de imagen'}
                  className="w-full object-cover cursor-pointer h-36 max-w-full rounded-lg"
                  onClick={() => handleVerArchivo(archivo)}
                  loading='lazy'
                  title={archivo.name || 'Preview de imagen'}
                  aria-label={archivo.name || 'Preview de imagen'}
                />

                 <Button
                    type="button"
                    aria-label="eliminar archivo"
                    onClick={() => handleEliminarArchivo(index)}
                    aria-controls="drawer-navigation"
                    className="absolute top-1 right-1 cursor-pointer bg-gray-300 text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg text-sm w-6 h-6  inline-flex items-center justify-center "
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                  </Button>

              </div>
            ))}
          </div>
         
        </div>
      )}
    </div>
  );
}
