import { useEffect, useRef, type ReactNode } from 'react'
import { showScreenTop, type Route } from './route'
import './shell.css'

const LINKS: { route: Route; label: string }[] = [
  { route: 'resumen', label: 'Resumen' },
  { route: 'movimientos', label: 'Movimientos' },
  { route: 'cuenta', label: 'Cuenta' },
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
          <a key={l.route} href={`#/${l.route}`} aria-current={l.route === route ? 'page' : undefined}>{l.label}</a>
        ))}
      </nav>
      <div ref={content}>{children}</div>
    </main>
  )
}
