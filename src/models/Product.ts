import mongoose, { Schema, Model } from 'mongoose';

export interface IStockSucursal {
  sucursalId: string;
  sucursalNombre: string;
  cantidad: number;
  stockMinimo: number;
}

export interface IProduct {
  _id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  subcategoria?: string;
  precio: number;
  precioPromocion?: number;
  stock: number; // Stock total (suma de todas las sucursales)
  stockMinimo: number; // Stock mínimo global
  stockPorSucursal: IStockSucursal[]; // Stock distribuido por sucursal
  unidadMedida: 'kg' | 'unidad' | 'litro' | 'paquete' | 'caja';
  imagenes: string[];
  destacado: boolean;
  activo: boolean;
  sku?: string;
  codigoBarras?: string;
  peso?: number;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
  };
  proveedor?: string;
  origen?: string;
  ingredientes?: string;
  valorNutricional?: string;
  fechaVencimiento?: Date;
  etiquetas: string[];
  visitas: number;
  ventas: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      trim: true,
      index: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es requerida'],
      trim: true,
      index: true,
    },
    subcategoria: {
      type: String,
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    precioPromocion: {
      type: Number,
      min: [0, 'El precio de promoción no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es requerido'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    stockMinimo: {
      type: Number,
      default: 1,
      min: [0, 'El stock mínimo no puede ser negativo'],
    },
    stockPorSucursal: {
      type: [{
        sucursalId: {
          type: String,
          required: true,
        },
        sucursalNombre: {
          type: String,
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: [0, 'La cantidad no puede ser negativa'],
          default: 1,
        },
        stockMinimo: {
          type: Number,
          default: 1,
          min: [0, 'El stock mínimo no puede ser negativo'],
        },
      }],
      default: [],
    },
    unidadMedida: {
      type: String,
      enum: ['kg', 'unidad', 'litro', 'paquete', 'caja'],
      default: 'unidad',
    },
    imagenes: {
      type: [String],
      default: [],
    },
    destacado: {
      type: Boolean,
      default: false,
      index: true,
    },
    activo: {
      type: Boolean,
      default: true,
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    codigoBarras: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    peso: {
      type: Number,
      min: [0, 'El peso no puede ser negativo'],
    },
    dimensiones: {
      largo: {
        type: Number,
        min: [0, 'El largo no puede ser negativo'],
      },
      ancho: {
        type: Number,
        min: [0, 'El ancho no puede ser negativo'],
      },
      alto: {
        type: Number,
        min: [0, 'El alto no puede ser negativo'],
      },
    },
    proveedor: {
      type: String,
      trim: true,
    },
    origen: {
      type: String,
      trim: true,
    },
    ingredientes: {
      type: String,
      trim: true,
    },
    valorNutricional: {
      type: String,
      trim: true,
    },
    fechaVencimiento: {
      type: Date,
    },
    etiquetas: {
      type: [String],
      default: [],
      index: true,
    },
    visitas: {
      type: Number,
      default: 0,
      min: [0, 'Las visitas no pueden ser negativas'],
    },
    ventas: {
      type: Number,
      default: 0,
      min: [0, 'Las ventas no pueden ser negativas'],
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices compuestos para búsquedas optimizadas
ProductSchema.index({ nombre: 'text', descripcion: 'text', etiquetas: 'text' });
ProductSchema.index({ categoria: 1, activo: 1 });
ProductSchema.index({ precio: 1 });
ProductSchema.index({ destacado: 1, activo: 1 });

// Virtual para verificar si hay stock disponible
ProductSchema.virtual('disponible').get(function() {
  return this.stock > 0 && this.activo;
});

// Virtual para verificar si el stock está bajo
ProductSchema.virtual('stockBajo').get(function() {
  return this.stock <= this.stockMinimo;
});

// Virtual para calcular el descuento si hay precio promoción
ProductSchema.virtual('descuento').get(function() {
  if (this.precioPromocion && this.precioPromocion < this.precio) {
    return Math.round(((this.precio - this.precioPromocion) / this.precio) * 100);
  }
  return 0;
});

// Configurar para incluir virtuals en JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// Prevent model recompilation in development
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
