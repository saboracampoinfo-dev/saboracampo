/**
 * Script para insertar sucursales de ejemplo en la base de datos
 * Ejecutar con: npx ts-node scripts/seed-sucursales.ts
 */

import { sucursalesEjemplo } from '../src/models/sucursalesEjemplo';

async function seedSucursales() {
  try {
    console.log('🌱 Iniciando seed de sucursales...');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Verificar las sucursales existentes
    const checkResponse = await fetch(`${baseUrl}/api/sucursales`);
    const existingData = await checkResponse.json();
    
    console.log(`📊 Sucursales existentes: ${existingData.total || 0}`);
    
    if (existingData.total > 0) {
      console.log('⚠️  Ya hay sucursales en la base de datos.');
      console.log('¿Deseas continuar y agregar más? (El script continuará en 5 segundos)');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Insertar las sucursales de ejemplo
    for (let i = 0; i < sucursalesEjemplo.length; i++) {
      const sucursal = sucursalesEjemplo[i];
      console.log(`\n📍 Creando sucursal ${i + 1}/${sucursalesEjemplo.length}: ${sucursal.nombre}...`);
      
      const response = await fetch(`${baseUrl}/api/sucursales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sucursal),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${sucursal.nombre} creada exitosamente`);
      } else {
        console.error(`❌ Error al crear ${sucursal.nombre}:`, result.error);
        if (result.details) {
          console.error('Detalles:', result.details);
        }
      }
    }
    
    // Verificar el resultado final
    const finalResponse = await fetch(`${baseUrl}/api/sucursales`);
    const finalData = await finalResponse.json();
    
    console.log(`\n✨ Seed completado!`);
    console.log(`📊 Total de sucursales en la base de datos: ${finalData.total}`);
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar el seed
seedSucursales();
