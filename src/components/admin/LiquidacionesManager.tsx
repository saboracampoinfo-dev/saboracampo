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
  comprasAcumuladas?: number;
  ultimaLiquidacion?: string;
}

interface Compra {
  monto: number;
  descripcion: string;
  fecha: string;
  createdAt: string;
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
  const [historialCompras, setHistorialCompras] = useState<Compra[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showRegistrarHoras, setShowRegistrarHoras] = useState(false);
  const [showRegistrarCompra, setShowRegistrarCompra] = useState(false);
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

  const [compraForm, setCompraForm] = useState({
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
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
        setHistorialCompras(data.data.historialCompras || []);
      }
    } catch (error) {
      showErrorToast('Error al cargar historial');
    }
  };

  const handleRegistrarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/liquidaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          monto: compraForm.monto,
          descripcion: compraForm.descripcion,
          fecha: compraForm.fecha
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(`Compra de AR$ ${compraForm.monto} registrada correctamente`);
        setShowRegistrarCompra(false);
        setCompraForm({ monto: 0, descripcion: '', fecha: new Date().toISOString().split('T')[0] });
        fetchUsers();
      } else {
        showErrorToast(data.error || 'Error al registrar compra');
      }
    } catch (error) {
      showErrorToast('Error al registrar compra');
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

    const montoBruto = (selectedUser.horasAcumuladas || 0) * (selectedUser.precioHora || 0);
    const compras = selectedUser.comprasAcumuladas || 0;
    const montoNeto = montoBruto - compras;

    const confirmed = await confirmDelete(
      `¿Procesar liquidación de ${selectedUser.name}?<br>Horas: ${selectedUser.horasAcumuladas || 0}h<br>Monto Bruto: AR$ ${montoBruto.toFixed(2)}<br>Compras: -AR$ ${compras.toFixed(2)}<br><strong>Total a Pagar: AR$ ${montoNeto.toFixed(2)}</strong>`
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
        showSuccessToast(`Liquidación procesada: AR$ ${data.data.montoPagado.toFixed(2)} (Bruto: AR$ ${data.data.montoBruto.toFixed(2)} - Compras: AR$ ${data.data.comprasDescontadas.toFixed(2)})`);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Horas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Precio/H</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Compras</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Total Neto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Última Liq.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {users.map((user) => {
                const montoBruto = (user.horasAcumuladas || 0) * (user.precioHora || 0);
                const compras = user.comprasAcumuladas || 0;
                const totalNeto = montoBruto - compras;
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-error dark:text-error-400 font-semibold">
                      {compras > 0 ? `-AR$ ${compras.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      AR$ {totalNeto.toFixed(2)}
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
                          setShowRegistrarCompra(true);
                        }}
                        className="text-error hover:text-error-700 font-semibold transition-colors"
                      >
                        + Compra
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

      {/* Modal Registrar Compra */}
      {showRegistrarCompra && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              Registrar Compra - {selectedUser.name}
            </h3>
            <form onSubmit={handleRegistrarCompra} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Monto de la Compra (AR$)
                </label>
                <input
                  type="number"
                  value={compraForm.monto}
                  onChange={(e) => setCompraForm({ ...compraForm, monto: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-error"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={compraForm.descripcion}
                  onChange={(e) => setCompraForm({ ...compraForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-error"
                  placeholder="Ej: 1 Coca Cola, Almuerzo, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={compraForm.fecha}
                  onChange={(e) => setCompraForm({ ...compraForm, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-error"
                  required
                />
              </div>
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3 text-sm text-dark-700 dark:text-dark-300">
                💡 Esta compra se descontará del total a pagar en la próxima liquidación.
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegistrarCompra(false);
                    setCompraForm({ monto: 0, descripcion: '', fecha: new Date().toISOString().split('T')[0] });
                  }}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-error hover:bg-error-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Registrar Compra
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
                <div className="flex justify-between border-t border-primary-200 dark:border-primary-800 pt-2">
                  <span className="text-dark-700 dark:text-dark-300">Subtotal (Bruto):</span>
                  <span className="font-bold text-dark-900 dark:text-light-500">
                    AR$ {((selectedUser.horasAcumuladas || 0) * (selectedUser.precioHora || 0)).toFixed(2)}
                  </span>
                </div>
                {(selectedUser.comprasAcumuladas || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-error dark:text-error-400">Compras realizadas:</span>
                    <span className="font-bold text-error dark:text-error-400">
                      -AR$ {(selectedUser.comprasAcumuladas || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-primary-300 dark:border-primary-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-dark-700 dark:text-dark-300 font-semibold">Total Neto a pagar:</span>
                    <span className="font-bold text-primary">
                      AR$ {(((selectedUser.horasAcumuladas || 0) * (selectedUser.precioHora || 0)) - (selectedUser.comprasAcumuladas || 0)).toFixed(2)}
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
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              Historial Completo - {selectedUser.name}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Historial de Pagos */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-primary">💰 Pagos Realizados</h4>
                {historial.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {historial.map((pago, index) => (
                      <div key={index} className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border border-primary-200 dark:border-primary-800">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="text-base font-bold text-primary">
                              AR$ {pago.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-dark-600 dark:text-dark-400">
                              {pago.hoursWorked}h trabajadas
                            </div>
                          </div>
                          <div className="text-right text-xs text-dark-600 dark:text-dark-400">
                            {new Date(pago.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-xs text-dark-700 dark:text-dark-300">
                          {new Date(pago.period.start).toLocaleDateString()} - {new Date(pago.period.end).toLocaleDateString()}
                        </div>
                        {pago.notes && (
                          <div className="text-xs text-dark-600 dark:text-dark-400 mt-1 italic">
                            {pago.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-dark-600 dark:text-dark-400 text-sm">
                    No hay pagos registrados
                  </div>
                )}
              </div>

              {/* Historial de Compras */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-error">🛒 Compras Realizadas</h4>
                {historialCompras.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {historialCompras.map((compra, index) => (
                      <div key={index} className="bg-error-50 dark:bg-error-900/20 rounded-lg p-3 border border-error-200 dark:border-error-800">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="text-base font-bold text-error">
                              -AR$ {compra.monto.toFixed(2)}
                            </div>
                            <div className="text-xs text-dark-700 dark:text-dark-300 font-medium">
                              {compra.descripcion}
                            </div>
                          </div>
                          <div className="text-right text-xs text-dark-600 dark:text-dark-400">
                            {new Date(compra.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-xs text-dark-600 dark:text-dark-400">
                          Fecha: {new Date(compra.fecha).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-dark-600 dark:text-dark-400 text-sm">
                    No hay compras registradas
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4 mt-4 border-t border-dark-200 dark:border-dark-700">
              <button
                onClick={() => {
                  setShowHistorial(false);
                  setHistorial([]);
                  setHistorialCompras([]);
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
