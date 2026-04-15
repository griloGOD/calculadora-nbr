import type { PerfilLaminado } from '@/catalogo/perfis'

interface Props {
  perfil: PerfilLaminado
  className?: string
  showDims?: boolean
}

/**
 * Desenho técnico esquemático de um perfil I (W/HP).
 * Escalonado para caber numa viewBox 160x160 mantendo proporção.
 */
export default function ProfileSVG({ perfil, className, showDims = true }: Props) {
  const size = 160
  const pad = 20
  const inner = size - pad * 2

  const scale = Math.min(inner / perfil.d, inner / perfil.bf)
  const d = perfil.d * scale
  const bf = perfil.bf * scale
  const tf = perfil.tf * scale
  const tw = perfil.tw * scale

  const cx = size / 2
  const cy = size / 2

  // Construir caminho do I (mesas + alma) centralizado
  // Retângulo de contorno
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
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={size} height={size} fill="url(#grid)" />

      {/* Centerlines */}
      <line
        x1={cx}
        y1={pad / 2}
        x2={cx}
        y2={size - pad / 2}
        stroke="var(--color-border)"
        strokeDasharray="2 3"
      />
      <line
        x1={pad / 2}
        y1={cy}
        x2={size - pad / 2}
        y2={cy}
        stroke="var(--color-border)"
        strokeDasharray="2 3"
      />

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
        <g fontFamily="IBM Plex Mono" fontSize="7.5" fill="var(--color-muted)">
          {/* d (altura) */}
          <line
            x1={right + 5}
            y1={top}
            x2={right + 5}
            y2={bottom}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <text
            x={right + 9}
            y={cy + 3}
            textAnchor="start"
            transform={`rotate(-90, ${right + 9}, ${cy + 3})`}
          >
            d={perfil.d}
          </text>
          {/* bf (mesa) */}
          <line
            x1={left}
            y1={top - 5}
            x2={right}
            y2={top - 5}
            stroke="var(--color-muted)"
            strokeWidth="0.5"
          />
          <text x={cx} y={top - 7} textAnchor="middle">
            bf={perfil.bf}
          </text>
        </g>
      )}
    </svg>
  )
}
