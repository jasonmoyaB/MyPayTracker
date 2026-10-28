import type { ReactNode } from 'react'
import { saveAccountBalanceCents, saveSalaryCents, type Settings } from '../../data/settings'
import { ChangePasswordView } from '../auth/ChangePasswordView'
import { MoneySetting } from '../balance/MoneySetting'
import { formatDate } from '../format'

type Props = {
  email: string
  settings: Settings
  onSettingsSaved: () => void
  // PWA-01jm: aquí se monta el interruptor de notificaciones.
  children?: ReactNode
}

export function AccountView({ email, settings, onSettingsSaved, children }: Props) {
  const { account } = settings
  return (
    <>
      <section className="card" aria-labelledby="money-title">
        <h2 id="money-title">Saldo y salario</h2>
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
      <ChangePasswordView email={email} />
      {children}
    </>
  )
}
