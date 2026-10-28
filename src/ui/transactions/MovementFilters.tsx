import { activePreset, presetRange, PRESETS, validateFilter, type MovementFilter, type Preset } from '../../domain/movementFilter'

const PRESET_LABELS: Record<Preset, string> = {
  thisMonth: 'Este mes', lastMonth: 'Mes pasado', last7: 'Últimos 7 días', all: 'Todo',
}

type Props = { filter: MovementFilter; now: Date; onChange: (filter: MovementFilter) => void }

export function MovementFilters({ filter, now, onChange }: Props) {
  const error = validateFilter(filter)
  const active = activePreset(filter, now)
  const set = (patch: Partial<MovementFilter>) => onChange({ ...filter, ...patch })
  return (
    <div className="movement-filters" role="group" aria-label="Filtros">
      <div className="filter-presets">
        {PRESETS.map((p) => (
          <button key={p} type="button" className="secondary" onClick={() => set(presetRange(p, now))}
            aria-pressed={active === p}>{PRESET_LABELS[p]}</button>
        ))}
      </div>
      <div className="filter-fields">
        <div className="filter-field">
          <label htmlFor="filter-from">Desde</label><input type="date" id="filter-from" value={filter.from ?? ''}
            aria-invalid={error ? true : undefined} aria-describedby={error ? 'filter-error' : undefined}
            onChange={(e) => set({ from: e.target.value || null })} />
          {error && <p id="filter-error" role="alert" className="status-danger">{error}</p>}
        </div>
        <div className="filter-field">
          <label htmlFor="filter-to">Hasta</label><input type="date" id="filter-to" value={filter.to ?? ''}
            onChange={(e) => set({ to: e.target.value || null })} />
        </div>
        <div className="filter-field">
          <label htmlFor="filter-direction">Tipo</label>
          <select id="filter-direction" value={filter.direction}
            onChange={(e) => set({ direction: e.target.value as MovementFilter['direction'] })}>
            <option value="all">Todos</option><option value="in">Ingresos</option><option value="out">Gastos</option>
          </select>
        </div>
      </div>
    </div>
  )
}
