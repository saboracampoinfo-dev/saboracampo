'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StockAlertsBadge() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlertCount();
    
    // Actualizar cada 2 minutos
    const interval = setInterval(fetchAlertCount, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAlertCount = async () => {
    try {
      const response = await fetch('/api/stock-alerts?estado=pendiente');
      const data = await response.json();
      if (data.success) {
        setCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error al obtener alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || count === 0) {
    return null;
  }

  return (
    <Link 
      href="/dashboardAdmin?tab=alerts"
      className="relative inline-flex items-center"
      title={`${count} alerta${count > 1 ? 's' : ''} pendiente${count > 1 ? 's' : ''}`}
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
      </span>
      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-error rounded-full">
        {count > 99 ? '99+' : count}
      </span>
    </Link>
  );
}
