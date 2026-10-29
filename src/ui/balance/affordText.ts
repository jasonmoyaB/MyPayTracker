import type { Recommendation } from '../../domain/recommend'
import { formatDay, formatMoney } from '../format'

// TC-03jm: compartido con PlanTable.
export const TONE = { si: 'success', ajustado: 'warning', no: 'danger' } as const

const crc = (cents: number) => formatMoney(cents, 'CRC')
const pct = (share: number) => `${Math.round(share * 100)} %`

// TC-02jm-T05: textos de "¿Puedo comprar esto?" aparte del componente (puros y probados sin DOM).
export function affordText(r: Recommendation): { tone: 'success' | 'warning' | 'danger'; lines: string[] } {
  const lines: string[] = []
  if (r.cuotaCents !== null && r.firstDueAt) {
    lines.push(r.months === 1
      ? `Pagas ${crc(r.cuotaCents)} el ${formatDay(r.firstDueAt)}.`
      : `Cuota de ${crc(r.cuotaCents)} al mes por ${r.months} meses; primer pago el ${formatDay(r.firstDueAt)}.`)
  }
  const cash = r.months === null
  if (r.verdict === 'no' && r.reason === 'pago') {
    lines.push(cash ? `Te faltan ${crc(-r.leftCents)}.` : `No te la recomiendo: al pagar el próximo 20 te faltarían ${crc(-r.leftCents)}.`)
    return { tone: 'danger', lines }
  }
  if (r.verdict === 'no') {
    lines.push(`No te la recomiendo: un mes pagarías ${crc(r.worstMonthCents ?? 0)} en cuotas, más que tu salario.`)
    return { tone: 'danger', lines }
  }
  if (r.verdict === 'ajustado') {
    lines.push(`Puedes, pero ajustado: tus cuotas serían el ${pct(r.shareOfSalary ?? 0)} de tu salario (lo sano es hasta 30 %).`)
    return { tone: 'warning', lines }
  }
  if (cash) lines.push(`Sí, te quedarían ${crc(r.leftCents)}.`)
  else if (r.shareOfSalary === null) lines.push(`Sí para el próximo pago (hoy te quedan ${crc(r.leftCents)}). Registra tu salario en Cuenta para saber si puedes mantener las cuotas.`)
  else lines.push(`Sí, puedes: hoy te quedan ${crc(r.leftCents)} y tus cuotas son el ${pct(r.shareOfSalary)} de tu salario.`)
  return { tone: 'success', lines }
}
