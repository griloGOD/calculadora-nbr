import { useState } from 'react'
import type { PassoCalculo } from '@/calculos/nbr8800/tracao'
import { IconChevron } from '../icons'

interface Props {
  titulo: string
  referencia?: string
  passos: PassoCalculo[]
  defaultOpen?: boolean
}

export default function FormulaBlock({ titulo, referencia, passos, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-md border border-border bg-surface-2/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm"
      >
        <div className="min-w-0">
          <div className="truncate font-medium text-text">{titulo}</div>
          {referencia && (
            <div className="truncate text-[11px] text-muted">{referencia}</div>
          )}
        </div>
        <IconChevron
          className={[
            'shrink-0 text-muted transition-transform',
            open ? 'rotate-90' : '',
          ].join(' ')}
          width={16}
          height={16}
        />
      </button>
      {open && (
        <div className="border-t border-border px-3 py-3 font-mono text-xs leading-relaxed text-text/90">
          {passos.map((p, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="text-accent">{p.equacao}</div>
              <div className="text-muted">  {p.substituicao}</div>
              <div>  → {p.resultado}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
