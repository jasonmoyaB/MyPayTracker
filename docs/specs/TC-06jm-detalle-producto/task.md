# TC-06jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de TC-05jm y UX-05jm. Regla ponytail. Tarea chica: sin agentes.

## Tareas
- [x] TC-06jm-T01 Prueba + `dues` en `pendingPurchases` y modal `<dialog>` por producto [src/domain/credit.ts, src/ui/dashboard/*] (AC-1, AC-2)
  - Evidencia: rojo 2 fallos (sin `dues`, sin botón ni dialog); verde 320/320; typecheck, test y build OK; en localhost abre, cierra con Esc y Cerrar, y el foco vuelve al producto.
- [x] TC-06jm-T02 Prueba + cerrar el modal al tocar fuera (`outsideRect`) [src/ui/dashboard/CreditCard.tsx]
  - Evidencia: rojo "outsideRect is not a function"; verde 321/321; typecheck, test y build OK; en localhost el clic dentro no cierra y fuera sí.
