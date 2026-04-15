/**
 * NBR 8800:2008 — §6.2.6 (Solda de filete)
 *
 * Dois estados-limite:
 *   - Metal da solda:  F_{w,Rd} = 0,60 · f_{w} · A_{w,garganta} / γ_{w2}
 *                       A_{w,garganta} = a · L_w  com a = 0,7·p (garganta efetiva)
 *   - Metal base adjacente: F_{wb,Rd} = 0,60 · f_u · A_{MB} / γ_{a2}
 *                            A_{MB} = t · L_w  (área do metal base)
 *
 * γ_{w2} = 1,35 (coeficiente para metal da solda — vide Tabela 10)
 */

import { GAMMA_A2 } from '@/catalogo/materiais'
import type { PassoCalculo } from './tracao'

const GAMMA_W2 = 1.35

export interface EntradasSoldaFilete {
  p: number // perna do cordão [mm]
  Lw: number // comprimento efetivo [mm]
  fuE: number // resistência do metal da solda (eletrodo) [MPa]
  fu: number // resistência à ruptura do metal base [MPa]
  t: number // espessura do metal base adjacente [mm]
  FSd?: number // kN — força solicitante
}

export interface ResultadoSoldaFilete {
  a: number // garganta efetiva [mm]
  FwRd: number // kN — metal da solda
  FwbRd: number // kN — metal base
  FRd: number // kN — governante
  governante: 'metal-solda' | 'metal-base'
  utilizacao?: number
  status?: 'ok' | 'alerta' | 'nok'
  passos: PassoCalculo[]
  referencia: string
}

function r(n: number, d = 2) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

export function calcularSoldaFilete(e: EntradasSoldaFilete): ResultadoSoldaFilete {
  const a = 0.7 * e.p // garganta efetiva [mm]
  const Aw = a * e.Lw // mm²
  const AMB = e.t * e.Lw // mm²

  const FwRd = (0.6 * e.fuE * Aw) / GAMMA_W2 / 1000 // kN
  const FwbRd = (0.6 * e.fu * AMB) / GAMMA_A2 / 1000 // kN

  const FRd = Math.min(FwRd, FwbRd)
  const governante: 'metal-solda' | 'metal-base' = FwRd <= FwbRd ? 'metal-solda' : 'metal-base'

  let utilizacao: number | undefined
  let status: 'ok' | 'alerta' | 'nok' | undefined
  if (e.FSd !== undefined && FRd > 0) {
    utilizacao = e.FSd / FRd
    if (utilizacao > 1) status = 'nok'
    else if (utilizacao > 0.8) status = 'alerta'
    else status = 'ok'
  }

  const passos: PassoCalculo[] = [
    {
      equacao: 'a = 0,7·p (garganta efetiva da solda)',
      substituicao: `a = 0,7·${r(e.p)}`,
      resultado: `a = ${r(a)} mm`,
    },
    {
      equacao: 'A_{w} = a·L_w',
      substituicao: `A_{w} = ${r(a)}·${r(e.Lw)}`,
      resultado: `A_{w} = ${r(Aw)} mm²`,
    },
    {
      equacao: 'F_{w,Rd} = 0,60·f_{w}·A_{w} / γ_{w2}',
      substituicao: `F_{w,Rd} = 0,60·${r(e.fuE)}·${r(Aw)} / (1000·${GAMMA_W2})`,
      resultado: `F_{w,Rd} = ${r(FwRd)} kN  (metal da solda)`,
    },
    {
      equacao: 'A_{MB} = t·L_w',
      substituicao: `A_{MB} = ${r(e.t)}·${r(e.Lw)}`,
      resultado: `A_{MB} = ${r(AMB)} mm²`,
    },
    {
      equacao: 'F_{wb,Rd} = 0,60·f_u·A_{MB} / γ_{a2}',
      substituicao: `F_{wb,Rd} = 0,60·${r(e.fu)}·${r(AMB)} / (1000·${GAMMA_A2})`,
      resultado: `F_{wb,Rd} = ${r(FwbRd)} kN  (metal base)`,
    },
    {
      equacao: 'F_{Rd} = min(F_{w,Rd}, F_{wb,Rd})',
      substituicao: `min(${r(FwRd)}, ${r(FwbRd)})`,
      resultado: `F_{Rd} = ${r(FRd)} kN  (governa ${governante === 'metal-solda' ? 'metal da solda' : 'metal base'})`,
    },
  ]

  return {
    a,
    FwRd,
    FwbRd,
    FRd,
    governante,
    utilizacao,
    status,
    passos,
    referencia: 'NBR 8800:2008 §6.2.6 — Solda de filete',
  }
}
