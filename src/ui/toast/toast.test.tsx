import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MAX_TOASTS, pushToast, removeToast, TOAST_MS, type Toast } from './toastQueue'
import { ToastProvider, useToast } from './ToastProvider'
import { ToastRegion } from './ToastRegion'

const toast = (id: number, kind: Toast['kind'] = 'success'): Toast => ({ id, kind, message: `aviso ${id}` })

describe('AC-1: cola de toasts', () => {
  it('agrega al final', () => {
    expect(pushToast([toast(1)], toast(2)).map((t) => t.id)).toEqual([1, 2])
  })
  it('mantiene máximo 3 y descarta los más viejos', () => {
    const list = [1, 2, 3, 4].reduce<Toast[]>((l, id) => pushToast(l, toast(id)), [])
    expect(MAX_TOASTS).toBe(3)
    expect(list.map((t) => t.id)).toEqual([2, 3, 4])
  })
  it('quita por id sin tocar los demás', () => {
    expect(removeToast([toast(1), toast(2)], 1).map((t) => t.id)).toEqual([2])
  })
  it('se cierra solo a los 4 s', () => {
    expect(TOAST_MS).toBe(4000)
  })
})

describe('AC-8: región accesible', () => {
  const html = renderToStaticMarkup(
    <ToastRegion toasts={[toast(1, 'success'), toast(2, 'error')]} onClose={() => {}} />,
  )
  it('éxito como status y error como alert', () => {
    expect(html).toMatch(/role="status"[^>]*>.*aviso 1/)
    expect(html).toMatch(/role="alert"[^>]*>.*aviso 2/)
  })
  it('cada toast tiene botón para cerrar', () => {
    expect(html.match(/aria-label="Cerrar aviso"/g)).toHaveLength(2)
  })
})

describe('ToastProvider', () => {
  function Probe() {
    const toast = useToast()
    return <p>{typeof toast.success}-{typeof toast.error}</p>
  }
  it('expone success y error a sus hijos', () => {
    expect(renderToStaticMarkup(<ToastProvider><Probe /></ToastProvider>)).toContain('function-function')
  })
  it('useToast fuera del provider falla con un mensaje claro', () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(/ToastProvider/)
  })
})
