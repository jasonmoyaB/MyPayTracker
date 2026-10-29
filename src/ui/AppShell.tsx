import { useEffect, useRef, type ReactNode } from 'react'
import { showScreenTop, type Route } from './route'
import './shell.css'

// NAV-01jm-T01: trazos de 24×24; currentColor hereda el color activo y el tema.
const LINKS: { route: Route; label: string; icon: string }[] = [
  { route: 'resumen', label: 'Resumen', icon: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
  { route: 'movimientos', label: 'Movimientos', icon: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01' },
  // REC-01jm-T04: campana de trazo, mismo estilo que el resto.
  { route: 'recordatorios', label: 'Recordatorios', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
  { route: 'cuenta', label: 'Cuenta', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0' },
  { route: 'opciones', label: 'Opciones', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
]

type AppShellProps = { route: Route; header: ReactNode; children: ReactNode }

// Barra de secciones: arriba en escritorio, fija abajo en móvil (shell.css).
export function AppShell({ route, header, children }: AppShellProps) {
  const content = useRef<HTMLDivElement>(null)
  const shown = useRef(route)
  useEffect(() => {
    // Solo al cambiar de sección, no al cargar (no roba el foco al abrir la app).
    if (shown.current === route) return
    shown.current = route
    showScreenTop(content.current, window.scrollTo.bind(window))
  }, [route])
  return (
    <main className="app-shell">
      {header}
      <nav className="app-nav" aria-label="Secciones">
        {LINKS.map((l) => (
          <a key={l.route} href={`#/${l.route}`} aria-current={l.route === route ? 'page' : undefined}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={l.icon} /></svg>
            <span>{l.label}</span>
          </a>
        ))}
      </nav>
      <div ref={content}>{children}</div>
    </main>
  )
}
