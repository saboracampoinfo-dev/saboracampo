import { toast, ToastOptions, Id } from 'react-toastify';

/**
 * Configuración por defecto para los toasts
 */
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Muestra un toast de éxito
 */
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Muestra un toast de error
 */
export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, { ...defaultOptions, autoClose: 4000, ...options });
};

/**
 * Muestra un toast de advertencia
 */
export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Muestra un toast informativo
 */
export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Muestra un toast de carga
 */
export const showLoadingToast = (message: string = 'Cargando...', options?: ToastOptions): Id => {
  return toast.loading(message, { ...defaultOptions, ...options });
};

/**
 * Actualiza un toast existente
 */
export const updateToast = (
  toastId: Id,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info',
  options?: ToastOptions
) => {
  return toast.update(toastId, {
    render: message,
    type,
    isLoading: false,
    autoClose: type === 'error' ? 4000 : 3000,
    ...options,
  });
};

/**
 * Cierra un toast específico
 */
export const dismissToast = (toastId?: Id) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Mensajes de error comunes para Firebase Auth
 */
export const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/requires-recent-login': 'Por seguridad, inicia sesión nuevamente',
  };

  return errorMessages[errorCode] || 'Ha ocurrido un error';
};

/**
 * Promesa con toast de carga
 * Útil para operaciones asíncronas
 */
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    pending: string;
    success: string;
    error: string;
  },
  options?: ToastOptions
): Promise<T> => {
  return toast.promise(
    promise,
    {
      pending: messages.pending,
      success: messages.success,
      error: messages.error,
    },
    { ...defaultOptions, ...options }
  ) as Promise<T>;
};
