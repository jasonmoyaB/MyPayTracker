import { toAppError, type AppError } from '../../data/errors'
import type { ToastApi } from './ToastProvider'

// UX-02jm-T03: guarda y avisa. Devuelve el error (o null) para que el formulario decida; nunca limpia lo escrito.
export async function saveWithToast(save: () => Promise<void>, toast: ToastApi, successMessage: string): Promise<AppError | null> {
  try {
    await save()
  } catch (e) {
    const error = toAppError(e)
    toast.error(error.message)
    return error
  }
  toast.success(successMessage)
  return null
}
