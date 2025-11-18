import mongoose, { Schema, Document } from 'mongoose';

export interface IConfiguracion extends Document {
  // Información General
  nombreEmpresa: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  
  // Correos Electrónicos
  correoAdministracion: string;
  correoVentas: string;
  correoSoporte?: string;
  correoContacto?: string;
  
  // Teléfonos
  telefonoAdministracion: string;
  telefonoVentas: string;
  telefonoSoporte?: string;
  telefonoWhatsApp?: string;
  
  // Redes Sociales
  redesSociales: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  
  // Dirección Física
  direccion?: {
    calle?: string;
    ciudad?: string;
    estado?: string;
    codigoPostal?: string;
    pais?: string;
  };
  
  // Horarios
  horarioAtencion?: {
    lunes?: string;
    martes?: string;
    miercoles?: string;
    jueves?: string;
    viernes?: string;
    sabado?: string;
    domingo?: string;
  };
  
  // Configuración del Sitio
  logoUrl?: string;
  faviconUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  
  // URLs Importantes
  terminosCondiciones?: string;
  politicaPrivacidad?: string;
  politicaDevolucion?: string;
  
  // Configuración de Notificaciones
  notificaciones: {
    emailActivo: boolean;
    smsActivo: boolean;
    whatsappActivo: boolean;
  };
  
  // Metadatos
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConfiguracionSchema: Schema = new Schema(
  {
    // Información General
    nombreEmpresa: {
      type: String,
      required: true,
      default: 'Sabor a Campo'
    },
    descripcionCorta: {
      type: String,
      maxlength: 200
    },
    descripcionLarga: {
      type: String,
      maxlength: 1000
    },
    
    // Correos Electrónicos
    correoAdministracion: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    correoVentas: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    correoSoporte: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    correoContacto: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    
    // Teléfonos
    telefonoAdministracion: {
      type: String,
      required: true,
      trim: true
    },
    telefonoVentas: {
      type: String,
      required: true,
      trim: true
    },
    telefonoSoporte: {
      type: String,
      trim: true
    },
    telefonoWhatsApp: {
      type: String,
      trim: true
    },
    
    // Redes Sociales
    redesSociales: {
      type: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
        linkedin: { type: String, trim: true },
        youtube: { type: String, trim: true },
        tiktok: { type: String, trim: true }
      },
      default: {}
    },
    
    // Dirección Física
    direccion: {
      type: {
        calle: { type: String, trim: true },
        ciudad: { type: String, trim: true },
        estado: { type: String, trim: true },
        codigoPostal: { type: String, trim: true },
        pais: { type: String, trim: true, default: 'México' }
      },
      default: {}
    },
    
    // Horarios
    horarioAtencion: {
      type: {
        lunes: { type: String, default: '9:00 AM - 6:00 PM' },
        martes: { type: String, default: '9:00 AM - 6:00 PM' },
        miercoles: { type: String, default: '9:00 AM - 6:00 PM' },
        jueves: { type: String, default: '9:00 AM - 6:00 PM' },
        viernes: { type: String, default: '9:00 AM - 6:00 PM' },
        sabado: { type: String, default: '10:00 AM - 2:00 PM' },
        domingo: { type: String, default: 'Cerrado' }
      },
      default: {
        lunes: '9:00 AM - 6:00 PM',
        martes: '9:00 AM - 6:00 PM',
        miercoles: '9:00 AM - 6:00 PM',
        jueves: '9:00 AM - 6:00 PM',
        viernes: '9:00 AM - 6:00 PM',
        sabado: '10:00 AM - 2:00 PM',
        domingo: 'Cerrado'
      }
    },
    
    // Configuración del Sitio
    logoUrl: {
      type: String,
      trim: true
    },
    faviconUrl: {
      type: String,
      trim: true
    },
    colorPrimario: {
      type: String,
      default: '#10b981'
    },
    colorSecundario: {
      type: String,
      default: '#059669'
    },
    
    // URLs Importantes
    terminosCondiciones: {
      type: String,
      trim: true
    },
    politicaPrivacidad: {
      type: String,
      trim: true
    },
    politicaDevolucion: {
      type: String,
      trim: true
    },
    
    // Configuración de Notificaciones
    notificaciones: {
      type: {
        emailActivo: { type: Boolean, default: true },
        smsActivo: { type: Boolean, default: false },
        whatsappActivo: { type: Boolean, default: false }
      },
      default: {
        emailActivo: true,
        smsActivo: false,
        whatsappActivo: false
      }
    },
    
    // Metadatos
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Índices
ConfiguracionSchema.index({ activo: 1 });

// Solo debe existir una configuración activa
ConfiguracionSchema.pre('save', async function(next) {
  if (this.activo) {
    await mongoose.models.Configuracion?.updateMany(
      { _id: { $ne: this._id } },
      { activo: false }
    );
  }
  next();
});

// Prevent model recompilation in development
const Configuracion = mongoose.models.Configuracion || mongoose.model<IConfiguracion>('Configuracion', ConfiguracionSchema);

export default Configuracion;
