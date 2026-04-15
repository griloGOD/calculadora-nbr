/**
 * NBR 8800:2008 — Seção 5 (Barras submetidas à força axial de compressão)
 *
 * Procedimento (§5.3):
 *   1. λ₀ = √(Q · Ag · fy / Ne)    (índice de esbeltez reduzido)
 *   2. Ne = π²·E·I / (K·L)²         (flambagem elástica) — menor entre eixos x, y
 *   3. χ:
 *        se λ₀ ≤ 1,5: χ = 0,658^(λ₀²)
 *        se λ₀ > 1,5: χ = 0,877 / λ₀²
 *   4. NcRd = χ · Q · Ag · fy / γa1
 *
 * Para MVP, considera-se Q = 1 (elementos AA/AL compactos — sem flambagem local).
 */

import { GAMMA_A1, MODULO_ELASTICIDADE_ACO } from '@/catalogo/materiais'
import type { PassoCalculo } from './tracao'

export interface EntradasCompressao {
  Ag: number // cm²
  Ix: number // cm⁴
  Iy: number // cm⁴
  rx: number // cm
  ry: number // cm
  fy: number // MPa
  E?: number // MPa (default 200000)
  Kx: number // coef. de flambagem em x
  Ky: number // coef. de flambagem em y
  Lx: number // comprimento destravado eixo x [cm]
  Ly: number // comprimento destravado eixo y [cm]
  Q?: number // fator de flambagem local (default 1)
  Nsd?: number // kN (solicitação)
}

export interface ResultadoCompressao {
  NcRd: number // kN
  Ne: number // kN (força de flambagem elástica governante)
  NeX: number
  NeY: number
  lambda0: number // índice de esbeltez reduzido
  chi: number // fator de redução
  Q: number
  eixoGovernante: 'x' | 'y'
  esbeltezX: number
  esbeltezY: number
  utilizacao?: number
  status?: 'ok' | 'alerta' | 'nok'
  passos: PassoCalculo[]
  referencia: string
}

function round(n: number, d = 2) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

export function calcularCompressao(e: EntradasCompressao): ResultadoCompressao {
  const E = e.E ?? MODULO_ELASTICIDADE_ACO // MPa
  const Q = e.Q ?? 1

  // Flambagem elástica por eixo — Euler
  // Ne = π² E I / (K L)²
  // E [MPa = N/mm² = 0.1 kN/cm²] → Ekncm2 = E/10
  const Ekncm2 = E / 10
  const KLx = e.Kx * e.Lx
  const KLy = e.Ky * e.Ly
  const NeX = (Math.PI ** 2 * Ekncm2 * e.Ix) / (KLx * KLx)
  const NeY = (Math.PI ** 2 * Ekncm2 * e.Iy) / (KLy * KLy)

  const Ne = Math.min(NeX, NeY)
  const eixoGovernante: 'x' | 'y' = NeX <= NeY ? 'x' : 'y'

  // Esbeltez geométrica
  const esbeltezX = KLx / e.rx
  const esbeltezY = KLy / e.ry

  // λ₀ = √(Q · Ag · fy / Ne)  (Ag·fy em kN, Ne em kN → adimensional)
  const fyKNcm2 = e.fy / 10
  const QAgFy = Q * e.Ag * fyKNcm2
  const lambda0 = Math.sqrt(QAgFy / Ne)

  // χ
  let chi: number
  let expressaoChi: string
  if (lambda0 <= 1.5) {
    chi = Math.pow(0.658, lambda0 * lambda0)
    expressaoChi = `χ = 0,658^(λ₀²) = 0,658^${round(lambda0 * lambda0, 4)} = ${round(chi, 4)}`
  } else {
    chi = 0.877 / (lambda0 * lambda0)
    expressaoChi = `χ = 0,877 / λ₀² = 0,877 / ${round(lambda0 * lambda0, 4)} = ${round(chi, 4)}`
  }

  // NcRd = χ · Q · Ag · fy / γa1   [kN]
  const NcRd = (chi * QAgFy) / GAMMA_A1

  let utilizacao: number | undefined
  let status: 'ok' | 'alerta' | 'nok' | undefined
  if (e.Nsd !== undefined && NcRd > 0) {
    utilizacao = e.Nsd / NcRd
    if (utilizacao > 1) status = 'nok'
    else if (utilizacao > 0.8) status = 'alerta'
    else status = 'ok'
  }

  const passos: PassoCalculo[] = [
    {
      equacao: 'N_{e,x} = π²·E·I_x / (K_x·L_x)²',
      substituicao: `N_{e,x} = π² · ${round(E)} · ${round(e.Ix)} / (${round(e.Kx, 2)} · ${round(e.Lx)})² (E em kN/cm²)`,
      resultado: `N_{e,x} = ${round(NeX)} kN`,
    },
    {
      equacao: 'N_{e,y} = π²·E·I_y / (K_y·L_y)²',
      substituicao: `N_{e,y} = π² · ${round(E)} · ${round(e.Iy)} / (${round(e.Ky, 2)} · ${round(e.Ly)})² (E em kN/cm²)`,
      resultado: `N_{e,y} = ${round(NeY)} kN  →  N_e = ${round(Ne)} kN (eixo ${eixoGovernante})`,
    },
    {
      equacao: 'λ₀ = √(Q·A_g·f_y / N_e)',
      substituicao: `λ₀ = √(${round(Q, 2)} · ${round(e.Ag)} · ${round(e.fy)} / (10 · ${round(Ne)}))`,
      resultado: `λ₀ = ${round(lambda0, 3)}`,
    },
    {
      equacao: lambda0 <= 1.5 ? 'χ = 0,658^(λ₀²)' : 'χ = 0,877 / λ₀²',
      substituicao: expressaoChi,
      resultado: `χ = ${round(chi, 4)}`,
    },
    {
      equacao: 'N_{c,Rd} = χ·Q·A_g·f_y / γ_{a1}',
      substituicao: `N_{c,Rd} = ${round(chi, 4)} · ${round(Q, 2)} · ${round(e.Ag)} · ${round(e.fy)} / (10 · ${GAMMA_A1})`,
      resultado: `N_{c,Rd} = ${round(NcRd)} kN`,
    },
  ]

  return {
    NcRd,
    Ne,
    NeX,
    NeY,
    lambda0,
    chi,
    Q,
    eixoGovernante,
    esbeltezX,
    esbeltezY,
    utilizacao,
    status,
    passos,
    referencia: 'NBR 8800:2008 §5.3 — curva SSRC (0,658^(λ₀²))',
  }
}
