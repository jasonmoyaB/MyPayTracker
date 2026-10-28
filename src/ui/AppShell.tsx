import type { ReactNode } from 'react'
import type { Route } from './route'
import './shell.css'

const LINKS: { route: Route; label: string }[] = [
  { route: 'resumen', label: 'Resumen' },
  { route: 'movimientos', label: 'Movimientos' },
  { route: 'cuenta', label: 'Cuenta' },
]

type AppShellProps = { route: Route; header: ReactNode; children: ReactNode }

// Barra de secciones: arriba en escritorio, fija abajo en móvil (shell.css).
export function AppShell({ route, header, children }: AppShellProps) {
  return (
    <main className="app-shell">
      {header}
      <nav className="app-nav" aria-label="Secciones">
        {LINKS.map((l) => (
          <a key={l.route} href={`#/${l.route}`} aria-current={l.route === route ? 'page' : undefined}>{l.label}</a>
        ))}
      </nav>
      {children}
    </main>
  )
}
