import mongoose, { Schema, Model } from 'mongoose';

export interface IPaymentRecord {
  amount: number;
  hoursWorked: number;
  period: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  notes?: string;
}

export interface IUser {
  _id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  imgProfile?: string;
  role: 'user' | 'admin' | 'seller' | 'cashier';
  telefono?: string;
  domicilio?: string;
  tipoDocumento?: string;
  nroDocumento?: string;
  porcentajeComision?: number;
  precioHora?: number;
  horasAcumuladas?: number;
  ultimaLiquidacion?: Date;
  historialPagos?: IPaymentRecord[];
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    imgProfile: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'seller', 'cashier'],
      default: 'user',
    },
    telefono: {
      type: String,
      trim: true,
    },
    domicilio: {
      type: String,
      trim: true,
    },
    tipoDocumento: {
      type: String,
      trim: true,
    },
    nroDocumento: {
      type: String,
      trim: true,
    },
    porcentajeComision: {
      type: Number,
      min: 0,
      max: 100,
    },
    precioHora:{
      type: Number,
      min: 0,
    },
    horasAcumuladas: {
      type: Number,
      default: 0,
      min: 0,
    },
    ultimaLiquidacion: {
      type: Date,
    },
    historialPagos: [{
      amount: {
        type: Number,
        required: true,
      },
      hoursWorked: {
        type: Number,
        required: true,
      },
      period: {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          required: true,
        },
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      notes: {
        type: String,
        trim: true,
      },
    }],
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
