'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { showErrorToast, showInfoToast } from '@/utils/toastHelpers';

interface BarcodeScannerProps {
  onScan: (codigo: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function BarcodeScanner({ onScan, disabled = false, placeholder = "Escanea código de barras" }: BarcodeScannerProps) {
  const [codigoBarras, setCodigoBarras] = useState('');
  const [scannerActivo, setScannerActivo] = useState(false);
  const [camaras, setCamaras] = useState<any[]>([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus en el input cuando no está escaneando
  useEffect(() => {
    if (inputRef.current && !disabled && !scannerActivo) {
      inputRef.current.focus();
    }
  }, [disabled, scannerActivo]);

  // Obtener lista de cámaras disponibles
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCamaras(devices);
        // Preferir cámara trasera si está disponible
        const camaraTrasera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
        setCamaraSeleccionada(camaraTrasera?.id || devices[0].id);
      }
    }).catch(err => {
      console.error('Error al obtener cámaras:', err);
    });

    // Cleanup al desmontar
    return () => {
      if (scannerRef.current && scannerActivo) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const iniciarScanner = async () => {
    if (!camaraSeleccionada) {
      showErrorToast('No se detectó ninguna cámara');
      return;
    }

    // Primero activamos el estado para que React cree el contenedor DOM
    setScannerActivo(true);

    // Esperamos a que el DOM se actualice
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("barcode-scanner-container");
        scannerRef.current = scanner;

        await scanner.start(
          camaraSeleccionada,
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778
          },
          (decodedText) => {
            // Código escaneado exitosamente
            onScan(decodedText);
            // Vibrar si está disponible
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            // Reproducir sonido de éxito
            const audio = new Audio('data:audio/wav;base64,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') as any;
            audio.play().catch(() => {});
          },
          (errorMessage) => {
            // Error al escanear (normal cuando no hay código visible)
          }
        );

        showInfoToast('Cámara activada. Apunta al código de barras');
      } catch (err: any) {
        console.error('Error al iniciar scanner:', err);
        showErrorToast('Error al iniciar cámara: ' + (err.message || 'Error desconocido'));
        setScannerActivo(false); // Revertir el estado si falla
      }
    }, 100); // Pequeño delay para asegurar que el DOM está listo
  };

  const detenerScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setScannerActivo(false);
        showInfoToast('Cámara desactivada');
      } catch (err) {
        console.error('Error al detener scanner:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoBarras.trim()) {
      onScan(codigoBarras.trim());
      setCodigoBarras('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Input manual y botón de cámara */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={codigoBarras}
          onChange={(e) => setCodigoBarras(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || scannerActivo}
          className="flex-1 px-2 md:px-4 py-3 border border-dark-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-800 dark:text-light-500 text-lg disabled:opacity-50"
        />
        
        {!scannerActivo ? (
          <>
            <button
              type="submit"
              disabled={disabled || !codigoBarras.trim()}
              className="bg-primary hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed text-white px-2 md:px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap"
            >
              ➕ Agregar
            </button>
            
            {camaras.length > 0 && (
              <button
                type="button"
                onClick={iniciarScanner}
                disabled={disabled}
                className="cursor-pointer bg-green-500 hover:bg-green-700 disabled:bg-dark-300 disabled:cursor-not-allowed text-white px-2 md:px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2"
              >
                📷 Cámara
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={detenerScanner}
            className="bg-error-light hover:bg-error-dark text-white px-2 md:px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap"
          >
            ✕ Cerrar
          </button>
        )}
      </form>

      {/* Selector de cámara (si hay múltiples) */}
      {camaras.length > 1 && !scannerActivo && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-dark-600 dark:text-dark-400">
            Cámara:
          </label>
          <select
            value={camaraSeleccionada}
            onChange={(e) => setCamaraSeleccionada(e.target.value)}
            className="flex-1 px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-800 dark:text-light-500"
          >
            {camaras.map((camara) => (
              <option key={camara.id} value={camara.id}>
                {camara.label || `Cámara ${camara.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Contenedor del scanner */}
      {scannerActivo && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div 
            id="barcode-scanner-container" 
            ref={scannerContainerRef}
            className="w-full"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-2 text-sm">
            Apunta la cámara al código de barras
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="text-sm text-dark-600 dark:text-dark-400">
        💡 <strong>Tres formas de escanear:</strong>
        <ul className="mt-1 ml-4 space-y-1">
          <li>• Usa un lector de código de barras físico</li>
          <li>• Escribe el código manualmente</li>
          {camaras.length > 0 && <li>• Usa el botón "📷 Cámara" para escanear con la cámara web</li>}
        </ul>
      </div>
    </div>
  );
}
