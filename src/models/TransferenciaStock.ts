import mongoose, { Schema, Document } from 'mongoose';

export interface ITransferenciaItem {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  stockOrigenAntes: number;
  stockOrigenDespues: number;
  stockDestinoAntes: number;
  stockDestinoDespues: number;
}

export interface ITransferenciaStock extends Document {
  sucursalOrigenId: string;
  sucursalOrigenNombre: string;
  sucursalDestinoId: string;
  sucursalDestinoNombre: string;
  items: ITransferenciaItem[];
  totalItems: number;
  totalCantidad: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  creadoPor: string; // userId
  creadoPorNombre: string;
  aprobadoPor?: string;
  aprobadoPorNombre?: string;
  fechaCreacion: Date;
  fechaAprobacion?: Date;
  notas?: string;
  motivoCancelacion?: string;
}

const TransferenciaItemSchema = new Schema({
  productoId: { type: String, required: true },
  nombreProducto: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  stockOrigenAntes: { type: Number, required: true },
  stockOrigenDespues: { type: Number, required: true },
  stockDestinoAntes: { type: Number, required: true },
  stockDestinoDespues: { type: Number, required: true },
}, { _id: false });

const TransferenciaStockSchema = new Schema<ITransferenciaStock>({
  sucursalOrigenId: { 
    type: String, 
    required: true,
    index: true 
  },
  sucursalOrigenNombre: { 
    type: String, 
    required: true 
  },
  sucursalDestinoId: { 
    type: String, 
    required: true,
    index: true 
  },
  sucursalDestinoNombre: { 
    type: String, 
    required: true 
  },
  items: [TransferenciaItemSchema],
  totalItems: { 
    type: Number, 
    required: true 
  },
  totalCantidad: { 
    type: Number, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'pendiente',
    index: true
  },
  creadoPor: { 
    type: String, 
    required: true 
  },
  creadoPorNombre: { 
    type: String, 
    required: true 
  },
  aprobadoPor: String,
  aprobadoPorNombre: String,
  fechaCreacion: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  fechaAprobacion: Date,
  notas: String,
  motivoCancelacion: String,
}, {
  timestamps: true,
  collection: 'transferencias_stock'
});

// Índices compuestos para consultas comunes
TransferenciaStockSchema.index({ sucursalOrigenId: 1, estado: 1, fechaCreacion: -1 });
TransferenciaStockSchema.index({ sucursalDestinoId: 1, estado: 1, fechaCreacion: -1 });
TransferenciaStockSchema.index({ estado: 1, fechaCreacion: -1 });

export default mongoose.models.TransferenciaStock || 
  mongoose.model<ITransferenciaStock>('TransferenciaStock', TransferenciaStockSchema);
