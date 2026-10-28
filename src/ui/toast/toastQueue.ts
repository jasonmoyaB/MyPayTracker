// UX-02jm-T02: cola pura de avisos breves; el provider solo guarda el estado y los temporizadores.
export type Toast = { id: number; kind: 'success' | 'error'; message: string }

export const MAX_TOASTS = 3
export const TOAST_MS = 4000

export const pushToast = (list: Toast[], toast: Toast): Toast[] => [...list, toast].slice(-MAX_TOASTS)

export const removeToast = (list: Toast[], id: number): Toast[] => list.filter((t) => t.id !== id)
