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
