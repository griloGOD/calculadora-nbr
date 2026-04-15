import type { ReactNode } from 'react'
import AnimatedNumber from './AnimatedNumber'

interface Props {
  label: string
  value: number
  unit?: string
  digits?: number
  hint?: string
  tone?: 'default' | 'accent'
  right?: ReactNode
}

export default function ResultCard({
  label,
  value,
  unit,
  digits = 1,
  hint,
  tone = 'default',
  right,
}: Props) {
  const accent = tone === 'accent'
  return (
    <div
      className={[
        'card p-4',
        accent ? 'border-accent/40 bg-surface shadow-glow-accent' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="label">{label}</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <AnimatedNumber
              value={value}
              digits={digits}
              className={[
                'font-display text-2xl font-bold sm:text-3xl',
                accent ? 'text-accent' : 'text-text',
              ].join(' ')}
            />
            {unit && (
              <span className="font-mono text-xs text-muted">{unit}</span>
            )}
          </div>
          {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
        </div>
        {right}
      </div>
    </div>
  )
}
