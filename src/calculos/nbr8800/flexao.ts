/**
 * NBR 8800:2008 — Seção 5.4 e Anexo G
 * Flexão em perfis I com dois eixos de simetria, fletido em relação ao eixo
 * central de maior inércia (eixo x-x, eixo forte).
 *
 * Três estados-limite são verificados e o governante é o menor Mn:
 *   - FLT: Flambagem Lateral com Torção
 *   - FLM: Flambagem Local da Mesa comprimida
 *   - FLA: Flambagem Local da Alma
 *
 * MRd = Mn / γa1
 */

import { GAMMA_A1, MODULO_CISALHAMENTO_ACO, MODULO_ELASTICIDADE_ACO } from '@/catalogo/materiais'
import type { PassoCalculo } from './tracao'

export type Regime = 'compacto' | 'semi-compacto' | 'esbelto'

export interface EntradasFlexao {
  // Geometria do perfil (mm e cm)
  d: number // mm
  bf: number // mm
  tf: number // mm
  tw: number // mm
  Ag: number // cm²
  Iy: number // cm⁴
  ry: number // cm
  Zx: number // cm³
  Wx: number // cm³  (módulo elástico Sx)
  J: number // cm⁴
  Cw: number // cm⁶ × 10³ (mantido como 10³·cm⁶ no catálogo)
  // Material
  fy: number // MPa
  E?: number // MPa
  G?: number // MPa
  // Parâmetros de cálculo
  Lb: number // cm — comprimento destravado lateralmente
  Cb?: number // fator de momento uniforme equivalente
  MSd?: number // kN·m — solicitação
}

export interface ResultadoFlexaoEstado {
  estado: 'FLT' | 'FLM' | 'FLA'
  regime: Regime
  lambda: number
  lambdap: number
  lambdar: number
  Mn: number // kN·cm
  passos: PassoCalculo[]
}

export interface ResultadoFlexao {
  MRd: number // kN·m
  MRdKNcm: number // kN·cm
  governante: 'FLT' | 'FLM' | 'FLA'
  Mpl: number // kN·cm
  Mr: number // kN·cm (FLT)
  estados: {
    flt: ResultadoFlexaoEstado
    flm: ResultadoFlexaoEstado
    fla: ResultadoFlexaoEstado
  }
  utilizacao?: number
  status?: 'ok' | 'alerta' | 'nok'
  Cb: number
  referencia: string
}

const SIGMA_R_FRACTION = 0.3 // σr = 0,3·fy (tensão residual nas mesas)

function r(n: number, d = 2) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

/**
 * Flambagem Lateral com Torção (FLT) — NBR 8800 Anexo G, Tabela G.1, caso I.
 * λ = Lb / ry
 * λp = 1,76·√(E/fy)
 * λr (forma simplificada prática — perfis I duplamente simétricos):
 *      λr = (1,38·√(Iy·J)) / (ry·J·β1) · √(1 + √(1 + 27·Cw·β1²/Iy))
 *      β1 = (fy - σr) · Wx / (E·J)
 *
 * Mpl = Zx·fy
 * Mr  = (fy - σr)·Wx   (plastificação inicial com tensões residuais)
 *
 * Regimes:
 *   λ ≤ λp           → Mn = Mpl  (compacto)
 *   λp < λ ≤ λr      → Mn = Cb·[Mpl − (Mpl − Mr)·(λ − λp)/(λr − λp)] ≤ Mpl
 *   λ > λr           → Mn = Mcr = Cb·π/Lb · √(E·Iy·G·J + (π·E/Lb)²·Iy·Cw) ≤ Mpl
 *
 * Unidades internas: kN, cm, MPa convertidos → kN/cm² (÷10).
 */
function calcularFLT(e: EntradasFlexao, Cb: number): ResultadoFlexaoEstado {
  const E = e.E ?? MODULO_ELASTICIDADE_ACO
  const G = e.G ?? MODULO_CISALHAMENTO_ACO
  const Ekncm2 = E / 10
  const Gkncm2 = G / 10
  const fyKNcm2 = e.fy / 10
  const sigmaR = SIGMA_R_FRACTION * e.fy
  const fyLiqKNcm2 = (e.fy - sigmaR) / 10

  // Catálogo armazena Cw em 10³·cm⁶ → converter
  const Cw = e.Cw * 1000 // cm⁶

  const lambda = e.Lb / e.ry
  const lambdap = 1.76 * Math.sqrt(Ekncm2 / fyKNcm2)

  // λr (caso I duplamente simétrico, perfil laminado): expressão completa
  const beta1 = (fyLiqKNcm2 * e.Wx) / (Ekncm2 * e.J)
  const beta2 = (27 * Cw * beta1 * beta1) / e.Iy
  const lambdar =
    ((1.38 * Math.sqrt(e.Iy * e.J)) / (e.ry * e.J * beta1)) *
    Math.sqrt(1 + Math.sqrt(1 + beta2))

  const Mpl = e.Zx * fyKNcm2 // kN·cm
  const Mr = fyLiqKNcm2 * e.Wx // kN·cm

  let Mn: number
  let regime: Regime
  const passos: PassoCalculo[] = [
    {
      equacao: 'λ = L_b / r_y',
      substituicao: `λ = ${r(e.Lb)} / ${r(e.ry)}`,
      resultado: `λ = ${r(lambda)}`,
    },
    {
      equacao: 'λ_p = 1,76·√(E/f_y)',
      substituicao: `λ_p = 1,76·√(${r(Ekncm2)}/${r(fyKNcm2)})`,
      resultado: `λ_p = ${r(lambdap)}`,
    },
    {
      equacao: 'λ_r (Anexo G, caso I duplamente simétrico)',
      substituicao: `β₁ = (f_y−σ_r)·W_x / (E·J) = ${r(beta1, 5)}`,
      resultado: `λ_r = ${r(lambdar)}`,
    },
    {
      equacao: 'M_pl = Z_x·f_y',
      substituicao: `M_pl = ${r(e.Zx)} · ${r(fyKNcm2, 3)}`,
      resultado: `M_pl = ${r(Mpl)} kN·cm`,
    },
    {
      equacao: 'M_r = (f_y − 0,3·f_y)·W_x',
      substituicao: `M_r = ${r(fyLiqKNcm2, 3)} · ${r(e.Wx)}`,
      resultado: `M_r = ${r(Mr)} kN·cm`,
    },
  ]

  if (lambda <= lambdap) {
    regime = 'compacto'
    Mn = Mpl
    passos.push({
      equacao: 'λ ≤ λ_p  →  M_n = M_pl',
      substituicao: '—',
      resultado: `M_n = ${r(Mn)} kN·cm`,
    })
  } else if (lambda <= lambdar) {
    regime = 'semi-compacto'
    const Mninterp =
      Cb * (Mpl - (Mpl - Mr) * ((lambda - lambdap) / (lambdar - lambdap)))
    Mn = Math.min(Mninterp, Mpl)
    passos.push({
      equacao: 'λ_p < λ ≤ λ_r  →  M_n = C_b·[M_pl − (M_pl − M_r)·(λ − λ_p)/(λ_r − λ_p)]',
      substituicao: `M_n = ${r(Cb, 2)}·[${r(Mpl)} − (${r(Mpl)} − ${r(Mr)})·(${r(lambda)} − ${r(lambdap)})/(${r(lambdar)} − ${r(lambdap)})]`,
      resultado: `M_n = min(${r(Mninterp)}, M_pl) = ${r(Mn)} kN·cm`,
    })
  } else {
    regime = 'esbelto'
    // Mcr = Cb·π/Lb · √(E·Iy·G·J + (π·E/Lb)²·Iy·Cw)
    const piEoverLb = (Math.PI * Ekncm2) / e.Lb
    const Mcr =
      ((Cb * Math.PI) / e.Lb) *
      Math.sqrt(Ekncm2 * e.Iy * Gkncm2 * e.J + piEoverLb * piEoverLb * e.Iy * Cw)
    Mn = Math.min(Mcr, Mpl)
    passos.push({
      equacao: 'λ > λ_r  →  M_n = M_cr = C_b·π/L_b · √(E·I_y·G·J + (π·E/L_b)²·I_y·C_w)',
      substituicao: `(E, G em kN/cm²; I_y, J em cm⁴; C_w em cm⁶)`,
      resultado: `M_cr = ${r(Mcr)} kN·cm  →  M_n = ${r(Mn)} kN·cm`,
    })
  }

  return {
    estado: 'FLT',
    regime,
    lambda,
    lambdap,
    lambdar,
    Mn,
    passos,
  }
}

/**
 * Flambagem Local da Mesa (FLM) — NBR 8800 Tabela G.1 caso II.
 * λ = (bf/2) / tf
 * λp = 0,38·√(E/fy)
 * λr = 0,83·√(E/(fy − σr))
 * Mpl = Zx·fy
 * Mr  = (fy − σr)·Wx
 *
 * Mn igual a FLT mas sem Cb (Cb = 1 implícito) e sem Mcr via empenamento;
 * para λ > λr usa-se Mcr = 0,69·E·Wx/λ²  (fórmula simplificada de perfil
 * com mesas esbeltas — §G.2.2).
 */
function calcularFLM(e: EntradasFlexao): ResultadoFlexaoEstado {
  const E = e.E ?? MODULO_ELASTICIDADE_ACO
  const Ekncm2 = E / 10
  const fyKNcm2 = e.fy / 10
  const sigmaR = SIGMA_R_FRACTION * e.fy
  const fyLiqKNcm2 = (e.fy - sigmaR) / 10

  const lambda = e.bf / 2 / e.tf
  const lambdap = 0.38 * Math.sqrt(Ekncm2 / fyKNcm2)
  const lambdar = 0.83 * Math.sqrt(Ekncm2 / fyLiqKNcm2)

  const Mpl = e.Zx * fyKNcm2
  const Mr = fyLiqKNcm2 * e.Wx

  let Mn: number
  let regime: Regime
  const passos: PassoCalculo[] = [
    {
      equacao: 'λ = (b_f/2) / t_f',
      substituicao: `λ = (${r(e.bf)}/2) / ${r(e.tf)}`,
      resultado: `λ = ${r(lambda)}`,
    },
    {
      equacao: 'λ_p = 0,38·√(E/f_y)',
      substituicao: `λ_p = 0,38·√(${r(Ekncm2)}/${r(fyKNcm2)})`,
      resultado: `λ_p = ${r(lambdap)}`,
    },
    {
      equacao: 'λ_r = 0,83·√(E/(f_y − σ_r))',
      substituicao: `λ_r = 0,83·√(${r(Ekncm2)}/${r(fyLiqKNcm2)})`,
      resultado: `λ_r = ${r(lambdar)}`,
    },
  ]

  if (lambda <= lambdap) {
    regime = 'compacto'
    Mn = Mpl
    passos.push({
      equacao: 'λ ≤ λ_p  →  M_n = M_pl',
      substituicao: '—',
      resultado: `M_n = ${r(Mn)} kN·cm`,
    })
  } else if (lambda <= lambdar) {
    regime = 'semi-compacto'
    Mn = Mpl - (Mpl - Mr) * ((lambda - lambdap) / (lambdar - lambdap))
    passos.push({
      equacao: 'λ_p < λ ≤ λ_r  →  M_n = M_pl − (M_pl − M_r)·(λ−λ_p)/(λ_r−λ_p)',
      substituicao: `M_n = ${r(Mpl)} − (${r(Mpl)} − ${r(Mr)})·(${r(lambda)}−${r(lambdap)})/(${r(lambdar)}−${r(lambdap)})`,
      resultado: `M_n = ${r(Mn)} kN·cm`,
    })
  } else {
    regime = 'esbelto'
    const Mcr = (0.69 * Ekncm2 * e.Wx) / (lambda * lambda)
    Mn = Math.min(Mcr, Mpl)
    passos.push({
      equacao: 'λ > λ_r  →  M_cr = 0,69·E·W_x / λ²',
      substituicao: `M_cr = 0,69·${r(Ekncm2)}·${r(e.Wx)} / ${r(lambda * lambda)}`,
      resultado: `M_n = min(M_cr, M_pl) = ${r(Mn)} kN·cm`,
    })
  }

  return { estado: 'FLM', regime, lambda, lambdap, lambdar, Mn, passos }
}

/**
 * Flambagem Local da Alma (FLA) — NBR 8800 Tabela G.1 caso III.
 * λ = h / tw  (h ≈ d − 2·tf − 2·r ≈ d − 2·tf ao desprezar raios)
 * λp = 3,76·√(E/fy)
 * λr = 5,70·√(E/fy)
 * Para λ > λr a alma é classificada como esbelta — exige verificação pelo
 * método da §G.2 com redução de seção efetiva (fora do escopo MVP).
 */
function calcularFLA(e: EntradasFlexao): ResultadoFlexaoEstado {
  const E = e.E ?? MODULO_ELASTICIDADE_ACO
  const Ekncm2 = E / 10
  const fyKNcm2 = e.fy / 10
  const sigmaR = SIGMA_R_FRACTION * e.fy
  const fyLiqKNcm2 = (e.fy - sigmaR) / 10

  const h = e.d - 2 * e.tf // mm
  const lambda = h / e.tw
  const lambdap = 3.76 * Math.sqrt(Ekncm2 / fyKNcm2)
  const lambdar = 5.7 * Math.sqrt(Ekncm2 / fyKNcm2)

  const Mpl = e.Zx * fyKNcm2
  const Mr = fyLiqKNcm2 * e.Wx

  let Mn: number
  let regime: Regime
  const passos: PassoCalculo[] = [
    {
      equacao: 'λ = h / t_w  (h = d − 2·t_f)',
      substituicao: `λ = ${r(h)} / ${r(e.tw)}`,
      resultado: `λ = ${r(lambda)}`,
    },
    {
      equacao: 'λ_p = 3,76·√(E/f_y)',
      substituicao: `λ_p = 3,76·√(${r(Ekncm2)}/${r(fyKNcm2)})`,
      resultado: `λ_p = ${r(lambdap)}`,
    },
    {
      equacao: 'λ_r = 5,70·√(E/f_y)',
      substituicao: `λ_r = 5,70·√(${r(Ekncm2)}/${r(fyKNcm2)})`,
      resultado: `λ_r = ${r(lambdar)}`,
    },
  ]

  if (lambda <= lambdap) {
    regime = 'compacto'
    Mn = Mpl
    passos.push({
      equacao: 'λ ≤ λ_p  →  M_n = M_pl',
      substituicao: '—',
      resultado: `M_n = ${r(Mn)} kN·cm`,
    })
  } else if (lambda <= lambdar) {
    regime = 'semi-compacto'
    Mn = Mpl - (Mpl - Mr) * ((lambda - lambdap) / (lambdar - lambdap))
    passos.push({
      equacao: 'λ_p < λ ≤ λ_r  →  interpolação linear entre M_pl e M_r',
      substituicao: `M_n = ${r(Mpl)} − (${r(Mpl)} − ${r(Mr)})·(${r(lambda)}−${r(lambdap)})/(${r(lambdar)}−${r(lambdap)})`,
      resultado: `M_n = ${r(Mn)} kN·cm`,
    })
  } else {
    regime = 'esbelto'
    Mn = Mr // conservador — seção efetiva reduzida fora do MVP
    passos.push({
      equacao: 'λ > λ_r — alma esbelta',
      substituicao: 'MVP conservador: M_n = M_r (ver §G.2 para seção efetiva)',
      resultado: `M_n = ${r(Mn)} kN·cm`,
    })
  }

  return { estado: 'FLA', regime, lambda, lambdap, lambdar, Mn, passos }
}

export function calcularFlexao(e: EntradasFlexao): ResultadoFlexao {
  const Cb = e.Cb ?? 1.0

  const flt = calcularFLT(e, Cb)
  const flm = calcularFLM(e)
  const fla = calcularFLA(e)

  const Mn = Math.min(flt.Mn, flm.Mn, fla.Mn)
  const MRdKNcm = Mn / GAMMA_A1
  const MRd = MRdKNcm / 100 // kN·m

  let gov: 'FLT' | 'FLM' | 'FLA' = 'FLT'
  if (flm.Mn === Mn) gov = 'FLM'
  if (fla.Mn === Mn) gov = 'FLA'
  if (flt.Mn === Mn) gov = 'FLT'

  const fyKNcm2 = e.fy / 10
  const Mpl = e.Zx * fyKNcm2
  const Mr = ((e.fy - SIGMA_R_FRACTION * e.fy) / 10) * e.Wx

  let utilizacao: number | undefined
  let status: 'ok' | 'alerta' | 'nok' | undefined
  if (e.MSd !== undefined && MRd > 0) {
    utilizacao = e.MSd / MRd
    if (utilizacao > 1) status = 'nok'
    else if (utilizacao > 0.8) status = 'alerta'
    else status = 'ok'
  }

  return {
    MRd,
    MRdKNcm,
    governante: gov,
    Mpl,
    Mr,
    Cb,
    estados: { flt, flm, fla },
    utilizacao,
    status,
    referencia: 'NBR 8800:2008 §5.4 e Anexo G — Tabela G.1 (perfis I)',
  }
}
