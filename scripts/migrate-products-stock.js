const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Conectar a MongoDB
async function migrateProducts() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Definir schemas inline para evitar problemas de importación
    const SucursalSchema = new mongoose.Schema({
      nombre: String,
      estado: String,
    });

    const ProductSchema = new mongoose.Schema({
      nombre: String,
      stock: Number,
      stockMinimo: Number,
      stockPorSucursal: [{
        sucursalId: String,
        sucursalNombre: String,
        cantidad: Number,
        stockMinimo: Number,
      }],
    }, { strict: false });

    const Sucursal = mongoose.models.Sucursal || mongoose.model('Sucursal', SucursalSchema);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    // Buscar sucursal central
    console.log('\n🔍 Buscando sucursal central...');
    let sucursalCentral = await Sucursal.findOne({ 
      nombre: { $regex: /central/i },
      estado: 'activa'
    });

    if (!sucursalCentral) {
      console.log('⚠️  No se encontró sucursal central activa');
      console.log('📝 Buscando cualquier sucursal activa...');
      
      sucursalCentral = await Sucursal.findOne({ estado: 'activa' });
      
      if (!sucursalCentral) {
        console.log('❌ No hay sucursales activas. Creando sucursal central...');
        
        sucursalCentral = await Sucursal.create({
          nombre: 'Sucursal Central',
          descripcion: 'Sucursal principal - Punto de entrada de productos',
          direccion: {
            calle: 'Principal',
            numero: '100',
            ciudad: 'Ciudad',
            provincia: 'Provincia',
            codigoPostal: '0000',
          },
          contacto: {
            telefono: '0000000000',
            email: 'central@saboracampo.com',
          },
          horarios: {
            semanal: {
              lunes: { apertura: '08:00', cierre: '18:00', cerrado: false },
              martes: { apertura: '08:00', cierre: '18:00', cerrado: false },
              miercoles: { apertura: '08:00', cierre: '18:00', cerrado: false },
              jueves: { apertura: '08:00', cierre: '18:00', cerrado: false },
              viernes: { apertura: '08:00', cierre: '18:00', cerrado: false },
            },
            finDeSemana: {
              sabado: { apertura: '08:00', cierre: '13:00', cerrado: false },
              domingo: { apertura: '08:00', cierre: '13:00', cerrado: true },
            },
          },
          imagenes: {
            principal: 'https://via.placeholder.com/400',
            galeria: [],
          },
          estado: 'activa',
          servicios: ['estacionamiento', 'wifi', 'delivery'],
        });
        
        console.log('✅ Sucursal Central creada');
      }
    }

    console.log(`✅ Usando sucursal: ${sucursalCentral.nombre}`);

    // Buscar productos sin stockPorSucursal o con array vacío
    console.log('\n🔍 Buscando productos para migrar...');
    const productos = await Product.find({
      $or: [
        { stockPorSucursal: { $exists: false } },
        { stockPorSucursal: { $size: 0 } },
        { stockPorSucursal: null }
      ]
    });

    console.log(`📦 Encontrados ${productos.length} productos para migrar\n`);

    if (productos.length === 0) {
      console.log('✅ No hay productos que migrar. Todos tienen stockPorSucursal configurado.');
      await mongoose.disconnect();
      return;
    }

    // Migrar cada producto
    let migrados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        const stockActual = producto.stock || 0;
        const stockMinimoActual = producto.stockMinimo || 5;

        producto.stockPorSucursal = [{
          sucursalId: sucursalCentral._id.toString(),
          sucursalNombre: sucursalCentral.nombre,
          cantidad: stockActual,
          stockMinimo: stockMinimoActual
        }];

        await producto.save();
        migrados++;
        console.log(`✅ [${migrados}/${productos.length}] ${producto.nombre} - Stock: ${stockActual}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando ${producto.nombre}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(50));
    console.log(`✅ Productos migrados: ${migrados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`🏢 Sucursal asignada: ${sucursalCentral.nombre}`);
    console.log('='.repeat(50));

    await mongoose.disconnect();
    console.log('\n✅ Migración completada');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de productos a sistema multi-sucursal...\n');
migrateProducts();
