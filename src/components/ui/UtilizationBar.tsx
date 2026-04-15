import { motion } from 'framer-motion'
import { fmtPct } from '@/calculos/utils/format'

interface Props {
  eta?: number // 0..1+
}

export default function UtilizationBar({ eta }: Props) {
  if (eta === undefined || !Number.isFinite(eta)) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="label">Taxa de utilização η</span>
          <span className="font-mono">—</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-2" />
      </div>
    )
  }

  const pct = Math.min(eta, 1.2) * 100
  const widthPct = Math.min(pct, 120)

  const color =
    eta > 1 ? 'var(--color-danger)' : eta > 0.8 ? 'var(--color-warn)' : 'var(--color-accent-alt)'
  const statusLabel = eta > 1 ? 'NOK' : eta > 0.8 ? 'ALERTA' : 'OK'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="label">Taxa de utilização η</span>
        <span className="flex items-center gap-2 font-mono">
          <span className="tabular-nums text-text">{fmtPct(eta)}</span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color, border: `1px solid ${color}`, backgroundColor: `${color}15` }}
          >
            {statusLabel}
          </span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        {/* Mark 80% and 100% */}
        <div
          className="absolute top-0 h-full w-px bg-muted/50"
          style={{ left: '80%' }}
          aria-hidden
        />
        <div
          className="absolute top-0 h-full w-px bg-danger/60"
          style={{ left: '100%' }}
          aria-hidden
        />
        <motion.div
          key={color}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted">
        <span>0%</span>
        <span>80%</span>
        <span>100%</span>
        <span>120%</span>
      </div>
    </div>
  )
}
