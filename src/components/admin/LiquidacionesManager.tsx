'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { confirmDelete } from '@/utils/alerts';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  precioHora?: number;
  horasAcumuladas?: number;
  ultimaLiquidacion?: string;
}

interface PaymentRecord {
  amount: number;
  hoursWorked: number;
  period: {
    start: string;
    end: string;
  };
  createdAt: string;
  notes?: string;
}

export default function LiquidacionesManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<PaymentRecord[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showRegistrarHoras, setShowRegistrarHoras] = useState(false);
  const [showLiquidar, setShowLiquidar] = useState(false);
  
  const [horasForm, setHorasForm] = useState({
    horas: 0,
    fecha: new Date().toISOString().split('T')[0],
    notas: ''
  });

  const [liquidacionForm, setLiquidacionForm] = useState({
    periodo: '7',
    notas: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        // Filtrar solo vendedores y cajeros
        const trabajadores = data.data.filter((u: User) => 
          u.role === 'vendedor' || u.role === 'cajero' || u.role === 'seller' || u.role === 'cashier'
        );
        setUsers(trabajadores);
      }
    } catch (error) {
      showErrorToast('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleVerHistorial = async (user: User) => {
    setSelectedUser(user);
    setShowHistorial(true);
    
    try {
      const response = await fetch(`/api/liquidaciones?userId=${user._id}&action=history`);
      const data = await response.json();
      
      if (data.success) {
        setHistorial(data.data.historialPagos || []);
      }
    } catch (error) {
      showErrorToast('Error al cargar historial');
    }
  };

  const handleRegistrarHoras = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/liquidaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          horas: horasForm.horas,
          fecha: horasForm.fecha,
          notas: horasForm.notas
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(`${horasForm.horas}h registradas correctamente`);
        setShowRegistrarHoras(false);
        setHorasForm({ horas: 0, fecha: new Date().toISOString().split('T')[0], notas: '' });
        fetchUsers();
      } else {
        showErrorToast(data.error || 'Error al registrar horas');
      }
    } catch (error) {
      showErrorToast('Error al registrar horas');
    }
  };

  const handleLiquidar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    const confirmed = await confirmDelete(
      `¿Procesar liquidación de ${selectedUser.name}?<br>Horas: ${selectedUser.horasAcumuladas || 0}h<br>Monto: AR$ ${((selectedUser.horasAcumuladas || 0) * (selectedUser.precioHora || 0)).toFixed(2)}`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch('/api/liquidaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          periodo: liquidacionForm.periodo,
          notas: liquidacionForm.notas
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(`Liquidación procesada: AR$ ${data.data.montoPagado.toFixed(2)}`);
        setShowLiquidar(false);
        setLiquidacionForm({ periodo: '7', notas: '' });
        fetchUsers();
      } else {
        showErrorToast(data.error || 'Error al procesar liquidación');
      }
    } catch (error) {
      showErrorToast('Error al procesar liquidación');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando liquidaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">Liquidación de Pagos</h2>
      </div>

      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Horas Acumuladas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Precio/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Total a Pagar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Última Liquidación</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {users.map((user) => {
                const totalAPagar = (user.horasAcumuladas || 0) * (user.precioHora || 0);
                return (
                  <tr key={user._id} className="hover:bg-dark-50 dark:hover:bg-dark-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-light-500">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'vendedor' || user.role === 'seller' ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200' :
                        'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900 dark:text-light-500 font-semibold">
                      {user.horasAcumuladas || 0}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                      AR$ {user.precioHora || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      AR$ {totalAPagar.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                      {user.ultimaLiquidacion 
                        ? new Date(user.ultimaLiquidacion).toLocaleDateString()
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRegistrarHoras(true);
                        }}
                        className="text-secondary hover:text-secondary-700 font-semibold transition-colors"
                      >
                        + Horas
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowLiquidar(true);
                        }}
                        className="text-primary hover:text-primary-700 font-semibold transition-colors"
                        disabled={!user.horasAcumuladas || user.horasAcumuladas === 0}
                      >
                        Liquidar
                      </button>
                      <button
                        onClick={() => handleVerHistorial(user)}
                        className="text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-light-500 font-semibold transition-colors"
                      >
                        Historial
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No hay vendedores ni cajeros registrados
          </div>
        )}
      </div>

      {/* Modal Registrar Horas */}
      {showRegistrarHoras && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              Registrar Horas - {selectedUser.name}
            </h3>
            <form onSubmit={handleRegistrarHoras} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Horas Trabajadas
                </label>
                <input
                  type="number"
                  value={horasForm.horas}
                  onChange={(e) => setHorasForm({ ...horasForm, horas: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={horasForm.fecha}
                  onChange={(e) => setHorasForm({ ...horasForm, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={horasForm.notas}
                  onChange={(e) => setHorasForm({ ...horasForm, notas: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegistrarHoras(false);
                    setHorasForm({ horas: 0, fecha: new Date().toISOString().split('T')[0], notas: '' });
                  }}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary hover:bg-secondary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Registrar Horas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Liquidar */}
      {showLiquidar && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              Procesar Liquidación - {selectedUser.name}
            </h3>
            
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-700 dark:text-dark-300">Horas acumuladas:</span>
                  <span className="font-bold text-dark-900 dark:text-light-500">{selectedUser.horasAcumuladas || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-700 dark:text-dark-300">Precio por hora:</span>
                  <span className="font-bold text-dark-900 dark:text-light-500">AR$ {selectedUser.precioHora || 0}</span>
                </div>
                <div className="border-t border-primary-200 dark:border-primary-800 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-dark-700 dark:text-dark-300">Total a pagar:</span>
                    <span className="font-bold text-primary">
                      AR$ {((selectedUser.horasAcumuladas || 0) * (selectedUser.precioHora || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleLiquidar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Período de Liquidación
                </label>
                <select
                  value={liquidacionForm.periodo}
                  onChange={(e) => setLiquidacionForm({ ...liquidacionForm, periodo: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                >
                  <option value="1">1 día</option>
                  <option value="7">7 días (semanal)</option>
                  <option value="28">28 días (mensual)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={liquidacionForm.notas}
                  onChange={(e) => setLiquidacionForm({ ...liquidacionForm, notas: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Ej: Liquidación semanal del 10/01 al 17/01"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLiquidar(false);
                    setLiquidacionForm({ periodo: '7', notas: '' });
                  }}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Procesar Liquidación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial */}
      {showHistorial && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              Historial de Pagos - {selectedUser.name}
            </h3>
            
            {historial.length > 0 ? (
              <div className="space-y-4">
                {historial.map((pago, index) => (
                  <div key={index} className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4 border border-dark-200 dark:border-dark-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          AR$ {pago.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-dark-600 dark:text-dark-400">
                          {pago.hoursWorked}h trabajadas
                        </div>
                      </div>
                      <div className="text-right text-sm text-dark-600 dark:text-dark-400">
                        {new Date(pago.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-dark-700 dark:text-dark-300">
                      Período: {new Date(pago.period.start).toLocaleDateString()} - {new Date(pago.period.end).toLocaleDateString()}
                    </div>
                    {pago.notes && (
                      <div className="text-sm text-dark-600 dark:text-dark-400 mt-2 italic">
                        {pago.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-600 dark:text-dark-400">
                No hay pagos registrados
              </div>
            )}
            
            <div className="flex justify-end pt-4 mt-4 border-t border-dark-200 dark:border-dark-700">
              <button
                onClick={() => {
                  setShowHistorial(false);
                  setHistorial([]);
                }}
                className="px-4 py-2 bg-dark-200 dark:bg-dark-600 hover:bg-dark-300 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
