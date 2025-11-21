'use client';

import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';

interface RedesSociales {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

interface Direccion {
  calle?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
}

interface HorarioAtencion {
  lunes?: string;
  martes?: string;
  miercoles?: string;
  jueves?: string;
  viernes?: string;
  sabado?: string;
  domingo?: string;
}

interface Notificaciones {
  emailActivo: boolean;
  whatsappActivo: boolean;
}

interface WhatsAppContacto {
  numero: string;
  codigoPais: string;
  textoPredefinido?: string;
  activo: boolean;
}

interface WhatsAppConfig {
  administracion?: WhatsAppContacto;
  ventas?: WhatsAppContacto;
}

interface Configuracion {
  _id?: string;
  nombreEmpresa: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  correoAdministracion: string;
  correoVentas: string;
  correoSoporte?: string;
  correoContacto?: string;
  telefonoAdministracion: string;
  telefonoVentas: string;
  telefonoSoporte?: string;
  telefonoWhatsApp?: string;
  whatsapp?: WhatsAppConfig;
  redesSociales: RedesSociales;
  direccion?: Direccion;
  horarioAtencion?: HorarioAtencion;
  logoUrl?: string;
  faviconUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  terminosCondiciones?: string;
  politicaPrivacidad?: string;
  politicaDevolucion?: string;
  notificaciones: Notificaciones;
  activo: boolean;
}

export default function ConfiguracionManager() {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contacto' | 'whatsapp' | 'redes' | 'horarios' | 'avanzado'>('general');

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const response = await fetch('/api/configuracion');
      const data = await response.json();

      if (data.success) {
        // Asegurar que los objetos anidados existan
        const config = data.data;
        setConfiguracion({
          ...config,
          redesSociales: config.redesSociales || {},
          direccion: config.direccion || {},
          horarioAtencion: config.horarioAtencion || {
            lunes: '9:00 AM - 6:00 PM',
            martes: '9:00 AM - 6:00 PM',
            miercoles: '9:00 AM - 6:00 PM',
            jueves: '9:00 AM - 6:00 PM',
            viernes: '9:00 AM - 6:00 PM',
            sabado: '10:00 AM - 2:00 PM',
            domingo: 'Cerrado'
          },
          whatsapp: config.whatsapp || {
            administracion: {
              numero: '2235032141',
              codigoPais: '54',
              textoPredefinido: 'Hola, me gustaría contactar con administración.',
              activo: true
            },
            ventas: {
              numero: '2231234567',
              codigoPais: '54',
              textoPredefinido: 'Hola, me interesa saber más sobre productos o servicios.',
              activo: true
            }
          },
          notificaciones: config.notificaciones || {
            emailActivo: true,
            whatsappActivo: false
          }
        });
      } else {
        showErrorToast('Error al cargar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorToast('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuracion) return;

    setSaving(true);
    try {
      const response = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracion),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast('Configuración actualizada correctamente');
        setConfiguracion(data.data);
      } else {
        showErrorToast(data.error || 'Error al actualizar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorToast('Error al actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setConfiguracion((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setConfiguracion((prev) => {
      if (!prev) return null;
      const currentParent = (prev[parent as keyof Configuracion] as any) || {};
      return {
        ...prev,
        [parent]: {
          ...currentParent,
          [field]: value,
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!configuracion) {
    return <div className="text-center text-error">No se pudo cargar la configuración</div>;
  }

  return (
    <div className="space-y-3 md:space-y-6 px-1 md:px-0">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-200 dark:border-dark-700">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500 mb-6">Configuración General</h2>

        {/* Tabs */}
        <div className="border-b border-dark-200 dark:border-dark-700 mb-6">
          <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
            {[
              { id: 'general', label: 'General' },
              { id: 'contacto', label: 'Contacto' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'redes', label: 'Redes Sociales' },
              { id: 'horarios', label: 'Horarios' },
              { id: 'avanzado', label: 'Avanzado' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-dark-600 dark:text-dark-400 hover:text-secondary hover:border-dark-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab: General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={configuracion.nombreEmpresa}
                  onChange={(e) => updateField('nombreEmpresa', e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={configuracion.descripcionCorta || ''}
                  onChange={(e) => updateField('descripcionCorta', e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  placeholder="Máximo 200 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Descripción Larga
                </label>
                <textarea
                  maxLength={1000}
                  rows={4}
                  value={configuracion.descripcionLarga || ''}
                  onChange={(e) => updateField('descripcionLarga', e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  placeholder="Máximo 1000 caracteres"
                />
              </div>

            </div>
          )}

          {/* Tab: Contacto */}
          {activeTab === 'contacto' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Correo Administración *
                  </label>
                  <input
                    type="email"
                    required
                    value={configuracion.correoAdministracion}
                    onChange={(e) => updateField('correoAdministracion', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Correo Ventas *
                  </label>
                  <input
                    type="email"
                    required
                    value={configuracion.correoVentas}
                    onChange={(e) => updateField('correoVentas', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Correo Soporte
                  </label>
                  <input
                    type="email"
                    value={configuracion.correoSoporte || ''}
                    onChange={(e) => updateField('correoSoporte', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Correo Contacto
                  </label>
                  <input
                    type="email"
                    value={configuracion.correoContacto || ''}
                    onChange={(e) => updateField('correoContacto', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Teléfono Administración *
                  </label>
                  <input
                    type="tel"
                    required
                    value={configuracion.telefonoAdministracion}
                    onChange={(e) => updateField('telefonoAdministracion', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Teléfono Ventas *
                  </label>
                  <input
                    type="tel"
                    required
                    value={configuracion.telefonoVentas}
                    onChange={(e) => updateField('telefonoVentas', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Teléfono Soporte
                  </label>
                  <input
                    type="tel"
                    value={configuracion.telefonoSoporte || ''}
                    onChange={(e) => updateField('telefonoSoporte', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={configuracion.telefonoWhatsApp || ''}
                    onChange={(e) => updateField('telefonoWhatsApp', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    placeholder="+52 123 456 7890"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-dark-800 dark:text-light-400 mb-3">Dirección</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Calle</label>
                    <input
                      type="text"
                      value={configuracion.direccion?.calle || ''}
                      onChange={(e) => updateNestedField('direccion', 'calle', e.target.value)}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={configuracion.direccion?.ciudad || ''}
                      onChange={(e) => updateNestedField('direccion', 'ciudad', e.target.value)}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Estado</label>
                    <input
                      type="text"
                      value={configuracion.direccion?.estado || ''}
                      onChange={(e) => updateNestedField('direccion', 'estado', e.target.value)}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Código Postal</label>
                    <input
                      type="text"
                      value={configuracion.direccion?.codigoPostal || ''}
                      onChange={(e) => updateNestedField('direccion', 'codigoPostal', e.target.value)}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">País</label>
                    <input
                      type="text"
                      value={configuracion.direccion?.pais || ''}
                      onChange={(e) => updateNestedField('direccion', 'pais', e.target.value)}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: WhatsApp */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-lg p-4">
                <p className="text-sm text-secondary-900 dark:text-secondary-100">
                  💬 Configura los números de WhatsApp para el botón flotante de contacto.
                </p>
              </div>

              {/* WhatsApp Administración */}
              <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-4 bg-white dark:bg-dark-800">
                <h3 className="text-lg font-semibold text-dark-800 dark:text-light-400 mb-4">📋 Administración</h3>
              
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="whatsapp-admin-activo"
                    checked={configuracion.whatsapp?.administracion?.activo || false}
                    onChange={(e) => updateNestedField('whatsapp', 'administracion', {
                      ...configuracion.whatsapp?.administracion,
                      activo: e.target.checked
                    })}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-dark-300 dark:border-dark-600 rounded"
                  />
                  <label htmlFor="whatsapp-admin-activo" className="ml-2 block text-sm text-dark-700 dark:text-dark-300">
                    Activar botón de Administración
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Código de País
                    </label>
                    <input
                      type="text"
                      value={configuracion.whatsapp?.administracion?.codigoPais || '54'}
                      onChange={(e) => updateNestedField('whatsapp', 'administracion', {
                        ...configuracion.whatsapp?.administracion,
                        codigoPais: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      placeholder="54"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Número de WhatsApp
                    </label>
                    <input
                      type="text"
                      value={configuracion.whatsapp?.administracion?.numero || ''}
                      onChange={(e) => updateNestedField('whatsapp', 'administracion', {
                        ...configuracion.whatsapp?.administracion,
                        numero: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      placeholder="2235032141"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Texto Predefinido
                  </label>
                  <textarea
                    rows={3}
                    value={configuracion.whatsapp?.administracion?.textoPredefinido || ''}
                    onChange={(e) => updateNestedField('whatsapp', 'administracion', {
                      ...configuracion.whatsapp?.administracion,
                      textoPredefinido: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    placeholder="Hola, me gustaría contactar con administración."
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Ventas */}
            <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-4 bg-white dark:bg-dark-800">
              <h3 className="text-lg font-semibold text-dark-800 dark:text-light-400 mb-4">💰 Ventas</h3>
              
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="whatsapp-ventas-activo"
                    checked={configuracion.whatsapp?.ventas?.activo || false}
                    onChange={(e) => updateNestedField('whatsapp', 'ventas', {
                      ...configuracion.whatsapp?.ventas,
                      activo: e.target.checked
                    })}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-dark-300 dark:border-dark-600 rounded"
                  />
                  <label htmlFor="whatsapp-ventas-activo" className="ml-2 block text-sm text-dark-700 dark:text-dark-300">
                    Activar botón de Ventas
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Código de País
                    </label>
                    <input
                      type="text"
                      value={configuracion.whatsapp?.ventas?.codigoPais || '54'}
                      onChange={(e) => updateNestedField('whatsapp', 'ventas', {
                        ...configuracion.whatsapp?.ventas,
                        codigoPais: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      placeholder="54"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Número de WhatsApp
                    </label>
                    <input
                      type="text"
                      value={configuracion.whatsapp?.ventas?.numero || ''}
                      onChange={(e) => updateNestedField('whatsapp', 'ventas', {
                        ...configuracion.whatsapp?.ventas,
                        numero: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      placeholder="2231234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Texto Predefinido
                  </label>
                  <textarea
                    rows={3}
                    value={configuracion.whatsapp?.ventas?.textoPredefinido || ''}
                    onChange={(e) => updateNestedField('whatsapp', 'ventas', {
                      ...configuracion.whatsapp?.ventas,
                      textoPredefinido: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    placeholder="Hola, me interesa saber más sobre productos o servicios."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Redes Sociales */}
        {activeTab === 'redes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Facebook</label>
              <input
                type="url"
                value={configuracion.redesSociales?.facebook || ''}
                onChange={(e) => updateNestedField('redesSociales', 'facebook', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                placeholder="https://facebook.com/tu-pagina"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Instagram</label>
              <input
                type="url"
                value={configuracion.redesSociales?.instagram || ''}
                onChange={(e) => updateNestedField('redesSociales', 'instagram', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                placeholder="https://instagram.com/tu-usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Twitter / X</label>
              <input
                type="url"
                value={configuracion.redesSociales?.twitter || ''}
                onChange={(e) => updateNestedField('redesSociales', 'twitter', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                placeholder="https://twitter.com/tu-usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">LinkedIn</label>
              <input
                type="url"
                value={configuracion.redesSociales?.linkedin || ''}
                onChange={(e) => updateNestedField('redesSociales', 'linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                placeholder="https://linkedin.com/company/tu-empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">YouTube</label>
              <input
                type="url"
                value={configuracion.redesSociales?.youtube || ''}
                onChange={(e) => updateNestedField('redesSociales', 'youtube', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                placeholder="https://youtube.com/@tu-canal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">TikTok</label>
              <input
                type="url"
                value={configuracion.redesSociales?.tiktok || ''}
                onChange={(e) => updateNestedField('redesSociales', 'tiktok', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                placeholder="https://tiktok.com/@tu-usuario"
              />
            </div>
          </div>
        )}

        {/* Tab: Horarios */}
        {activeTab === 'horarios' && (
          <div className="space-y-4">
            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
              <div key={dia}>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 capitalize">
                  {dia}
                </label>
                <input
                  type="text"
                  value={(configuracion.horarioAtencion as any)?.[dia] || ''}
                  onChange={(e) => updateNestedField('horarioAtencion', dia, e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab: Avanzado */}
        {activeTab === 'avanzado' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">URL del Logo</label>
              <input
                type="url"
                value={configuracion.logoUrl || ''}
                onChange={(e) => updateField('logoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">URL del Favicon</label>
              <input
                type="url"
                value={configuracion.faviconUrl || ''}
                onChange={(e) => updateField('faviconUrl', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Términos y Condiciones (URL)
              </label>
              <input
                type="url"
                value={configuracion.terminosCondiciones || ''}
                onChange={(e) => updateField('terminosCondiciones', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Política de Privacidad (URL)
              </label>
              <input
                type="url"
                value={configuracion.politicaPrivacidad || ''}
                onChange={(e) => updateField('politicaPrivacidad', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Política de Devolución (URL)
              </label>
              <input
                type="url"
                value={configuracion.politicaDevolucion || ''}
                onChange={(e) => updateField('politicaDevolucion', e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-dark-800 dark:text-light-400 mb-3">Notificaciones</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={configuracion.notificaciones?.emailActivo}
                    onChange={(e) => updateNestedField('notificaciones', 'emailActivo', e.target.checked)}
                    className="w-4 h-4 text-secondary border-dark-300 dark:border-dark-600 rounded focus:ring-secondary"
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Notificaciones por Email</span>
                </label>


                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={configuracion.notificaciones?.whatsappActivo}
                    onChange={(e) => updateNestedField('notificaciones', 'whatsappActivo', e.target.checked)}
                    className="w-4 h-4 text-secondary border-dark-300 dark:border-dark-600 rounded focus:ring-secondary"
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Notificaciones por WhatsApp</span>
                </label>
              </div>
            </div>
          </div>
        )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-dark-200 dark:border-dark-700">
            <button
              type="button"
              onClick={cargarConfiguracion}
              disabled={saving}
              className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-secondary hover:bg-secondary-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2 font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
