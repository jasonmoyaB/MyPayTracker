import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { configError } from '../data/supabase'
import { App } from './App'
import { ErrorBoundary, ErrorScreen } from './ErrorBoundary'
import { ToastProvider, useToast } from './toast/ToastProvider'
import { onUnhandledRejection } from './unhandledRejection'
import './theme.css'

function UnhandledRejections() {
  const toast = useToast()
  useEffect(() => onUnhandledRejection(toast.error), [toast])
  return null
}

// PWA-01jm-T01: solo en producción (en dev el SW quedaría registrado sirviendo el código de Vite).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((e) => console.error('No se pudo registrar el service worker:', e))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {configError ? <ErrorScreen title="La app no está configurada" detail={configError} /> : (
      <ErrorBoundary>
        <ToastProvider>
          <UnhandledRejections />
          <App />
        </ToastProvider>
      </ErrorBoundary>
    )}
  </StrictMode>,
)
