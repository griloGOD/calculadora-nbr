/**
 * NBR 8800:2008 — Seção 5 (Barras submetidas à força axial de tração)
 *
 * Estados-limite últimos:
 *  (a) escoamento da seção bruta → NtRd = Ag · fy / γa1
 *  (b) ruptura da seção líquida  → NtRd = Ae · fu / γa2
 */

import { GAMMA_A1, GAMMA_A2 } from '@/catalogo/materiais'

export interface EntradasTracao {
  Ag: number // cm²  (área bruta)
  fy: number // MPa  (tensão de escoamento)
  fu: number // MPa  (tensão de ruptura)
  Ct: number // coeficiente de redução de área líquida (NBR 8800 §5.2.5)
  An?: number // cm²  (área líquida) — se omitido, usa Ag
  Nsd?: number // kN  (esforço solicitante de cálculo para utilização)
}

export interface PassoCalculo {
  equacao: string
  substituicao: string
  resultado: string
}

export interface ResultadoEstado {
  NRd: number // kN
  estadoLimite: string
  referencia: string
  passos: PassoCalculo[]
}

export interface ResultadoTracao {
  NtRd: number // kN — menor dos dois estados
  governante: 'escoamento' | 'ruptura'
  escoamento: ResultadoEstado
  ruptura: ResultadoEstado
  utilizacao?: number // η = Nsd / NtRd
  status?: 'ok' | 'alerta' | 'nok'
}

function round(n: number, d = 2) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

/**
 * Escoamento da seção bruta.
 * NtRd = Ag · fy / γa1  (kN)
 * Ag [cm²] × fy [MPa = N/mm² = 10 N/cm² · 0.1 → kN/cm²] · fy/10 → kN
 */
export function escoamentoSecaoBruta(e: EntradasTracao): ResultadoEstado {
  const fyKNcm2 = e.fy / 10 // MPa → kN/cm²
  const NRd = (e.Ag * fyKNcm2) / GAMMA_A1

  return {
    NRd,
    estadoLimite: 'Escoamento da seção bruta',
    referencia: 'NBR 8800:2008 §5.2.2(a)',
    passos: [
      {
        equacao: 'N_{t,Rd} = A_g · f_y / γ_{a1}',
        substituicao: `N_{t,Rd} = ${round(e.Ag)} · ${round(e.fy)} / (10 · ${GAMMA_A1})`,
        resultado: `N_{t,Rd} = ${round(NRd)} kN`,
      },
    ],
  }
}

/**
 * Ruptura da seção líquida.
 * Ae = Ct · An   (§5.2.5)
 * NtRd = Ae · fu / γa2  (kN)
 */
export function rupturaSecaoLiquida(e: EntradasTracao): ResultadoEstado {
  const An = e.An ?? e.Ag
  const Ae = e.Ct * An
  const fuKNcm2 = e.fu / 10
  const NRd = (Ae * fuKNcm2) / GAMMA_A2

  return {
    NRd,
    estadoLimite: 'Ruptura da seção líquida efetiva',
    referencia: 'NBR 8800:2008 §5.2.2(b) e §5.2.5',
    passos: [
      {
        equacao: 'A_e = C_t · A_n',
        substituicao: `A_e = ${round(e.Ct, 3)} · ${round(An)}`,
        resultado: `A_e = ${round(Ae)} cm²`,
      },
      {
        equacao: 'N_{t,Rd} = A_e · f_u / γ_{a2}',
        substituicao: `N_{t,Rd} = ${round(Ae)} · ${round(e.fu)} / (10 · ${GAMMA_A2})`,
        resultado: `N_{t,Rd} = ${round(NRd)} kN`,
      },
    ],
  }
}

export function calcularTracao(e: EntradasTracao): ResultadoTracao {
  const esc = escoamentoSecaoBruta(e)
  const rup = rupturaSecaoLiquida(e)

  const governante: 'escoamento' | 'ruptura' =
    esc.NRd <= rup.NRd ? 'escoamento' : 'ruptura'
  const NtRd = Math.min(esc.NRd, rup.NRd)

  let utilizacao: number | undefined
  let status: 'ok' | 'alerta' | 'nok' | undefined
  if (e.Nsd !== undefined && NtRd > 0) {
    utilizacao = e.Nsd / NtRd
    if (utilizacao > 1) status = 'nok'
    else if (utilizacao > 0.8) status = 'alerta'
    else status = 'ok'
  }

  return {
    NtRd,
    governante,
    escoamento: esc,
    ruptura: rup,
    utilizacao,
    status,
  }
}
