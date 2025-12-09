import mongoose, { Document, Schema } from 'mongoose';

export interface IProductoOrden {
  productoId: mongoose.Types.ObjectId;
  nombre: string;
  codigoBarras?: string; // Opcional
  cantidad: number;
  precio: number;
  subtotal: number;
  imagen?: string;
  unidadMedida?: string; // 'kg', 'unidad', 'litro', etc.
  gramos?: number; // Para productos vendidos por kg (100, 250, 500, 750, etc.)
}

export interface IOrden extends Document {
  numeroOrden: string;
  vendedor: {
    id: mongoose.Types.ObjectId;
    nombre: string;
    email: string;
  };
  sucursal?: {
    id: mongoose.Types.ObjectId;
    nombre: string;
  };
  productos: IProductoOrden[];
  total: number;
  estado: 'en_proceso' | 'pendiente_cobro' | 'completada' | 'cancelada';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date;
  fechaCompletada?: Date;
  cajero?: {
    id: mongoose.Types.ObjectId;
    nombre: string;
  };
  metodoPago?: string;
  notas?: string;
}

const ProductoOrdenSchema = new Schema({
  productoId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  nombre: { 
    type: String, 
    required: true 
  },
  codigoBarras: { 
    type: String
    // Completamente opcional - sin required ni default
  },
  cantidad: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1
  },
  precio: { 
    type: Number, 
    required: true,
    min: 0
  },
  subtotal: { 
    type: Number, 
    required: true,
    min: 0
  },
  imagen: { 
    type: String 
  },
  unidadMedida: {
    type: String
  },
  gramos: {
    type: Number,
    min: 0
  }
}, { _id: false });

const OrdenSchema = new Schema({
  numeroOrden: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vendedor: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    nombre: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  sucursal: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Sucursal'
    },
    nombre: {
      type: String
    }
  },
  productos: {
    type: [ProductoOrdenSchema],
    default: []
  },
  total: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  estado: {
    type: String,
    enum: ['en_proceso', 'pendiente_cobro', 'completada', 'cancelada'],
    default: 'en_proceso',
    index: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
    index: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  fechaCierre: {
    type: Date
  },
  fechaCompletada: {
    type: Date
  },
  cajero: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    nombre: {
      type: String
    }
  },
  metodoPago: {
    type: String
  },
  notas: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: { 
    createdAt: 'fechaCreacion', 
    updatedAt: 'fechaActualizacion' 
  }
});

// Índices compuestos para búsquedas eficientes
OrdenSchema.index({ 'vendedor.id': 1, estado: 1, fechaCreacion: -1 });
OrdenSchema.index({ estado: 1, fechaCreacion: -1 });
OrdenSchema.index({ numeroOrden: 1 });

// Método para generar número de orden único
OrdenSchema.statics.generarNumeroOrden = async function() {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const prefijo = `ORD-${año}${mes}${dia}`;
  
  // Buscar el último número de orden del día
  const ultimaOrden = await this.findOne({
    numeroOrden: new RegExp(`^${prefijo}`)
  }).sort({ numeroOrden: -1 });

  let secuencia = 1;
  if (ultimaOrden) {
    const ultimoNumero = parseInt(ultimaOrden.numeroOrden.split('-').pop() || '0');
    secuencia = ultimoNumero + 1;
  }

  return `${prefijo}-${secuencia.toString().padStart(4, '0')}`;
};

// Método para calcular total
OrdenSchema.methods.calcularTotal = function() {
  this.total = this.productos.reduce((sum: number, prod: IProductoOrden) => sum + prod.subtotal, 0);
  return this.total;
};

// Middleware pre-save para actualizar fechas según estado
OrdenSchema.pre('save', function(next) {
  if (this.isModified('estado')) {
    if (this.estado === 'pendiente_cobro' && !this.fechaCierre) {
      this.fechaCierre = new Date();
    }
    if (this.estado === 'completada' && !this.fechaCompletada) {
      this.fechaCompletada = new Date();
    }
  }
  next();
});

// Limpiar el modelo del cache si existe para evitar problemas de validación
if (mongoose.models.Orden) {
  delete mongoose.models.Orden;
}

const Orden = mongoose.model<IOrden>('Orden', OrdenSchema);

export default Orden;
