/* eslint-disable react/prop-types */
'use client'
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";

const BotonWsp = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const response = await fetch('/api/configuracion');
        const data = await response.json();
        
        if (data.success && data.data.whatsapp) {
          setWhatsappConfig(data.data.whatsapp);
        }
      } catch (error) {
        console.error('Error al cargar configuración de WhatsApp:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarConfiguracion();
  }, []);

  const generarLink = (contacto, codigoPais, texto) =>
    `https://wa.me/${codigoPais}${contacto}?text=${encodeURIComponent(texto)}`;

  // No mostrar el botón si está cargando o no hay configuración
  if (loading || !whatsappConfig) {
    return null;
  }

  // Verificar si al menos un contacto está activo
  const administracionActivo = whatsappConfig.administracion?.activo && whatsappConfig.administracion?.numero;
  const ventasActivo = whatsappConfig.ventas?.activo && whatsappConfig.ventas?.numero;

  if (!administracionActivo && !ventasActivo) {
    return null;
  }

  return (
    <article
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="flex flex-col gap-2 mb-2 animate-fade-in">
          {administracionActivo && (
            <a
              href={generarLink(
                whatsappConfig.administracion.numero,
                whatsappConfig.administracion.codigoPais,
                whatsappConfig.administracion.textoPredefinido || 'Hola, me gustaría contactar con administración.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              title="Contactar Administración por WhatsApp"
              aria-label="Contactar Administración por WhatsApp"
            >
              <button className="bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-700 transition">
                📋 Administración
              </button>
            </a>
          )}
          
          {ventasActivo && (
            <a
              href={generarLink(
                whatsappConfig.ventas.numero,
                whatsappConfig.ventas.codigoPais,
                whatsappConfig.ventas.textoPredefinido || 'Hola, me interesa saber más sobre productos o servicios.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              title="Contactar Ventas por WhatsApp"
              aria-label="Contactar Ventas por WhatsApp"
            >
              <button className="bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-700 transition">
                💰 Ventas
              </button>
            </a>
          )}
        </div>
      )}

      <button
        className="flex items-center justify-center bg-green-500 text-white font-bold p-4 rounded-full shadow-lg hover:bg-green-600 transition"
        aria-label="Contacto por WhatsApp"
      >
        <FaWhatsapp className="text-white text-3xl" />
      </button>
    </article>
  );
};

export default BotonWsp;
