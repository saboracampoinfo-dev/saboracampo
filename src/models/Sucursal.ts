import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface para TypeScript
export interface ISucursal extends Document {
  nombre: string;
  descripcion?: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  };
  contacto: {
    telefono: string;
    telefonoAlternativo?: string;
    email: string;
    whatsapp?: string;
  };
  horarios: {
    semanal: {
      lunes: { apertura: string; cierre: string; cerrado?: boolean };
      martes: { apertura: string; cierre: string; cerrado?: boolean };
      miercoles: { apertura: string; cierre: string; cerrado?: boolean };
      jueves: { apertura: string; cierre: string; cerrado?: boolean };
      viernes: { apertura: string; cierre: string; cerrado?: boolean };
    };
    finDeSemana: {
      sabado: { apertura: string; cierre: string; cerrado?: boolean };
      domingo: { apertura: string; cierre: string; cerrado?: boolean };
    };
    observaciones?: string;
  };
  imagenes: {
    principal: string; // URL de Cloudinary
    galeria: string[]; // Array de URLs de Cloudinary
  };
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  capacidad?: number;
  servicios?: string[]; // Ej: ['estacionamiento', 'wifi', 'delivery', 'pago con tarjeta']
  encargado?: {
    nombre: string;
    telefono: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema de Mongoose
const SucursalSchema: Schema<ISucursal> = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la sucursal es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    direccion: {
      calle: {
        type: String,
        required: [true, 'La calle es obligatoria'],
        trim: true,
      },
      numero: {
        type: String,
        required: [true, 'El número es obligatorio'],
        trim: true,
      },
      ciudad: {
        type: String,
        required: [true, 'La ciudad es obligatoria'],
        trim: true,
      },
      provincia: {
        type: String,
        required: [true, 'La provincia es obligatoria'],
        trim: true,
      },
      codigoPostal: {
        type: String,
        required: [true, 'El código postal es obligatorio'],
        trim: true,
      },
      coordenadas: {
        latitud: {
          type: Number,
          min: -90,
          max: 90,
        },
        longitud: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },
    contacto: {
      telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true,
      },
      telefonoAlternativo: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
      },
      whatsapp: {
        type: String,
        trim: true,
      },
    },
    horarios: {
      semanal: {
        lunes: {
          apertura: { type: String, required: true },
          cierre: { type: String, required: true },
          cerrado: { type: Boolean, default: false },
        },
        martes: {
          apertura: { type: String, required: true },
          cierre: { type: String, required: true },
          cerrado: { type: Boolean, default: false },
        },
        miercoles: {
          apertura: { type: String, required: true },
          cierre: { type: String, required: true },
          cerrado: { type: Boolean, default: false },
        },
        jueves: {
          apertura: { type: String, required: true },
          cierre: { type: String, required: true },
          cerrado: { type: Boolean, default: false },
        },
        viernes: {
          apertura: { type: String, required: true },
          cierre: { type: String, required: true },
          cerrado: { type: Boolean, default: false },
        },
      },
      finDeSemana: {
        sabado: {
          apertura: { type: String, required: true },
          cierre: { type: String, required: true },
          cerrado: { type: Boolean, default: false },
        },
        domingo: {
          apertura: { type: String, required: true },
          cierre: { type: String, required: true },
          cerrado: { type: Boolean, default: false },
        },
      },
      observaciones: {
        type: String,
        trim: true,
        maxlength: [200, 'Las observaciones no pueden exceder 200 caracteres'],
      },
    },
    imagenes: {
      principal: {
        type: String,
        required: [true, 'La imagen principal es obligatoria'],
        trim: true,
      },
      galeria: {
        type: [String],
        default: [],
        validate: {
          validator: function (array: string[]) {
            return array.length <= 10;
          },
          message: 'La galería no puede tener más de 10 imágenes',
        },
      },
    },
    estado: {
      type: String,
      enum: {
        values: ['activa', 'inactiva', 'mantenimiento'],
        message: 'El estado debe ser: activa, inactiva o mantenimiento',
      },
      default: 'activa',
    },
    capacidad: {
      type: Number,
      min: [1, 'La capacidad debe ser mayor a 0'],
    },
    servicios: {
      type: [String],
      default: [],
    },
    encargado: {
      nombre: {
        type: String,
        trim: true,
      },
      telefono: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para optimizar búsquedas
SucursalSchema.index({ nombre: 1 });
SucursalSchema.index({ 'direccion.ciudad': 1 });
SucursalSchema.index({ estado: 1 });
SucursalSchema.index({ 'direccion.coordenadas.latitud': 1, 'direccion.coordenadas.longitud': 1 });

// Métodos virtuales
SucursalSchema.virtual('direccionCompleta').get(function () {
  return `${this.direccion.calle} ${this.direccion.numero}, ${this.direccion.ciudad}, ${this.direccion.provincia} (${this.direccion.codigoPostal})`;
});

// Método para verificar si está abierta
SucursalSchema.methods.estaAbierta = function (): boolean {
  if (this.estado !== 'activa') return false;

  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

  let horario;
  switch (diaSemana) {
    case 0:
      horario = this.horarios.finDeSemana.domingo;
      break;
    case 6:
      horario = this.horarios.finDeSemana.sabado;
      break;
    case 1:
      horario = this.horarios.semanal.lunes;
      break;
    case 2:
      horario = this.horarios.semanal.martes;
      break;
    case 3:
      horario = this.horarios.semanal.miercoles;
      break;
    case 4:
      horario = this.horarios.semanal.jueves;
      break;
    case 5:
      horario = this.horarios.semanal.viernes;
      break;
    default:
      return false;
  }

  if (horario.cerrado) return false;

  const [aperturaHora, aperturaMin] = horario.apertura.split(':').map(Number);
  const [cierreHora, cierreMin] = horario.cierre.split(':').map(Number);

  const minutosApertura = aperturaHora * 60 + aperturaMin;
  const minutosCierre = cierreHora * 60 + cierreMin;

  return horaActual >= minutosApertura && horaActual <= minutosCierre;
};

// Método para obtener el horario del día
SucursalSchema.methods.obtenerHorarioHoy = function () {
  const ahora = new Date();
  const diaSemana = ahora.getDay();

  switch (diaSemana) {
    case 0:
      return { dia: 'Domingo', ...this.horarios.finDeSemana.domingo };
    case 6:
      return { dia: 'Sábado', ...this.horarios.finDeSemana.sabado };
    case 1:
      return { dia: 'Lunes', ...this.horarios.semanal.lunes };
    case 2:
      return { dia: 'Martes', ...this.horarios.semanal.martes };
    case 3:
      return { dia: 'Miércoles', ...this.horarios.semanal.miercoles };
    case 4:
      return { dia: 'Jueves', ...this.horarios.semanal.jueves };
    case 5:
      return { dia: 'Viernes', ...this.horarios.semanal.viernes };
    default:
      return null;
  }
};

// Exportar el modelo
const Sucursal: Model<ISucursal> =
  mongoose.models.Sucursal || mongoose.model<ISucursal>('Sucursal', SucursalSchema);

export default Sucursal;
