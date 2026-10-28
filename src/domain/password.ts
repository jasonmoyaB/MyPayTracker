// AUTH-01jm-T01: reglas del cambio de contraseña; un mensaje por campo para mostrarlo junto a él.
export type PasswordChange = { current: string; next: string; confirm: string }
export type PasswordChangeErrors = Partial<Record<keyof PasswordChange, string>>

export const MIN_PASSWORD_LENGTH = 8

export function validatePasswordChange({ current, next, confirm }: PasswordChange): PasswordChangeErrors {
  const errors: PasswordChangeErrors = {}
  if (!current) errors.current = 'Escribe tu contraseña actual.'
  if (next.length < MIN_PASSWORD_LENGTH) errors.next = `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  else if (next === current) errors.next = 'La nueva contraseña debe ser distinta de la actual.'
  if (confirm !== next) errors.confirm = 'La confirmación no coincide con la nueva contraseña.'
  return errors
}
