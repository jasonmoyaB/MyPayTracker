/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// UX-01jm-T01: Vitest vacía el CSS por defecto; theme.css se procesa para leer sus tokens en el test.
export default defineConfig({ plugins: [react()], test: { css: { include: [/theme\.css/] } } })
