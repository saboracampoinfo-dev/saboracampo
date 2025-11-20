import mongoose, { Schema, Model } from 'mongoose';

export interface IStockAlert {
  _id: string;
  productoId: string;
  productoNombre: string;
  sucursalId: string;
  sucursalNombre: string;
  stockActual: number;
  stockMinimo: number;
  tipo: 'critico' | 'bajo' | 'agotado';
  estado: 'pendiente' | 'revisado' | 'resuelto';
  notificadoA: string[]; // Array de IDs de usuarios notificados
  mensaje?: string;
  createdAt: Date;
  updatedAt: Date;
  resueltoPor?: string;
  resueltaEn?: Date;
}

const StockAlertSchema = new Schema<IStockAlert>(
  {
    productoId: {
      type: String,
      required: [true, 'El ID del producto es requerido'],
      index: true,
    },
    productoNombre: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      trim: true,
    },
    sucursalId: {
      type: String,
      required: [true, 'El ID de la sucursal es requerido'],
      index: true,
    },
    sucursalNombre: {
      type: String,
      required: [true, 'El nombre de la sucursal es requerido'],
      trim: true,
    },
    stockActual: {
      type: Number,
      required: [true, 'El stock actual es requerido'],
      min: [0, 'El stock actual no puede ser negativo'],
    },
    stockMinimo: {
      type: Number,
      required: [true, 'El stock mínimo es requerido'],
      min: [0, 'El stock mínimo no puede ser negativo'],
    },
    tipo: {
      type: String,
      enum: {
        values: ['critico', 'bajo', 'agotado'],
        message: 'El tipo debe ser: critico, bajo o agotado',
      },
      required: [true, 'El tipo de alerta es requerido'],
      index: true,
    },
    estado: {
      type: String,
      enum: {
        values: ['pendiente', 'revisado', 'resuelto'],
        message: 'El estado debe ser: pendiente, revisado o resuelto',
      },
      default: 'pendiente',
      index: true,
    },
    notificadoA: {
      type: [String],
      default: [],
    },
    mensaje: {
      type: String,
      trim: true,
    },
    resueltoPor: {
      type: String,
      trim: true,
    },
    resueltaEn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices compuestos para búsquedas optimizadas
StockAlertSchema.index({ productoId: 1, sucursalId: 1, estado: 1 });
StockAlertSchema.index({ tipo: 1, estado: 1 });
StockAlertSchema.index({ createdAt: -1 });

// Método estático para crear alerta automáticamente
StockAlertSchema.statics.crearAlerta = async function(
  productoId: string,
  productoNombre: string,
  sucursalId: string,
  sucursalNombre: string,
  stockActual: number,
  stockMinimo: number
) {
  // Determinar tipo de alerta
  let tipo: 'critico' | 'bajo' | 'agotado';
  if (stockActual === 0) {
    tipo = 'agotado';
  } else if (stockActual <= stockMinimo * 0.5) {
    tipo = 'critico';
  } else {
    tipo = 'bajo';
  }

  // Verificar si ya existe una alerta pendiente para este producto y sucursal
  const alertaExistente = await this.findOne({
    productoId,
    sucursalId,
    estado: 'pendiente',
  });

  if (alertaExistente) {
    // Actualizar alerta existente
    alertaExistente.stockActual = stockActual;
    alertaExistente.tipo = tipo;
    await alertaExistente.save();
    return alertaExistente;
  }

  // Crear nueva alerta
  const mensaje = tipo === 'agotado' 
    ? `El producto "${productoNombre}" está AGOTADO en "${sucursalNombre}"`
    : tipo === 'critico'
    ? `El producto "${productoNombre}" está en nivel CRÍTICO en "${sucursalNombre}" (${stockActual} unidades)`
    : `El producto "${productoNombre}" está por debajo del stock mínimo en "${sucursalNombre}" (${stockActual}/${stockMinimo} unidades)`;

  return await this.create({
    productoId,
    productoNombre,
    sucursalId,
    sucursalNombre,
    stockActual,
    stockMinimo,
    tipo,
    mensaje,
  });
};

// Método para resolver alerta
StockAlertSchema.methods.resolver = async function(userId: string) {
  this.estado = 'resuelto';
  this.resueltoPor = userId;
  this.resueltaEn = new Date();
  return await this.save();
};

// Prevent model recompilation in development
const StockAlert: Model<IStockAlert> = 
  mongoose.models.StockAlert || mongoose.model<IStockAlert>('StockAlert', StockAlertSchema);

export default StockAlert;
