import { useState } from 'react'
import { initialTheme, nextTheme, type Theme } from '../../domain/theme'

// Misma clave que el script inline de index.html (THEME-01jm-T04).
const STORAGE_KEY = 'theme'

function currentTheme(): Theme {
  // index.html ya aplicó la elección guardada a data-theme; sin ella manda el sistema.
  return initialTheme(document.documentElement.dataset.theme ?? null,
    matchMedia('(prefers-color-scheme: dark)').matches)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme)
  function toggle() {
    const next = nextTheme(theme)
    document.documentElement.dataset.theme = next
    setTheme(next)
    // Modo privado o almacenamiento bloqueado: el tema cambia igual, solo no se recuerda.
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* sin persistencia */ }
  }
  return (
    <button type="button" className="secondary" onClick={toggle}>
      {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
    </button>
  )
}
