import type { PerfilLaminado } from '@/catalogo/perfis'

interface Props {
  perfil: PerfilLaminado
  className?: string
  showDims?: boolean
  showAxes?: boolean
}

/**
 * Desenho técnico esquemático de um perfil I (W/HP).
 * Escalonado para caber numa viewBox mantendo proporção.
 */
export default function ProfileSVG({
  perfil,
  className,
  showDims = true,
  showAxes = true,
}: Props) {
  const size = 180
  const pad = 28
  const inner = size - pad * 2

  const scale = Math.min(inner / perfil.d, inner / perfil.bf)
  const d = perfil.d * scale
  const bf = perfil.bf * scale
  const tf = Math.max(perfil.tf * scale, 1.2)
  const tw = Math.max(perfil.tw * scale, 1.2)

  const cx = size / 2
  const cy = size / 2

  const top = cy - d / 2
  const bottom = cy + d / 2
  const left = cx - bf / 2
  const right = cx + bf / 2
  const webLeft = cx - tw / 2
  const webRight = cx + tw / 2
  const innerTop = top + tf
  const innerBottom = bottom - tf

  const path = [
    `M ${left} ${top}`,
    `L ${right} ${top}`,
    `L ${right} ${innerTop}`,
    `L ${webRight} ${innerTop}`,
    `L ${webRight} ${innerBottom}`,
    `L ${right} ${innerBottom}`,
    `L ${right} ${bottom}`,
    `L ${left} ${bottom}`,
    `L ${left} ${innerBottom}`,
    `L ${webLeft} ${innerBottom}`,
    `L ${webLeft} ${innerTop}`,
    `L ${left} ${innerTop}`,
    'Z',
  ].join(' ')

  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Silhueta do perfil ${perfil.designacao}`}
      role="img"
    >
      <defs>
        <pattern id={`grid-${perfil.id}`} width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M 9 0 L 0 0 0 9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width={size} height={size} fill={`url(#grid-${perfil.id})`} />

      {/* Centerlines / eixos */}
      {showAxes && (
        <g>
          <line
            x1={cx}
            y1={6}
            x2={cx}
            y2={size - 6}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          <line
            x1={6}
            y1={cy}
            x2={size - 6}
            y2={cy}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          {/* Labels de eixos */}
          <g fontFamily="IBM Plex Mono" fontSize="8" fill="var(--color-muted)">
            <text x={size - 4} y={cy - 3} textAnchor="end">x</text>
            <text x={cx + 3} y={10} textAnchor="start">y</text>
          </g>
        </g>
      )}

      {/* Shape */}
      <path
        d={path}
        fill="var(--color-accent)"
        fillOpacity="0.12"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
        strokeLinejoin="miter"
      />

      {showDims && (
        <g fontFamily="IBM Plex Mono" fontSize="8" fill="var(--color-muted)">
          {/* d — altura */}
          <line
            x1={right + 6}
            y1={top}
            x2={right + 6}
            y2={bottom}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <line
            x1={right + 3}
            y1={top}
            x2={right + 9}
            y2={top}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <line
            x1={right + 3}
            y1={bottom}
            x2={right + 9}
            y2={bottom}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <text
            x={right + 13}
            y={cy + 2}
            textAnchor="middle"
            transform={`rotate(-90, ${right + 13}, ${cy + 2})`}
          >
            d={perfil.d}
          </text>

          {/* bf — mesa */}
          <line
            x1={left}
            y1={top - 6}
            x2={right}
            y2={top - 6}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <line
            x1={left}
            y1={top - 3}
            x2={left}
            y2={top - 9}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <line
            x1={right}
            y1={top - 3}
            x2={right}
            y2={top - 9}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <text x={cx} y={top - 9} textAnchor="middle">
            bf={perfil.bf}
          </text>

          {/* tf — mesa */}
          <text x={left - 4} y={top + tf / 2 + 3} textAnchor="end">
            tf={perfil.tf}
          </text>

          {/* tw — alma */}
          <text x={webRight + 3} y={cy + 3} textAnchor="start">
            tw={perfil.tw}
          </text>
        </g>
      )}
    </svg>
  )
}
