import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 20,
  height: 20,
}

export const IconLogo = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 5h16" />
    <path d="M4 19h16" />
    <path d="M12 5v14" />
    <path d="M7 9l4 4" />
    <path d="M13 11l4 4" />
  </svg>
)

export const IconTracao = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h16" />
    <path d="M4 12l3-3" />
    <path d="M4 12l3 3" />
    <path d="M20 12l-3-3" />
    <path d="M20 12l-3 3" />
    <path d="M9 7v10" />
    <path d="M15 7v10" />
  </svg>
)

export const IconCompressao = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h16" />
    <path d="M2 9l3 3l-3 3" />
    <path d="M22 9l-3 3l3 3" />
    <path d="M9 7v10" />
    <path d="M15 7v10" />
  </svg>
)

export const IconFlexao = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 17c4 0 5-10 9-10s5 10 9 10" />
    <path d="M3 19h18" />
  </svg>
)

export const IconCisalhamento = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="5" y="4" width="14" height="7" rx="1" />
    <rect x="7" y="13" width="14" height="7" rx="1" />
    <path d="M9 11l-2 2" strokeDasharray="2 2" />
  </svg>
)

export const IconFlexoCompressao = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h16" />
    <path d="M4 12l2-2" />
    <path d="M4 12l2 2" />
    <path d="M20 12l-2-2" />
    <path d="M20 12l-2 2" />
    <path d="M7 8c3 0 3 8 5 8s2-8 5-8" />
  </svg>
)

export const IconTorcao = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 5c4 0 4 14 12 14" />
    <path d="M6 19c4 0 4-14 12-14" />
  </svg>
)

export const IconParafuso = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 4h6v3l-1 2H10l-1-2z" />
    <path d="M10 9v11" />
    <path d="M14 9v11" />
    <path d="M8 12h8" />
    <path d="M8 16h8" />
  </svg>
)

export const IconSolda = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 8h16" />
    <path d="M4 14h16" />
    <path d="M6 11l2-1l2 1l2-1l2 1l2-1l2 1" />
  </svg>
)

export const IconChapa = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="6" width="18" height="12" rx="1" />
    <path d="M3 10h18" strokeDasharray="2 3" />
  </svg>
)

export const IconRelatorio = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 3h8l4 4v14H7z" />
    <path d="M15 3v4h4" />
    <path d="M10 12h7" />
    <path d="M10 16h7" />
  </svg>
)

export const IconHome = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 11l8-7l8 7" />
    <path d="M6 10v10h12V10" />
  </svg>
)

export const IconChevron = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 6l6 6l-6 6" />
  </svg>
)

export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12l4 4l10-10" />
  </svg>
)

export const IconAlert = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4l10 17H2z" />
    <path d="M12 10v5" />
    <circle cx="12" cy="18" r="0.6" fill="currentColor" />
  </svg>
)

export const IconX = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 5l14 14" />
    <path d="M19 5L5 19" />
  </svg>
)

export const IconInfo = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8.5h.01" strokeLinecap="round" />
    <path d="M11 11h1v6h1" />
  </svg>
)

export const IconBars = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
)
