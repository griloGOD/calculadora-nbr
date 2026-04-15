export function fmt(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(n)
}

export function fmtKN(n: number, d = 1): string {
  return `${fmt(n, d)} kN`
}

export function fmtPct(n: number, d = 1): string {
  return `${fmt(n * 100, d)}%`
}

export function fmtMPa(n: number, d = 0): string {
  return `${fmt(n, d)} MPa`
}

export function parseNumberBR(s: string): number {
  if (!s) return NaN
  return Number(s.replace(/\./g, '').replace(',', '.'))
}
