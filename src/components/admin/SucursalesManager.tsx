'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { confirmDelete } from '@/utils/alerts';
import { uploadToCloudinary } from '@/utils/cloudinaryHelpers';

interface HorarioDia {
  apertura: string;
  cierre: string;
  cerrado?: boolean;
}

interface Horarios {
  semanal: {
    lunes: HorarioDia;
    martes: HorarioDia;
    miercoles: HorarioDia;
    jueves: HorarioDia;
    viernes: HorarioDia;
  };
  finDeSemana: {
    sabado: HorarioDia;
    domingo: HorarioDia;
  };
  observaciones?: string;
}

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
      latitud?: number;
      longitud?: number;
    };
  };
  contacto: {
    telefono: string;
    telefonoAlternativo?: string;
    email: string;
    whatsapp?: string;
  };
  horarios: Horarios;
  imagenes: {
    principal: string;
    galeria: string[];
  };
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  capacidad?: number;
  servicios?: string[];
  encargado?: {
    nombre: string;
    telefono: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

type FormData = Omit<Sucursal, '_id' | 'createdAt' | 'updatedAt'>;

const createDefaultHorarioDia = (): HorarioDia => ({
  apertura: '09:00',
  cierre: '18:00',
  cerrado: false,
});

const createDefaultHorarios = (): Horarios => ({
  semanal: {
    lunes: { ...createDefaultHorarioDia() },
    martes: { ...createDefaultHorarioDia() },
    miercoles: { ...createDefaultHorarioDia() },
    jueves: { ...createDefaultHorarioDia() },
    viernes: { ...createDefaultHorarioDia() },
  },
  finDeSemana: {
    sabado: { ...createDefaultHorarioDia() },
    domingo: { ...createDefaultHorarioDia() },
  },
  observaciones: '',
});

const initialFormState: FormData = {
  nombre: '',
  descripcion: '',
  direccion: {
    calle: '',
    numero: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    coordenadas: {
      latitud: undefined,
      longitud: undefined,
    },
  },
  contacto: {
    telefono: '',
    telefonoAlternativo: '',
    email: '',
    whatsapp: '',
  },
  horarios: createDefaultHorarios(),
  imagenes: {
    principal: '',
    galeria: [],
  },
  estado: 'activa',
  capacidad: undefined,
  servicios: [],
  encargado: {
    nombre: '',
    telefono: '',
    email: '',
  },
};

export default function SucursalesManager() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSucursales();
  }, []);

  const fetchSucursales = async () => {
    try {
      const response = await fetch('/api/sucursales');
      const data = await response.json();
      if (data.success) {
        setSucursales(data.data);
      }
    } catch (error) {
      showErrorToast('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sucursal?: Sucursal) => {
    if (sucursal) {
      setEditingSucursal(sucursal);
      setImagePreview(sucursal.imagenes?.principal || null);
      setFormData({
        nombre: sucursal.nombre || '',
        descripcion: sucursal.descripcion || '',
        direccion: {
          calle: sucursal.direccion?.calle || '',
          numero: sucursal.direccion?.numero || '',
          ciudad: sucursal.direccion?.ciudad || '',
          provincia: sucursal.direccion?.provincia || '',
          codigoPostal: sucursal.direccion?.codigoPostal || '',
          coordenadas: {
            latitud: sucursal.direccion?.coordenadas?.latitud,
            longitud: sucursal.direccion?.coordenadas?.longitud,
          },
        },
        contacto: {
          telefono: sucursal.contacto?.telefono || '',
          telefonoAlternativo: sucursal.contacto?.telefonoAlternativo || '',
          email: sucursal.contacto?.email || '',
          whatsapp: sucursal.contacto?.whatsapp || '',
        },
        horarios: sucursal.horarios || createDefaultHorarios(),
        imagenes: {
          principal: sucursal.imagenes?.principal || '',
          galeria: sucursal.imagenes?.galeria || [],
        },
        estado: sucursal.estado || 'activa',
        capacidad: sucursal.capacidad,
        servicios: sucursal.servicios || [],
        encargado: {
          nombre: sucursal.encargado?.nombre || '',
          telefono: sucursal.encargado?.telefono || '',
          email: sucursal.encargado?.email || '',
        },
      });
    } else {
      setEditingSucursal(null);
      setImagePreview(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSucursal(null);
    setImagePreview(null);
    setFormData(initialFormState);
  };

  const handleHorarioChange = (
    section: 'semanal' | 'finDeSemana',
    dia: keyof Horarios['semanal'] | keyof Horarios['finDeSemana'],
    field: keyof HorarioDia,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [section]: {
          ...(prev.horarios[section] as any),
          [dia]: {
            ...(prev.horarios[section] as any)[dia],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleToggleServicio = (servicio: string) => {
    setFormData((prev) => {
      const servicios = prev.servicios || [];
      if (servicios.includes(servicio)) {
        return { ...prev, servicios: servicios.filter((s) => s !== servicio) };
      }
      return { ...prev, servicios: [...servicios, servicio] };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar configuración de Cloudinary
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      showErrorToast('Cloudinary no está configurado. Verifica las variables de entorno.');
      console.error('Falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en .env.local');
      return;
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      showErrorToast('Cloudinary Upload Preset no configurado. Verifica NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
      console.error('Falta NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local');
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showErrorToast('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setUploadingImage(true);

      // Preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const result = await uploadToCloudinary(file);
      
      if (result) {
        setFormData({
          ...formData,
          imagenes: {
            ...formData.imagenes,
            principal: result.url,
          },
        });
        showSuccessToast('Imagen subida correctamente');
      } else {
        showErrorToast('Error al subir la imagen a Cloudinary. Verifica la consola para más detalles.');
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showErrorToast('Error al subir la imagen. Verifica la configuración de Cloudinary.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      imagenes: {
        ...formData.imagenes,
        principal: '',
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSucursal
        ? `/api/sucursales/${editingSucursal._id}`
        : '/api/sucursales';
      const method = editingSucursal ? 'PUT' : 'POST';

      // Normalizar galería: venir de input separado por comas
      const payload: FormData = {
        ...formData,
        imagenes: {
          principal: formData.imagenes.principal,
          galeria: formData.imagenes.galeria.filter((url) => url.trim() !== ''),
        },
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(
          editingSucursal ? 'Sucursal actualizada' : 'Sucursal creada'
        );
        fetchSucursales();
        handleCloseModal();
      } else {
        showErrorToast(data.error || 'Error al guardar sucursal');
      }
    } catch (error) {
      showErrorToast('Error al guardar sucursal');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete('¿Eliminar esta sucursal?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/sucursales/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        showSuccessToast('Sucursal eliminada');
        fetchSucursales();
      } else {
        showErrorToast(data.error || 'Error al eliminar sucursal');
      }
    } catch (error) {
      showErrorToast('Error al eliminar sucursal');
    }
  };

  const toggleEstado = async (sucursal: Sucursal) => {
    // Simple: alternar entre activa / inactiva (mantenimiento solo desde el formulario)
    const nuevoEstado: Sucursal['estado'] =
      sucursal.estado === 'activa' ? 'inactiva' : 'activa';

    try {
      const response = await fetch(`/api/sucursales/${sucursal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sucursal, estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(
          `Sucursal ${nuevoEstado === 'activa' ? 'activada' : 'desactivada'}`
        );
        fetchSucursales();
      } else {
        showErrorToast(data.error || 'Error al actualizar sucursal');
      }
    } catch (error) {
      showErrorToast('Error al actualizar sucursal');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-primary">
        Cargando sucursales...
      </div>
    );
  }

  const serviciosDisponibles = [
    'estacionamiento',
    'wifi',
    'delivery',
    'pago con tarjeta',
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">
          Gestión de Sucursales
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          + Nueva Sucursal
        </button>
      </div>

      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {sucursales.map((sucursal) => (
                <tr
                  key={sucursal._id}
                  className="hover:bg-dark-50 dark:hover:bg-dark-750 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-light-500">
                    {sucursal.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {sucursal.direccion?.ciudad}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400 max-w-xs truncate">
                    {sucursal.direccion
                      ? `${sucursal.direccion.calle} ${sucursal.direccion.numero}, ${sucursal.direccion.ciudad}, ${sucursal.direccion.provincia}`
                      : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {sucursal.contacto?.telefono}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleEstado(sucursal)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                        sucursal.estado === 'activa'
                          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 hover:bg-success-200'
                          : sucursal.estado === 'inactiva'
                          ? 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200 hover:bg-error-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-200'
                      }`}
                    >
                      {sucursal.estado.charAt(0).toUpperCase() +
                        sucursal.estado.slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(sucursal)}
                      className="text-primary hover:text-primary-700 font-semibold transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sucursal._id)}
                      className="text-error hover:text-error-dark font-semibold transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sucursales.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No hay sucursales registradas
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col my-8">
            <div className="px-6 pt-6 pb-4 border-b border-dark-200 dark:border-dark-700">
              <h3 className="text-xl font-bold text-dark-900 dark:text-light-500">
                {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-6 py-4 space-y-6">
              {/* Nota campos obligatorios */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="text-red-500 font-bold">*</span> Indica campos obligatorios
                </p>
              </div>

              {/* Verificación de Cloudinary */}
              {(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                        ⚠️ Cloudinary no está completamente configurado
                      </h4>
                      <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                        <li className="flex items-center">
                          <span className="mr-2">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}</span>
                          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">{process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✅' : '❌'}</span>
                          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                        </li>
                      </ul>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                        📖 Revisa <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">CLOUDINARY_FIX.md</code> para configurar
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info básica */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-dark-800 dark:text-light-400">
                  Información básica
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estado: e.target.value as FormData['estado'],
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    >
                      <option value="activa">Activa</option>
                      <option value="inactiva">Inactiva</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-dark-800 dark:text-light-400">
                  Dirección
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Calle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.direccion.calle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccion: {
                            ...formData.direccion,
                            calle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Número <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.direccion.numero}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccion: {
                            ...formData.direccion,
                            numero: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.direccion.ciudad}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccion: {
                            ...formData.direccion,
                            ciudad: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Provincia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.direccion.provincia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccion: {
                            ...formData.direccion,
                            provincia: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Código postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.direccion.codigoPostal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccion: {
                            ...formData.direccion,
                            codigoPostal: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Latitud
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={
                          formData.direccion.coordenadas?.latitud ?? ''
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            direccion: {
                              ...formData.direccion,
                              coordenadas: {
                                ...(formData.direccion.coordenadas || {}),
                                latitud:
                                  e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Longitud
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={
                          formData.direccion.coordenadas?.longitud ?? ''
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            direccion: {
                              ...formData.direccion,
                              coordenadas: {
                                ...(formData.direccion.coordenadas || {}),
                                longitud:
                                  e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-dark-800 dark:text-light-400">
                  Datos de contacto
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Teléfono principal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contacto.telefono}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contacto: {
                            ...formData.contacto,
                            telefono: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Teléfono alternativo
                    </label>
                    <input
                      type="tel"
                      value={formData.contacto.telefonoAlternativo || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contacto: {
                            ...formData.contacto,
                            telefonoAlternativo: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contacto.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contacto: {
                            ...formData.contacto,
                            email: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.contacto.whatsapp || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contacto: {
                            ...formData.contacto,
                            whatsapp: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                    />
                  </div>
                </div>
              </div>

              {/* Horarios */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-dark-800 dark:text-light-400">
                  Horarios
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                  {/* Lunes a Viernes */}
                  <div>
                    <p className="font-medium mb-1">Lunes a Viernes</p>
                    {(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'] as const).map(
                      (dia) => (
                        <div
                          key={dia}
                          className="flex items-center gap-2 mb-1"
                        >
                          <span className="w-16 capitalize">
                            {dia === 'miercoles' ? 'Miércoles' : dia}
                          </span>
                          <input
                            type="time"
                            value={
                              (formData.horarios.semanal as any)[dia]
                                .apertura
                            }
                            onChange={(e) =>
                              handleHorarioChange(
                                'semanal',
                                dia,
                                'apertura',
                                e.target.value
                              )
                            }
                            className="px-2 py-1 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={
                              (formData.horarios.semanal as any)[dia].cierre
                            }
                            onChange={(e) =>
                              handleHorarioChange(
                                'semanal',
                                dia,
                                'cierre',
                                e.target.value
                              )
                            }
                            className="px-2 py-1 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                          />
                          <label className="flex items-center gap-1 ml-2">
                            <input
                              type="checkbox"
                              checked={
                                (formData.horarios.semanal as any)[dia]
                                  .cerrado || false
                              }
                              onChange={(e) =>
                                handleHorarioChange(
                                  'semanal',
                                  dia,
                                  'cerrado',
                                  e.target.checked
                                )
                              }
                            />
                            <span>Cerrado</span>
                          </label>
                        </div>
                      )
                    )}
                  </div>
                  {/* Fin de semana */}
                  <div>
                    <p className="font-medium mb-1">Fin de semana</p>
                    {(['sabado', 'domingo'] as const).map((dia) => (
                      <div
                        key={dia}
                        className="flex items-center gap-2 mb-1"
                      >
                        <span className="w-16 capitalize">
                          {dia === 'sabado' ? 'Sábado' : 'Domingo'}
                        </span>
                        <input
                          type="time"
                          value={
                            (formData.horarios.finDeSemana as any)[dia]
                              .apertura
                          }
                          onChange={(e) =>
                            handleHorarioChange(
                              'finDeSemana',
                              dia,
                              'apertura',
                              e.target.value
                            )
                          }
                          className="px-2 py-1 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={
                            (formData.horarios.finDeSemana as any)[dia]
                              .cierre
                          }
                          onChange={(e) =>
                            handleHorarioChange(
                              'finDeSemana',
                              dia,
                              'cierre',
                              e.target.value
                            )
                          }
                          className="px-2 py-1 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                        />
                        <label className="flex items-center gap-1 ml-2">
                          <input
                            type="checkbox"
                            checked={
                              (formData.horarios.finDeSemana as any)[dia]
                                .cerrado || false
                            }
                            onChange={(e) =>
                              handleHorarioChange(
                                'finDeSemana',
                                dia,
                                'cerrado',
                                e.target.checked
                              )
                            }
                          />
                          <span>Cerrado</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.horarios.observaciones || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        horarios: {
                          ...formData.horarios,
                          observaciones: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm"
                  />
                </div>
              </div>

              {/* Imágenes y servicios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-dark-800 dark:text-light-400">
                    Imagen de Portada
                  </h4>
                  
                  {/* Preview de la imagen */}
                  {imagePreview && (
                    <div className="mb-3 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-dark-300 dark:border-dark-600"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-error hover:bg-error-dark text-white rounded-full p-2 shadow-lg transition-colors"
                        title="Eliminar imagen"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Input para subir archivo */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      Subir imagen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-700 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploadingImage && (
                      <p className="text-xs text-primary mt-1">
                        Subiendo imagen...
                      </p>
                    )}
                    <p className="text-xs text-dark-600 dark:text-dark-400 mt-1">
                      Máximo 5MB. Formatos: JPG, PNG, WEBP
                    </p>
                  </div>

                  {/* Input alternativo con URL */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      O ingresa URL de imagen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.imagenes.principal}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          imagenes: {
                            ...formData.imagenes,
                            principal: e.target.value,
                          },
                        });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm"
                      required
                    />
                  </div>

                  <label className="block text-sm font-medium mb-1 mt-3">
                    Galería (URLs separadas por coma)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.imagenes.galeria.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        imagenes: {
                          ...formData.imagenes,
                          galeria: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter((s) => s !== ''),
                        },
                      })
                    }
                    placeholder="URL1, URL2, URL3..."
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-dark-800 dark:text-light-400">
                    Servicios y capacidad
                  </h4>
                  <label className="block text-sm font-medium mb-1">
                    Capacidad (opcional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacidad ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacidad:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm"
                  />
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Servicios</p>
                    <div className="flex flex-wrap gap-2">
                      {serviciosDisponibles.map((servicio) => (
                        <button
                          key={servicio}
                          type="button"
                          onClick={() => handleToggleServicio(servicio)}
                          className={`px-3 py-1 rounded-full text-xs border ${
                            formData.servicios?.includes(servicio)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-transparent text-dark-700 dark:text-dark-200 border-dark-300 dark:border-dark-600'
                          }`}
                        >
                          {servicio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Encargado */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-dark-800 dark:text-light-400">
                  Datos del encargado (opcional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.encargado?.nombre || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          encargado: {
                            ...(formData.encargado || {
                              nombre: '',
                              telefono: '',
                              email: '',
                            }),
                            nombre: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.encargado?.telefono || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          encargado: {
                            ...(formData.encargado || {
                              nombre: '',
                              telefono: '',
                              email: '',
                            }),
                            telefono: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.encargado?.email || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          encargado: {
                            ...(formData.encargado || {
                              nombre: '',
                              telefono: '',
                              email: '',
                            }),
                            email: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-sm"
                    />
                  </div>
                </div>
              </div>
              </div>

              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-dark-200 dark:border-dark-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingSucursal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
