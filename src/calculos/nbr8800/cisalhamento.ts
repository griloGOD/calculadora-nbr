/**
 * NBR 8800:2008 — §5.4.3 (Força cortante em alma de perfis I, H e U)
 *
 * Aw = d · tw  (área da alma, área efetiva de cisalhamento)
 * λ  = h / tw
 * kv = 5,0             → sem enrijecedores ou a/h > 3
 *    = 5 + 5/(a/h)²    → com enrijecedores transversais
 * λp = 1,10·√(kv·E/fy)
 * λr = 1,37·√(kv·E/fy)
 * Vpl = 0,60 · Aw · fy
 *
 * λ ≤ λp                     → VRd = Vpl / γa1
 * λp < λ ≤ λr                → VRd = (λp/λ)·Vpl / γa1     (escoamento com flambagem)
 * λ > λr                     → VRd = 1,24·(λp/λ)²·Vpl / γa1  (flambagem elástica)
 */

import { GAMMA_A1, MODULO_ELASTICIDADE_ACO } from '@/catalogo/materiais'
import type { PassoCalculo } from './tracao'

export interface EntradasCisalhamento {
  d: number // mm
  tf: number // mm
  tw: number // mm
  fy: number // MPa
  E?: number // MPa
  a?: number // cm (espaçamento de enrijecedores transversais; opcional)
  VSd?: number // kN
}

export interface ResultadoCisalhamento {
  VRd: number // kN
  Vpl: number // kN
  Aw: number // cm²
  lambda: number
  lambdap: number
  lambdar: number
  kv: number
  regime: 'compacto' | 'semi-compacto' | 'esbelto'
  h: number // mm
  passos: PassoCalculo[]
  utilizacao?: number
  status?: 'ok' | 'alerta' | 'nok'
  referencia: string
}

function r(n: number, d = 2) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

export function calcularCisalhamento(e: EntradasCisalhamento): ResultadoCisalhamento {
  const E = e.E ?? MODULO_ELASTICIDADE_ACO
  const Ekncm2 = E / 10
  const fyKNcm2 = e.fy / 10

  // d em mm → converter para cm para Aw
  const dCm = e.d / 10
  const twCm = e.tw / 10
  const Aw = dCm * twCm

  const h = e.d - 2 * e.tf // mm
  const lambda = h / e.tw

  // kv
  let kv = 5.0
  if (e.a !== undefined && e.a > 0) {
    const aCm = e.a
    const hCm = h / 10
    const aOverH = aCm / hCm
    if (aOverH <= 3) {
      kv = 5 + 5 / (aOverH * aOverH)
    }
  }

  const lambdap = 1.1 * Math.sqrt((kv * Ekncm2) / fyKNcm2)
  const lambdar = 1.37 * Math.sqrt((kv * Ekncm2) / fyKNcm2)

  const Vpl = 0.6 * Aw * fyKNcm2 // kN

  let VRd: number
  let regime: 'compacto' | 'semi-compacto' | 'esbelto'
  const passos: PassoCalculo[] = [
    {
      equacao: 'A_w = d · t_w',
      substituicao: `A_w = ${r(dCm)} · ${r(twCm, 3)}`,
      resultado: `A_w = ${r(Aw)} cm²`,
    },
    {
      equacao: 'λ = h / t_w  (h = d − 2·t_f)',
      substituicao: `λ = ${r(h)} / ${r(e.tw)}`,
      resultado: `λ = ${r(lambda)}`,
    },
    {
      equacao: 'k_v',
      substituicao:
        e.a !== undefined && e.a > 0
          ? `a/h = ${r((e.a * 10) / h, 2)} → k_v = 5 + 5/(a/h)²`
          : 'sem enrijecedores → k_v = 5,0',
      resultado: `k_v = ${r(kv)}`,
    },
    {
      equacao: 'λ_p = 1,10·√(k_v·E/f_y)',
      substituicao: `λ_p = 1,10·√(${r(kv)}·${r(Ekncm2)}/${r(fyKNcm2)})`,
      resultado: `λ_p = ${r(lambdap)}`,
    },
    {
      equacao: 'λ_r = 1,37·√(k_v·E/f_y)',
      substituicao: `λ_r = 1,37·√(${r(kv)}·${r(Ekncm2)}/${r(fyKNcm2)})`,
      resultado: `λ_r = ${r(lambdar)}`,
    },
    {
      equacao: 'V_pl = 0,60·A_w·f_y',
      substituicao: `V_pl = 0,60·${r(Aw)}·${r(fyKNcm2, 3)}`,
      resultado: `V_pl = ${r(Vpl)} kN`,
    },
  ]

  if (lambda <= lambdap) {
    regime = 'compacto'
    VRd = Vpl / GAMMA_A1
    passos.push({
      equacao: 'λ ≤ λ_p  →  V_Rd = V_pl / γ_{a1}',
      substituicao: `V_Rd = ${r(Vpl)} / ${GAMMA_A1}`,
      resultado: `V_Rd = ${r(VRd)} kN`,
    })
  } else if (lambda <= lambdar) {
    regime = 'semi-compacto'
    VRd = ((lambdap / lambda) * Vpl) / GAMMA_A1
    passos.push({
      equacao: 'λ_p < λ ≤ λ_r  →  V_Rd = (λ_p/λ)·V_pl / γ_{a1}',
      substituicao: `V_Rd = (${r(lambdap)}/${r(lambda)})·${r(Vpl)} / ${GAMMA_A1}`,
      resultado: `V_Rd = ${r(VRd)} kN`,
    })
  } else {
    regime = 'esbelto'
    VRd = (1.24 * (lambdap / lambda) ** 2 * Vpl) / GAMMA_A1
    passos.push({
      equacao: 'λ > λ_r  →  V_Rd = 1,24·(λ_p/λ)²·V_pl / γ_{a1}',
      substituicao: `V_Rd = 1,24·(${r(lambdap)}/${r(lambda)})²·${r(Vpl)} / ${GAMMA_A1}`,
      resultado: `V_Rd = ${r(VRd)} kN`,
    })
  }

  let utilizacao: number | undefined
  let status: 'ok' | 'alerta' | 'nok' | undefined
  if (e.VSd !== undefined && VRd > 0) {
    utilizacao = e.VSd / VRd
    if (utilizacao > 1) status = 'nok'
    else if (utilizacao > 0.8) status = 'alerta'
    else status = 'ok'
  }

  return {
    VRd,
    Vpl,
    Aw,
    lambda,
    lambdap,
    lambdar,
    kv,
    regime,
    h,
    passos,
    utilizacao,
    status,
    referencia: 'NBR 8800:2008 §5.4.3 — Força cortante em alma',
  }
}
