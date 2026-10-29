import { Component, type ErrorInfo, type ReactNode } from 'react'

// UX-02jm-T05: un error de render muestra una pantalla de recuperación, nunca una pantalla en blanco.
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return <ErrorScreen title="Algo salió mal" detail="La pantalla tuvo un problema inesperado. Recarga para seguir." />
  }
}

export function ErrorScreen({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="center-screen">
      <section className="card" role="alert">
        <h1>{title}</h1>
        <p className="muted">{detail}</p>
        <button type="button" onClick={() => location.reload()}>Recargar</button>
      </section>
    </main>
  )
}
