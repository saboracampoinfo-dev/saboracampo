/**
 * Script para insertar sucursales de ejemplo en la base de datos
 * Ejecutar con: node scripts/seed-sucursales.js
 * 
 * Asegúrate de que el servidor esté corriendo en http://localhost:3000
 */

const sucursalesEjemplo = [
  {
    nombre: 'Sabor a Campo Centro',
    descripcion: 'Nuestra sucursal principal en el centro de la ciudad',
    direccion: {
      calle: 'Av. Principal',
      numero: '1234',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: 'C1000',
      coordenadas: {
        latitud: -34.6037,
        longitud: -58.3816,
      },
    },
    contacto: {
      telefono: '+54 11 1234-5678',
      telefonoAlternativo: '+54 11 1234-5679',
      email: 'centro@saboracampo.com',
      whatsapp: '+5491112345678',
    },
    horarios: {
      semanal: {
        lunes: { apertura: '08:00', cierre: '20:00', cerrado: false },
        martes: { apertura: '08:00', cierre: '20:00', cerrado: false },
        miercoles: { apertura: '08:00', cierre: '20:00', cerrado: false },
        jueves: { apertura: '08:00', cierre: '20:00', cerrado: false },
        viernes: { apertura: '08:00', cierre: '20:00', cerrado: false },
      },
      finDeSemana: {
        sabado: { apertura: '09:00', cierre: '20:00', cerrado: false },
        domingo: { apertura: '09:00', cierre: '14:00', cerrado: false },
      },
      observaciones: 'Horario especial en días festivos: 10:00 - 14:00',
    },
    imagenes: {
      principal: 'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
      galeria: [
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
      ],
    },
    estado: 'activa',
    capacidad: 50,
    servicios: ['estacionamiento', 'wifi', 'delivery', 'pago con tarjeta', 'aire acondicionado'],
    encargado: {
      nombre: 'Juan Pérez',
      telefono: '+54 11 9999-8888',
      email: 'juan.perez@saboracampo.com',
    },
  },
  {
    nombre: 'Sabor a Campo Norte',
    descripcion: 'Sucursal en zona norte con amplio estacionamiento',
    direccion: {
      calle: 'Calle Libertad',
      numero: '567',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: 'C1425',
      coordenadas: {
        latitud: -34.5600,
        longitud: -58.4500,
      },
    },
    contacto: {
      telefono: '+54 11 2345-6789',
      email: 'norte@saboracampo.com',
      whatsapp: '+5491123456789',
    },
    horarios: {
      semanal: {
        lunes: { apertura: '08:00', cierre: '20:00', cerrado: false },
        martes: { apertura: '08:00', cierre: '20:00', cerrado: false },
        miercoles: { apertura: '08:00', cierre: '20:00', cerrado: false },
        jueves: { apertura: '08:00', cierre: '20:00', cerrado: false },
        viernes: { apertura: '08:00', cierre: '20:00', cerrado: false },
      },
      finDeSemana: {
        sabado: { apertura: '08:00', cierre: '20:00', cerrado: false },
        domingo: { apertura: '09:00', cierre: '14:00', cerrado: false },
      },
    },
    imagenes: {
      principal: 'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
      galeria: [
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
      ],
    },
    estado: 'activa',
    capacidad: 75,
    servicios: ['estacionamiento', 'wifi', 'delivery', 'pago con tarjeta', 'accesibilidad'],
    encargado: {
      nombre: 'María González',
      telefono: '+54 11 8888-7777',
      email: 'maria.gonzalez@saboracampo.com',
    },
  },
  {
    nombre: 'Sabor a Campo Sur',
    descripcion: 'Nueva sucursal en zona sur de la ciudad',
    direccion: {
      calle: 'Av. del Campo',
      numero: '890',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: 'C1280',
      coordenadas: {
        latitud: -34.6500,
        longitud: -58.3700,
      },
    },
    contacto: {
      telefono: '+54 11 3456-7890',
      email: 'sur@saboracampo.com',
      whatsapp: '+5491134567890',
    },
    horarios: {
      semanal: {
        lunes: { apertura: '08:00', cierre: '20:00', cerrado: false },
        martes: { apertura: '08:00', cierre: '20:00', cerrado: false },
        miercoles: { apertura: '08:00', cierre: '20:00', cerrado: false },
        jueves: { apertura: '08:00', cierre: '20:00', cerrado: false },
        viernes: { apertura: '08:00', cierre: '20:00', cerrado: false },
      },
      finDeSemana: {
        sabado: { apertura: '08:00', cierre: '20:00', cerrado: false },
        domingo: { apertura: '09:00', cierre: '14:00', cerrado: false },
      },
    },
    imagenes: {
      principal: 'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
      galeria: [
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1574614819/sample.jpg',
      ],
    },
    estado: 'activa',
    capacidad: 60,
    servicios: ['estacionamiento', 'delivery', 'pago con tarjeta', 'aire acondicionado'],
    encargado: {
      nombre: 'Carlos Rodríguez',
      telefono: '+54 11 7777-6666',
      email: 'carlos.rodriguez@saboracampo.com',
    },
  },
];

async function seedSucursales() {
  try {
    console.log('🌱 Iniciando seed de sucursales...\n');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Verificar las sucursales existentes
    console.log('📊 Verificando sucursales existentes...');
    const checkResponse = await fetch(`${baseUrl}/api/sucursales`);
    const existingData = await checkResponse.json();
    
    console.log(`   Sucursales encontradas: ${existingData.total || 0}\n`);
    
    if (existingData.total > 0) {
      console.log('⚠️  Ya hay sucursales en la base de datos.');
      console.log('   El script continuará y agregará las sucursales de ejemplo...\n');
    }
    
    // Insertar las sucursales de ejemplo
    let creadas = 0;
    let errores = 0;
    
    for (let i = 0; i < sucursalesEjemplo.length; i++) {
      const sucursal = sucursalesEjemplo[i];
      console.log(`📍 [${i + 1}/${sucursalesEjemplo.length}] Creando: ${sucursal.nombre}...`);
      
      const response = await fetch(`${baseUrl}/api/sucursales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sucursal),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ Creada exitosamente\n`);
        creadas++;
      } else {
        console.error(`   ❌ Error: ${result.error}`);
        if (result.details) {
          console.error('   Detalles:', result.details);
        }
        console.log('');
        errores++;
      }
    }
    
    // Verificar el resultado final
    const finalResponse = await fetch(`${baseUrl}/api/sucursales`);
    const finalData = await finalResponse.json();
    
    console.log('═══════════════════════════════════════');
    console.log('✨ Seed completado!');
    console.log(`📊 Total en base de datos: ${finalData.total}`);
    console.log(`✅ Creadas: ${creadas}`);
    if (errores > 0) {
      console.log(`❌ Errores: ${errores}`);
    }
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    console.error('\n⚠️  Asegúrate de que el servidor esté corriendo en http://localhost:3000');
    process.exit(1);
  }
}

// Ejecutar el seed
seedSucursales();
