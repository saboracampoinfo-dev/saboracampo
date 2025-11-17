/**
 * Ejemplo de datos para crear sucursales
 * Úsalos para hacer POST a /api/sucursales
 */

export const sucursalesEjemplo = [
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
      principal: 'https://res.cloudinary.com/demo/image/upload/sucursal-centro-principal.jpg',
      galeria: [
        'https://res.cloudinary.com/demo/image/upload/sucursal-centro-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/sucursal-centro-2.jpg',
        'https://res.cloudinary.com/demo/image/upload/sucursal-centro-3.jpg',
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
      principal: 'https://res.cloudinary.com/demo/image/upload/sucursal-norte-principal.jpg',
      galeria: [
        'https://res.cloudinary.com/demo/image/upload/sucursal-norte-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/sucursal-norte-2.jpg',
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
      principal: 'https://res.cloudinary.com/demo/image/upload/sucursal-sur-principal.jpg',
      galeria: [
        'https://res.cloudinary.com/demo/image/upload/sucursal-sur-1.jpg',
        'https://res.cloudinary.com/demo/image/upload/sucursal-sur-2.jpg',
        'https://res.cloudinary.com/demo/image/upload/sucursal-sur-3.jpg',
        'https://res.cloudinary.com/demo/image/upload/sucursal-sur-4.jpg',
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

// Ejemplo de cómo usar los datos
export const ejemploUso = `
// Para crear una sucursal, hacer POST a /api/sucursales con:
fetch('/api/sucursales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(sucursalesEjemplo[0])
});

// Para obtener todas las sucursales activas:
fetch('/api/sucursales?estado=activa');

// Para obtener sucursales por ciudad:
fetch('/api/sucursales?ciudad=Buenos Aires');

// Para obtener una sucursal específica:
fetch('/api/sucursales/[id]');

// Para actualizar una sucursal:
fetch('/api/sucursales/[id]', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    estado: 'mantenimiento',
    'horarios.observaciones': 'Cerrado por remodelación'
  })
});

// Para eliminar una sucursal:
fetch('/api/sucursales/[id]', {
  method: 'DELETE'
});
`;
