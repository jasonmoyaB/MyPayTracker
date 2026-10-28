export type Theme = 'light' | 'dark'

// THEME-01jm-T01: localStorage puede traer cualquier cosa; solo una elección válida le gana al sistema.
export function initialTheme(saved: string | null, prefersDark: boolean): Theme {
  if (saved === 'light' || saved === 'dark') return saved
  return prefersDark ? 'dark' : 'light'
}

export function nextTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}
