import { saveAccountBalanceCents, saveSalaryCents, saveUsdRateCents, type Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { availableNow, reconcileText } from '../../domain/summary'
import { MoneySetting } from '../balance/MoneySetting'
import { formatDate, formatMoney } from '../format'

type Props = {
  settings: Settings
  transactions: Transaction[]
  onSettingsSaved: () => void
  now?: Date
}

export function AccountView({ settings, transactions, onSettingsSaved, now = new Date() }: Props) {
  const { account } = settings
  // BAL-02jm-T02: misma cifra que el Resumen, para comparar con el BAC antes de guardar el saldo nuevo.
  const appCents = availableNow(settings, transactions, now)
  return (
    <>
      <section className="card" aria-labelledby="money-title">
        <h2 id="money-title" tabIndex={-1}>Saldo y salario</h2>
        {appCents !== null && <p className="muted amount" style={{ margin: 0 }}>La app calcula hoy: {formatMoney(appCents, 'CRC')}</p>}
        <MoneySetting
          label="Saldo actual en BAC"
          emptyHint="Registra cuánto tienes hoy en tu cuenta BAC para partir de un saldo real."
          note={account ? `registrado el ${formatDate(account.asOf)}; se suman los movimientos posteriores` : undefined}
          valueCents={account?.cents ?? null}
          save={saveAccountBalanceCents}
          successMessage={appCents === null ? 'Saldo actualizado' : (cents) => `Saldo actualizado. ${reconcileText(appCents, cents)}`}
          onSaved={onSettingsSaved}
        />
        <MoneySetting
          label="Salario"
          emptyHint={account ? 'Opcional: tu salario mensual.' : 'Agrega tu salario para calcular tu saldo.'}
          note={account ? 'no se suma mientras haya saldo de cuenta' : undefined}
          valueCents={settings.salaryCents}
          save={saveSalaryCents}
          successMessage="Salario actualizado"
          onSaved={onSettingsSaved}
        />
        {/* USD-01jm-T03: MoneySetting ya rechaza 0, negativos y texto (AC-3); la BD también. */}
        <MoneySetting
          label="Tipo de cambio"
          emptyHint="Opcional: registra cuántos colones vale un dólar para ver tus dólares en colones."
          note="colones por dólar; solo informativo"
          valueCents={settings.usdRateCents ?? null}
          save={saveUsdRateCents}
          successMessage="Tipo de cambio actualizado"
          onSaved={onSettingsSaved}
        />
      </section>
    </>
  )
}
