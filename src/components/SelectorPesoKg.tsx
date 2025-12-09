'use client';

import { useState, useEffect } from 'react';

interface SelectorPesoKgProps {
  precioKilo: number;
  nombreProducto: string;
  onConfirm: (gramos: number, subtotal: number) => void;
  onCancel: () => void;
  gramosIniciales?: number;
}

const OPCIONES_PREDEFINIDAS = [100, 250, 500, 750];

export default function SelectorPesoKg({ 
  precioKilo, 
  nombreProducto, 
  onConfirm, 
  onCancel,
  gramosIniciales = 250 
}: SelectorPesoKgProps) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | 'custom'>(
    OPCIONES_PREDEFINIDAS.includes(gramosIniciales) ? gramosIniciales : 'custom'
  );
  const [gramosCustom, setGramosCustom] = useState(
    OPCIONES_PREDEFINIDAS.includes(gramosIniciales) ? '' : gramosIniciales.toString()
  );

  const calcularPrecio = (gramos: number): number => {
    return (precioKilo * gramos) / 1000;
  };

  const getGramosActuales = (): number => {
    if (opcionSeleccionada === 'custom') {
      return parseInt(gramosCustom) || 0;
    }
    return opcionSeleccionada as number;
  };

  const handleConfirmar = () => {
    const gramos = getGramosActuales();
    if (gramos > 0) {
      const subtotal = calcularPrecio(gramos);
      onConfirm(gramos, subtotal);
    }
  };

  const gramosActuales = getGramosActuales();
  const subtotalActual = calcularPrecio(gramosActuales);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-dark-900 dark:text-light-500 mb-2">
            ⚖️ Seleccionar Cantidad
          </h3>
          <p className="text-dark-600 dark:text-dark-400 text-sm">
            {nombreProducto}
          </p>
          <p className="text-primary font-semibold mt-1">
            Precio por kilo: ${precioKilo.toLocaleString('es-CL')}
          </p>
        </div>

        {/* Opciones predefinidas */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
            Selecciona una cantidad:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {OPCIONES_PREDEFINIDAS.map((gramos) => (
              <button
                key={gramos}
                onClick={() => setOpcionSeleccionada(gramos)}
                className={`
                  py-3 px-4 rounded-lg font-semibold transition-all
                  ${opcionSeleccionada === gramos
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
                  }
                `}
              >
                {gramos}gr
                <div className="text-xs opacity-80 mt-1">
                  ${calcularPrecio(gramos).toLocaleString('es-CL')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cantidad personalizada */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
            O ingresa una cantidad personalizada:
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="10000"
              value={gramosCustom}
              onChange={(e) => {
                setGramosCustom(e.target.value);
                setOpcionSeleccionada('custom');
              }}
              onFocus={() => setOpcionSeleccionada('custom')}
              placeholder="Ej: 150"
              className={`
                flex-1 px-4 py-2 rounded-lg border-2 transition-all
                ${opcionSeleccionada === 'custom'
                  ? 'border-primary bg-white dark:bg-dark-800'
                  : 'border-dark-300 dark:border-dark-600 bg-dark-50 dark:bg-dark-800'
                }
                text-dark-900 dark:text-light-500
                focus:outline-none focus:border-primary
              `}
            />
            <div className="flex items-center px-3 bg-dark-100 dark:bg-dark-600 rounded-lg">
              <span className="text-dark-700 dark:text-dark-300 font-semibold">gr</span>
            </div>
          </div>
          {opcionSeleccionada === 'custom' && gramosCustom && parseInt(gramosCustom) > 0 && (
            <p className="text-sm text-primary font-semibold mt-2">
              Subtotal: ${calcularPrecio(parseInt(gramosCustom)).toLocaleString('es-CL')}
            </p>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-dark-600 dark:text-dark-400">Cantidad seleccionada:</div>
              <div className="text-lg font-bold text-dark-900 dark:text-light-500">
                {gramosActuales > 0 ? `${gramosActuales}gr` : '--'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-dark-600 dark:text-dark-400">Total a pagar:</div>
              <div className="text-2xl font-bold text-primary">
                ${gramosActuales > 0 ? subtotalActual.toLocaleString('es-CL') : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-dark-300 hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-white px-4 py-3 rounded-lg font-semibold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={gramosActuales === 0}
            className="flex-1 bg-success-light hover:bg-success-dark disabled:bg-dark-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
