'use client';

import { useEffect, useState } from 'react';

interface Sucursal {
  _id: string;
  nombre: string;
  descripcion?: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  };
  contacto: {
    telefono: string;
    telefonoAlternativo?: string;
    email: string;
    whatsapp?: string;
  };
  horarios: {
    semanal: {
      lunes: { apertura: string; cierre: string; cerrado?: boolean };
      martes: { apertura: string; cierre: string; cerrado?: boolean };
      miercoles: { apertura: string; cierre: string; cerrado?: boolean };
      jueves: { apertura: string; cierre: string; cerrado?: boolean };
      viernes: { apertura: string; cierre: string; cerrado?: boolean };
    };
    finDeSemana: {
      sabado: { apertura: string; cierre: string; cerrado?: boolean };
      domingo: { apertura: string; cierre: string; cerrado?: boolean };
    };
    observaciones?: string;
  };
  imagenes: {
    principal: string;
    galeria: string[];
  };
  estado: 'activa' | 'inactiva' | 'mantenimiento';
}

// Función helper para formatear los horarios
function formatearHorarios(horarios: Sucursal['horarios']): string {
  const { semanal, finDeSemana } = horarios;
  
  // Verificar si los horarios semanales son consistentes
  const horarioSemanalStr = semanal.lunes.cerrado 
    ? 'Cerrado'
    : `${semanal.lunes.apertura} - ${semanal.lunes.cierre}`;
  
  const horarioFinDeSemanaStr = finDeSemana.sabado.cerrado && finDeSemana.domingo.cerrado
    ? 'Cerrado'
    : `Sáb: ${finDeSemana.sabado.cerrado ? 'Cerrado' : `${finDeSemana.sabado.apertura} - ${finDeSemana.sabado.cierre}`} | Dom: ${finDeSemana.domingo.cerrado ? 'Cerrado' : `${finDeSemana.domingo.apertura} - ${finDeSemana.domingo.cierre}`}`;
  
  return `Lun - Vie: ${horarioSemanalStr} | ${horarioFinDeSemanaStr}`;
}

export default function Locales() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSucursales() {
      try {
        const res = await fetch('/api/sucursales?estado=activa');
        
        if (!res.ok) {
          console.error('Error al obtener sucursales:', res.statusText);
          return;
        }
        
        const data = await res.json();
        if (data.success) {
          setSucursales(data.data);
        }
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSucursales();
  }, []);

  if (loading) {
    return (
      <section id="locales" className="py-20 bg-base dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xl text-primary font-semibold animate-pulse">Cargando sucursales...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="locales" className="py-20 bg-base dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-dark-900 dark:text-light-500 mb-6 animate-fade-in">
            <span className="bg-linear-to-r from-primary-400 via-primary-600 to-primary-400 bg-clip-text text-transparent uppercase">Nuestros Locales</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sucursales.map((sucursal) => {
            const direccionCompleta = `${sucursal.direccion.calle} ${sucursal.direccion.numero}, ${sucursal.direccion.ciudad}, ${sucursal.direccion.provincia}`;
            const urlMapa = sucursal.direccion.coordenadas?.latitud && sucursal.direccion.coordenadas?.longitud
              ? `https://www.google.com/maps?q=${sucursal.direccion.coordenadas.latitud},${sucursal.direccion.coordenadas.longitud}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;
            
            return (
              <div
                key={sucursal._id}
                className="bg-surface dark:bg-dark-800 border-2 border-primary-200 dark:border-primary-900 rounded-lg p-6 hover:shadow-2xl hover:border-primary transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-primary dark:text-primary-400 mb-2">
                    {sucursal.nombre}
                  </h3>
                  <div className="w-16 h-1 bg-linear-to-r from-primary to-secondary rounded-full"></div>
                  <img 
                    src={sucursal.imagenes.principal}
                    alt={`Imagen principal de ${sucursal.nombre}`}
                    className="w-full h-48 object-cover rounded-md mt-4"
                  />
                </div>

                <div className="space-y-4">
                  {/* Dirección */}
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-primary mr-3 mt-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-dark-900 dark:text-light-500">Dirección</p>
                      <p className="text-dark-600 dark:text-dark-400">{direccionCompleta}</p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-secondary dark:text-secondary-400 mr-3 mt-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-dark-900 dark:text-light-500">Teléfono</p>
                      <a
                        href={`tel:${sucursal.contacto.telefono}`}
                        className="text-secondary dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                      >
                        {sucursal.contacto.telefono}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-primary mr-3 mt-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-dark-900 dark:text-light-500">Email</p>
                      <a
                        href={`mailto:${sucursal.contacto.email}`}
                        className="text-primary hover:text-primary-700 transition-colors"
                      >
                        {sucursal.contacto.email}
                      </a>
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-secondary dark:text-secondary-400 mr-3 mt-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-dark-900 dark:text-light-500">Horario</p>
                      <p className="text-dark-600 dark:text-dark-400 text-sm">{formatearHorarios(sucursal.horarios)}</p>
                      <p className="text-dark-600 dark:text-dark-400 text-sm">{sucursal.horarios.observaciones}</p>

                    </div>
                  </div>
                </div>

                {/* Botón Ver en Mapa */}
                <a
                  href={urlMapa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block w-full text-center bg-primary text-white py-3 rounded-lg hover:bg-primary-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
                >
                  Ver en Mapa
                </a>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
