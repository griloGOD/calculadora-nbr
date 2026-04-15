/**
 * Catálogo de parafusos estruturais (NBR 8800 §6.3 e ISO 898).
 * Áreas em mm²; resistências em MPa.
 */

export interface TipoParafuso {
  id: string
  norma: string
  grau: string
  fyb: number // MPa
  fub: number // MPa
  protendido: boolean // permite ligação por atrito?
  descricao?: string
}

export interface DiametroParafuso {
  id: string
  designacao: string
  d: number // diâmetro nominal [mm]
  Ab: number // área bruta [mm²] = π·d²/4
  Ae: number // área efetiva (rosca) [mm²] — ISO (tabelada)
}

export const TIPOS_PARAFUSO: TipoParafuso[] = [
  {
    id: 'a307',
    norma: 'ASTM A307',
    grau: '—',
    fyb: 240,
    fub: 415,
    protendido: false,
    descricao: 'Parafuso comum, baixa resistência.',
  },
  {
    id: 'a325',
    norma: 'ASTM A325',
    grau: '—',
    fyb: 635,
    fub: 825,
    protendido: true,
    descricao: 'Alta resistência, uso estrutural comum.',
  },
  {
    id: 'a490',
    norma: 'ASTM A490',
    grau: '—',
    fyb: 900,
    fub: 1035,
    protendido: true,
    descricao: 'Alta resistência, ligações críticas.',
  },
  {
    id: 'iso-88',
    norma: 'ISO 898',
    grau: 'Classe 8.8',
    fyb: 640,
    fub: 800,
    protendido: true,
    descricao: 'Equivalente métrico ao A325.',
  },
  {
    id: 'iso-109',
    norma: 'ISO 898',
    grau: 'Classe 10.9',
    fyb: 900,
    fub: 1000,
    protendido: true,
    descricao: 'Equivalente métrico ao A490.',
  },
]

function areaBruta(d: number) {
  return (Math.PI * d * d) / 4
}

// Áreas efetivas (com rosca) padronizadas ISO
const AE_ISO: Record<number, number> = {
  12: 84.3,
  16: 157.0,
  20: 245.0,
  22: 303.0,
  24: 353.0,
  27: 459.0,
  30: 561.0,
}

export const DIAMETROS: DiametroParafuso[] = [12, 16, 20, 22, 24, 27, 30].map((d) => ({
  id: `m${d}`,
  designacao: `M${d}`,
  d,
  Ab: areaBruta(d),
  Ae: AE_ISO[d] ?? areaBruta(d) * 0.75,
}))

export function getTipoParafuso(id: string) {
  return TIPOS_PARAFUSO.find((t) => t.id === id)
}

export function getDiametro(id: string) {
  return DIAMETROS.find((d) => d.id === id)
}

// Classes de superfície de atrito (NBR 8800 §6.3.5)
export const CLASSES_ATRITO = [
  { id: 'a', nome: 'Classe A', mu: 0.35, descricao: 'Sup. de aço limpo (sem carepa), jateado.' },
  { id: 'b', nome: 'Classe B', mu: 0.5, descricao: 'Sup. jateada + pintura especial ou galvanizada.' },
  { id: 'c', nome: 'Classe C', mu: 0.33, descricao: 'Sup. galvanizada a quente.' },
] as const

export type ClasseAtrito = (typeof CLASSES_ATRITO)[number]

// Eletrodos de solda (AWS)
export interface Eletrodo {
  id: string
  classificacao: string
  fuE: number // MPa
}

export const ELETRODOS: Eletrodo[] = [
  { id: 'e60', classificacao: 'E60XX', fuE: 415 },
  { id: 'e70', classificacao: 'E70XX', fuE: 485 },
  { id: 'e80', classificacao: 'E80XX', fuE: 550 },
  { id: 'e90', classificacao: 'E90XX', fuE: 620 },
]

export function getEletrodo(id: string) {
  return ELETRODOS.find((e) => e.id === id)
}
