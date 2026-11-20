# MOV-04jm — Plan
- Revertir el filtro de MOV-03jm-T01 en `summaryFor` (`src/domain/summary.ts`): vuelve a recibir los movimientos tal cual.
- `summarizeFromAccount` ya resta los gastos posteriores a `asOf`; no hace falta código nuevo.
- Tests: el AC-1 de MOV-03jm pasa a esperar ₡55 430; AC-2..AC-4 se quedan.
- `MOV-03jm/spec.md` queda con una nota de que MOV-04jm lo reemplaza.
