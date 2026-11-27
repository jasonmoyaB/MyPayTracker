import { CATEGORIES, type Category } from '../../domain/category'

// CAT-01jm-T04: selector compacto bajo la descripción; sin estado propio, el valor viene de `categorize`.
export function CategorySelect({ value, onChange, disabled }: { value: Category; onChange: (c: Category) => void; disabled?: boolean }) {
  return (
    <select className="transaction-category" aria-label="Categoría" value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value as Category)}>
      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  )
}
