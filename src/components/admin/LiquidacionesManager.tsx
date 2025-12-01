'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { confirmDelete } from '@/utils/alerts';
import * as XLSX from 'xlsx';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  precioHora?: number;
  horasAcumuladas?: number;
  comprasAcumuladas?: number;
  ultimaLiquidacion?: string;
  incentivosAcumulados?: number;
  montoIncentivo?: number;
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
  metodoPago?: 'efectivo' | 'transferencia';
  nroComprobante?: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'horas' | 'total' | 'ultimaLiq' | 'role'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [horasForm, setHorasForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaEntrada: '08:00',
    horaSalida: '17:00',
    cumplioIncentivo: false,
    notas: ''
  });

  const [liquidacionForm, setLiquidacionForm] = useState({
    periodo: '7',
    notas: '',
    metodoPago: 'efectivo' as 'efectivo' | 'transferencia',
    nroComprobante: ''
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
        console.log('📊 Usuarios cargados:', trabajadores.map((u: User) => ({
          nombre: u.name,
          horas: u.horasAcumuladas,
          incentivos: u.incentivosAcumulados,
          montoIncentivo: u.montoIncentivo
        })));
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

  const handleExportarHistorial = () => {
    if (!selectedUser) return;

    try {
      // Preparar datos de pagos
      const pagosData = historial.map((pago, index) => ({
        'N°': index + 1,
        'Fecha Pago': new Date(pago.createdAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        'Período Inicio': new Date(pago.period.start).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        'Período Fin': new Date(pago.period.end).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        'Horas Trabajadas': pago.hoursWorked,
        'Monto Pagado (AR$)': pago.amount.toFixed(2),
        'Método de Pago': pago.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia',
        'N° Comprobante': pago.nroComprobante || '-',
        'Notas': pago.notes || '-',
      }));

      // Preparar datos de compras
      const comprasData = historialCompras.map((compra, index) => ({
        'N°': index + 1,
        'Fecha Compra': new Date(compra.fecha).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        'Fecha Registro': new Date(compra.createdAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        'Monto (AR$)': compra.monto.toFixed(2),
        'Descripción': compra.descripcion,
      }));

      // Calcular resumen
      const totalPagos = historial.reduce((sum, pago) => sum + pago.amount, 0);
      const totalHoras = historial.reduce((sum, pago) => sum + pago.hoursWorked, 0);
      const totalCompras = historialCompras.reduce((sum, compra) => sum + compra.monto, 0);

      const resumenData = [
        {
          'Concepto': 'Total de Pagos Realizados',
          'Valor': `AR$ ${totalPagos.toFixed(2)}`,
        },
        {
          'Concepto': 'Total de Horas Trabajadas',
          'Valor': `${totalHoras} horas`,
        },
        {
          'Concepto': 'Total de Compras Descontadas',
          'Valor': `AR$ ${totalCompras.toFixed(2)}`,
        },
        {
          'Concepto': 'Horas Pendientes Actuales',
          'Valor': `${selectedUser.horasAcumuladas || 0} horas`,
        },
        {
          'Concepto': 'Compras Pendientes Actuales',
          'Valor': `AR$ ${(selectedUser.comprasAcumuladas || 0).toFixed(2)}`,
        },
        {
          'Concepto': 'Precio por Hora',
          'Valor': `AR$ ${selectedUser.precioHora || 0}`,
        },
      ];

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen
      const ws1 = XLSX.utils.json_to_sheet(resumenData);
      const colWidths1 = [
        { wch: 35 }, // Concepto
        { wch: 25 }, // Valor
      ];
      ws1['!cols'] = colWidths1;
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

      // Hoja 2: Pagos
      if (pagosData.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(pagosData);
        const colWidths2 = [
          { wch: 5 },  // N°
          { wch: 15 }, // Fecha Pago
          { wch: 15 }, // Período Inicio
          { wch: 15 }, // Período Fin
          { wch: 18 }, // Horas Trabajadas
          { wch: 20 }, // Monto Pagado
          { wch: 18 }, // Método de Pago
          { wch: 18 }, // N° Comprobante
          { wch: 40 }, // Notas
        ];
        ws2['!cols'] = colWidths2;
        XLSX.utils.book_append_sheet(wb, ws2, 'Pagos Realizados');
      }

      // Hoja 3: Compras
      if (comprasData.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(comprasData);
        const colWidths3 = [
          { wch: 5 },  // N°
          { wch: 15 }, // Fecha Compra
          { wch: 15 }, // Fecha Registro
          { wch: 15 }, // Monto
          { wch: 50 }, // Descripción
        ];
        ws3['!cols'] = colWidths3;
        XLSX.utils.book_append_sheet(wb, ws3, 'Compras Realizadas');
      }

      // Generar archivo
      const fechaActual = new Date().toISOString().split('T')[0];
      const nombreSanitizado = selectedUser.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `historial_${nombreSanitizado}_${fechaActual}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showSuccessToast(`Historial de ${selectedUser.name} descargado exitosamente`);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      showErrorToast('Error al generar el archivo Excel');
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

  const calcularHorasTrabajadas = (horaEntrada: string, horaSalida: string): number => {
    const [horaE, minE] = horaEntrada.split(':').map(Number);
    const [horaS, minS] = horaSalida.split(':').map(Number);
    
    const minutosEntrada = horaE * 60 + minE;
    const minutosSalida = horaS * 60 + minS;
    
    let minutosTrabajos = minutosSalida - minutosEntrada;
    
    // Si la salida es menor que la entrada, asumimos que cruzó la medianoche
    if (minutosTrabajos < 0) {
      minutosTrabajos += 24 * 60;
    }
    
    // Convertir a horas decimales y redondear a múltiplos de 0.5
    const horasDecimales = minutosTrabajos / 60;
    return Math.round(horasDecimales * 2) / 2; // Redondea a 0.5
  };

  const handleRegistrarHoras = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    const horasTrabajadas = calcularHorasTrabajadas(horasForm.horaEntrada, horasForm.horaSalida);

    if (horasTrabajadas <= 0) {
      showErrorToast('La hora de salida debe ser posterior a la hora de entrada');
      return;
    }

    try {
      const requestBody = {
        userId: selectedUser._id,
        horas: horasTrabajadas,
        fecha: horasForm.fecha,
        horaEntrada: horasForm.horaEntrada,
        horaSalida: horasForm.horaSalida,
        cumplioIncentivo: horasForm.cumplioIncentivo,
        notas: horasForm.notas
      };
      
      console.log('📤 Enviando registro de horas:', requestBody);
      
      const response = await fetch('/api/liquidaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (data.success) {
        showSuccessToast(`${horasTrabajadas}h registradas correctamente ${horasForm.cumplioIncentivo ? '✓ Con incentivo' : ''}`);
        setShowRegistrarHoras(false);
        setHorasForm({ 
          fecha: new Date().toISOString().split('T')[0], 
          horaEntrada: '08:00',
          horaSalida: '17:00',
          cumplioIncentivo: false,
          notas: '' 
        });
        fetchUsers();
      } else {
        showErrorToast(data.error || 'Error al registrar horas');
      }
    } catch (error) {
      console.error('❌ Error al registrar horas:', error);
      showErrorToast('Error al registrar horas');
    }
  };

  const handleLiquidar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    const montoBruto = (selectedUser.horasAcumuladas || 0) * (selectedUser.precioHora || 0);
    const compras = selectedUser.comprasAcumuladas || 0;
    const incentivos = (selectedUser.incentivosAcumulados || 0) * (selectedUser.montoIncentivo || 0);
    const montoNeto = montoBruto - compras + incentivos;

    let mensaje = `
      <div style="text-align:left;">
        <strong>¿Procesar liquidación de ${selectedUser.name}?</strong><br><br>

        <strong>Horas trabajadas:</strong> ${selectedUser.horasAcumuladas || 0}h × AR$ ${selectedUser.precioHora || 0}<br>
        <strong>Monto Bruto:</strong> AR$ ${montoBruto.toFixed(2)}<br>
        ${compras > 0 ? `<strong>Compras:</strong> -AR$ ${compras.toFixed(2)}<br>` : ''}
        ${(selectedUser.incentivosAcumulados || 0) > 0
          ? `<strong>Incentivos:</strong> ${selectedUser.incentivosAcumulados} días × AR$ ${selectedUser.montoIncentivo || 0} = +AR$ ${incentivos.toFixed(2)}<br>`
          : ''
        }
        <br>
        <strong style="font-size:18px;">Total Neto a Pagar: AR$ ${montoNeto.toFixed(2)}</strong>
      </div>
    `;

    const confirmed = await confirmDelete(mensaje);
    
    if (!confirmed) return;

    try {
      const response = await fetch('/api/liquidaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          periodo: liquidacionForm.periodo,
          notas: liquidacionForm.notas,
          metodoPago: liquidacionForm.metodoPago,
          nroComprobante: liquidacionForm.metodoPago === 'transferencia' ? liquidacionForm.nroComprobante : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        let mensajeExito = `Liquidación procesada: AR$ ${data.data.montoPagado.toFixed(2)}`;
        mensajeExito += ` (Bruto: AR$ ${data.data.montoBruto.toFixed(2)}`;
        if (data.data.comprasDescontadas > 0) {
          mensajeExito += ` - Compras: AR$ ${data.data.comprasDescontadas.toFixed(2)}`;
        }
        if (data.data.incentivosAplicados > 0) {
          mensajeExito += ` + Incentivos: AR$ ${data.data.incentivosAplicados.toFixed(2)}`;
        }
        mensajeExito += ')';
        
        showSuccessToast(mensajeExito);
        setShowLiquidar(false);
        setLiquidacionForm({ periodo: '7', notas: '', metodoPago: 'efectivo', nroComprobante: '' });
        fetchUsers();
      } else {
        showErrorToast(data.error || 'Error al procesar liquidación');
      }
    } catch (error) {
      showErrorToast('Error al procesar liquidación');
    }
  };

  // Filtrar y ordenar usuarios
  const filteredAndSortedUsers = users
    .filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'nombre':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'horas':
          comparison = (a.horasAcumuladas || 0) - (b.horasAcumuladas || 0);
          break;
        case 'total':
          const totalA = ((a.horasAcumuladas || 0) * (a.precioHora || 0)) - (a.comprasAcumuladas || 0) + ((a.incentivosAcumulados || 0) * (a.montoIncentivo || 0));
          const totalB = ((b.horasAcumuladas || 0) * (b.precioHora || 0)) - (b.comprasAcumuladas || 0) + ((b.incentivosAcumulados || 0) * (b.montoIncentivo || 0));
          comparison = totalA - totalB;
          break;
        case 'ultimaLiq':
          const dateA = a.ultimaLiquidacion ? new Date(a.ultimaLiquidacion).getTime() : 0;
          const dateB = b.ultimaLiquidacion ? new Date(b.ultimaLiquidacion).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'nombre' | 'horas' | 'total' | 'ultimaLiq' | 'role') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 inline-block ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando liquidaciones...</div>;
  }

  return (
    <div className="space-y-3 md:space-y-6 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-dark-900 dark:text-light-500">Liquidación de Pagos</h2>
        
        {/* Buscador */}
        <div className="w-full md:w-auto flex-1 md:max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o rol..."
              className="w-full px-4 py-2 pl-10 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
              🔍
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-dark-600 dark:text-dark-400">
        Mostrando {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'usuario' : 'usuarios'}
        {searchTerm && ` (filtrados de ${users.length} totales)`}
      </div>

      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto -mx-1 md:mx-0">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700 text-xs md:text-sm">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th 
                  className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('nombre')}
                >
                  Nombre <SortIcon field="nombre" />
                </th>
                <th 
                  className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('role')}
                >
                  Rol <SortIcon field="role" />
                </th>
                <th 
                  className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('horas')}
                >
                  Horas <SortIcon field="horas" />
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Precio/H</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Compras</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Incentivos</th>
                <th 
                  className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('total')}
                >
                  Total Neto <SortIcon field="total" />
                </th>
                <th 
                  className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('ultimaLiq')}
                >
                  Última Liq. <SortIcon field="ultimaLiq" />
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {filteredAndSortedUsers.map((user) => {
                const montoBruto = (user.horasAcumuladas || 0) * (user.precioHora || 0);
                const compras = user.comprasAcumuladas || 0;
                const incentivos = (user.incentivosAcumulados || 0) * (user.montoIncentivo || 0);
                const totalNeto = montoBruto - compras + incentivos;
                return (
                  <tr key={user._id} className="hover:bg-dark-600 dark:hover:bg-dark-600 transition-colors text-center">
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-light-500">
                      {user.name}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'vendedor' || user.role === 'seller' ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200' :
                        'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-dark-900 dark:text-light-500 font-semibold text-center">
                      {user.horasAcumuladas || 0}h
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400 text-center">
                      AR$ {user.precioHora || 0}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-error dark:text-error-400 font-semibold text-center">
                      {compras > 0 ? `-AR$ ${compras.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-success dark:text-success-400 font-semibold text-center">
                      {(user.incentivosAcumulados || 0) > 0 ? (
                        <span title={`${user.incentivosAcumulados} días × AR$ ${user.montoIncentivo || 0}`}>
                          ✓ {user.incentivosAcumulados} 
                          {incentivos > 0 ? (
                            <span className="text-xs ml-1">(+AR$ {incentivos.toFixed(2)})</span>
                          ) : (
                            <span className="text-xs ml-1 text-warning" title="Configure el monto de incentivo en el perfil del usuario">⚠️ AR$ 0</span>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      AR$ {totalNeto.toFixed(2)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400 text-center">
                      {user.ultimaLiquidacion 
                        ? new Date(user.ultimaLiquidacion).toLocaleDateString()
                        : 'Nunca'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRegistrarHoras(true);
                        }}
                        className="text-secondary hover:text-secondary-700 font-semibold transition-colors cursor-pointer"
                      >
                        + Hs
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRegistrarCompra(true);
                        }}
                        className="text-secondary hover:text-secondary-700 font-semibold transition-colors cursor-pointer"
                      >
                        + Compra
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowLiquidar(true);
                        }}
                        className="text-secondary hover:text-secondary-700 font-semibold transition-colors cursor-pointer"
                        disabled={!user.horasAcumuladas || user.horasAcumuladas === 0}
                      >
                        Liquidar
                      </button>
                      <button
                        onClick={() => handleVerHistorial(user)}
                        className="text-secondary hover:text-secondary-700 font-semibold transition-colors cursor-pointer"
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

        {users.length > 0 && filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No se encontraron resultados para "{searchTerm}"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Hora de Entrada
                  </label>
                  <input
                    type="time"
                    value={horasForm.horaEntrada}
                    onChange={(e) => setHorasForm({ ...horasForm, horaEntrada: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Hora de Salida
                  </label>
                  <input
                    type="time"
                    value={horasForm.horaSalida}
                    onChange={(e) => setHorasForm({ ...horasForm, horaSalida: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
                <div className="text-sm text-dark-700 dark:text-dark-300">
                  <strong>Horas a registrar:</strong> {calcularHorasTrabajadas(horasForm.horaEntrada, horasForm.horaSalida)}h
                </div>
                <div className="text-xs text-dark-600 dark:text-dark-400 mt-1">
                  💡 Las horas se redondean a múltiplos de 0.5h (ej: 9.3h → 9.5h)
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={horasForm.cumplioIncentivo}
                    onChange={(e) => setHorasForm({ ...horasForm, cumplioIncentivo: e.target.checked })}
                    className="w-5 h-5 text-primary border-dark-300 dark:border-dark-600 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                    ✓ Cumplió con el incentivo del día
                  </span>
                </label>
                <div className="text-xs text-dark-600 dark:text-dark-400 mt-1 ml-7">
                  Se sumará un bono adicional al momento de liquidar
                </div>
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
                  placeholder="Ej: Turno mañana, dobló turno, etc."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegistrarHoras(false);
                    setHorasForm({ 
                      fecha: new Date().toISOString().split('T')[0], 
                      horaEntrada: '08:00',
                      horaSalida: '17:00',
                      cumplioIncentivo: false,
                      notas: '' 
                    });
                  }}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary hover:bg-secondary-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
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
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-error hover:bg-error-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
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
                {(selectedUser.incentivosAcumulados || 0) > 0 && (
                  <div className="flex justify-between flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-success dark:text-success-400">Incentivos cumplidos:</span>
                      <span className={`font-bold ${(selectedUser.montoIncentivo || 0) > 0 ? 'text-success dark:text-success-400' : 'text-warning'}`}>
                        +AR$ {((selectedUser.incentivosAcumulados || 0) * (selectedUser.montoIncentivo || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-dark-600 dark:text-dark-400">
                      ({selectedUser.incentivosAcumulados} días × AR$ {selectedUser.montoIncentivo || 0})
                    </div>
                    {!(selectedUser.montoIncentivo || 0) && (
                      <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded p-2 text-xs text-warning-700 dark:text-warning-400">
                        ⚠️ El monto de incentivo está en AR$ 0. Configure el monto en la gestión de usuarios.
                      </div>
                    )}
                  </div>
                )}
                <div className="border-t-2 border-primary-300 dark:border-primary-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-dark-700 dark:text-dark-300 font-semibold">Total Neto a pagar:</span>
                    <span className="font-bold text-primary">
                      AR$ {(((selectedUser.horasAcumuladas || 0) * (selectedUser.precioHora || 0)) - (selectedUser.comprasAcumuladas || 0) + ((selectedUser.incentivosAcumulados || 0) * (selectedUser.montoIncentivo || 0))).toFixed(2)}
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
                  Método de Pago <span className="text-error">*</span>
                </label>
                <select
                  value={liquidacionForm.metodoPago}
                  onChange={(e) => setLiquidacionForm({ ...liquidacionForm, metodoPago: e.target.value as 'efectivo' | 'transferencia', nroComprobante: e.target.value === 'efectivo' ? '' : liquidacionForm.nroComprobante })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                </select>
              </div>
              {liquidacionForm.metodoPago === 'transferencia' && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Número de Comprobante <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={liquidacionForm.nroComprobante}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, nroComprobante: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    placeholder="Ej: 123456789"
                    required
                  />
                </div>
              )}
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
                    setLiquidacionForm({ periodo: '7', notas: '', metodoPago: 'efectivo', nroComprobante: '' });
                  }}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
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
                        {pago.metodoPago && (
                          <div className="text-xs text-dark-600 dark:text-dark-400 mt-1">
                            {pago.metodoPago === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia'}
                            {pago.metodoPago === 'transferencia' && pago.nroComprobante && (
                              <span className="ml-1">- #{pago.nroComprobante}</span>
                            )}
                          </div>
                        )}
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
            
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-dark-200 dark:border-dark-700">
              <button
                onClick={handleExportarHistorial}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                disabled={historial.length === 0 && historialCompras.length === 0}
              >
                📊 Exportar a Excel
              </button>
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
