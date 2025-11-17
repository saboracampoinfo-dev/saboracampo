import Swal from 'sweetalert2';

export const showSuccessAlert = (message: string) => {
  return Swal.fire({
    icon: 'success',
    title: 'Éxito',
    text: message,
    confirmButtonColor: '#10b981',
  });
};

export const showErrorAlert = (message: string) => {
  return Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#ef4444',
  });
};

export const showWarningAlert = (message: string) => {
  return Swal.fire({
    icon: 'warning',
    title: 'Advertencia',
    text: message,
    confirmButtonColor: '#f59e0b',
  });
};

export const showConfirmAlert = async (
  title: string,
  message: string
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
  });

  return result.isConfirmed;
};

export const showLoadingAlert = (message: string = 'Cargando...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeAlert = () => {
  Swal.close();
};
