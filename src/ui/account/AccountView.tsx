import { saveAccountBalanceCents, saveSalaryCents, type Settings } from '../../data/settings'
import { MoneySetting } from '../balance/MoneySetting'
import { formatDate } from '../format'
import { PushToggle } from './PushToggle'

type Props = {
  settings: Settings
  onSettingsSaved: () => void
}

export function AccountView({ settings, onSettingsSaved }: Props) {
  const { account } = settings
  return (
    <>
      <section className="card" aria-labelledby="money-title">
        <h2 id="money-title" tabIndex={-1}>Saldo y salario</h2>
        <MoneySetting
          label="Saldo actual en BAC"
          emptyHint="Registra cuánto tienes hoy en tu cuenta BAC para partir de un saldo real."
          note={account ? `registrado el ${formatDate(account.asOf)}; se suman los movimientos posteriores` : undefined}
          valueCents={account?.cents ?? null}
          save={saveAccountBalanceCents}
          successMessage="Saldo actualizado"
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
      </section>
      <PushToggle />
    </>
  )
}
