/**
 * NBR 8800:2008 — §5.5 (Esforços combinados: flexo-compressão)
 *
 * Interação em barras simétricas submetidas a N + M em dois eixos:
 *
 *   Se N_Sd / N_Rd ≥ 0,2:
 *     N_Sd/N_Rd + (8/9)·(M_x,Sd/M_x,Rd + M_y,Sd/M_y,Rd) ≤ 1,0
 *
 *   Se N_Sd / N_Rd < 0,2:
 *     N_Sd/(2·N_Rd) + (M_x,Sd/M_x,Rd + M_y,Sd/M_y,Rd) ≤ 1,0
 *
 * N_Rd:
 *   - compressão (N_c,Rd) se N_Sd > 0 em compressão
 *   - tração (N_t,Rd) se N_Sd é de tração
 */

import type { PassoCalculo } from './tracao'

export interface EntradasFlexoCompressao {
  NSd: number // kN (positivo = compressão)
  NRd: number // kN (NcRd ou NtRd)
  MxSd: number // kN·m
  MxRd: number // kN·m (resistência flexão eixo x)
  MySd: number // kN·m
  MyRd?: number // kN·m (eixo y — opcional)
}

export interface ResultadoFlexoCompressao {
  razaoN: number // NSd / NRd
  caso: 'alta' | 'baixa' // ≥0.2 ou <0.2
  utilizacao: number
  status: 'ok' | 'alerta' | 'nok'
  passos: PassoCalculo[]
  referencia: string
}

function r(n: number, d = 3) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

export function calcularFlexoCompressao(
  e: EntradasFlexoCompressao,
): ResultadoFlexoCompressao {
  const razaoN = e.NRd > 0 ? e.NSd / e.NRd : 0

  const Rx = e.MxRd > 0 ? e.MxSd / e.MxRd : 0
  const Ry = e.MyRd && e.MyRd > 0 ? e.MySd / e.MyRd : 0

  let utilizacao: number
  let caso: 'alta' | 'baixa'
  const passos: PassoCalculo[] = [
    {
      equacao: 'N_Sd / N_Rd',
      substituicao: `${r(e.NSd, 2)} / ${r(e.NRd, 2)}`,
      resultado: `${r(razaoN, 3)}`,
    },
    {
      equacao: 'M_x,Sd / M_x,Rd',
      substituicao: `${r(e.MxSd, 2)} / ${r(e.MxRd, 2)}`,
      resultado: `${r(Rx, 3)}`,
    },
  ]
  if (e.MyRd !== undefined) {
    passos.push({
      equacao: 'M_y,Sd / M_y,Rd',
      substituicao: `${r(e.MySd, 2)} / ${r(e.MyRd, 2)}`,
      resultado: `${r(Ry, 3)}`,
    })
  }

  if (razaoN >= 0.2) {
    caso = 'alta'
    utilizacao = razaoN + (8 / 9) * (Rx + Ry)
    passos.push({
      equacao: 'N_Sd/N_Rd ≥ 0,2  →  η = N_Sd/N_Rd + (8/9)·(M_x/M_x,Rd + M_y/M_y,Rd)',
      substituicao: `η = ${r(razaoN)} + (8/9)·(${r(Rx)} + ${r(Ry)})`,
      resultado: `η = ${r(utilizacao)}`,
    })
  } else {
    caso = 'baixa'
    utilizacao = razaoN / 2 + (Rx + Ry)
    passos.push({
      equacao: 'N_Sd/N_Rd < 0,2  →  η = N_Sd/(2·N_Rd) + (M_x/M_x,Rd + M_y/M_y,Rd)',
      substituicao: `η = ${r(razaoN)}/2 + (${r(Rx)} + ${r(Ry)})`,
      resultado: `η = ${r(utilizacao)}`,
    })
  }

  let status: 'ok' | 'alerta' | 'nok'
  if (utilizacao > 1) status = 'nok'
  else if (utilizacao > 0.8) status = 'alerta'
  else status = 'ok'

  return {
    razaoN,
    caso,
    utilizacao,
    status,
    passos,
    referencia: 'NBR 8800:2008 §5.5 — Interação flexo-compressão',
  }
}
