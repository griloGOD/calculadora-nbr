/**
 * NBR 8800:2008 — §6.3 (Ligações parafusadas)
 *
 * Estados-limite verificados:
 *  a) Força resistente ao cisalhamento do parafuso    (FvRd)
 *  b) Força resistente à tração do parafuso           (FtRd)
 *  c) Interação cisalhamento + tração                 (§6.3.3)
 *  d) Esmagamento da chapa (bearing)                  (§6.3.4)
 *  e) Ruptura por cisalhamento de bloco (simplificado — fora do MVP)
 *  f) Ligação por atrito (HSFG)                       (§6.3.5)
 */

import { GAMMA_A2, GAMMA_A3 } from '@/catalogo/materiais'
import type { PassoCalculo } from './tracao'

export type PlanoCisalhamento = 'rosca' | 'fuste'
export type TipoLigacao = 'apoio' | 'atrito'

export interface EntradasParafuso {
  // Parafuso
  d: number // mm
  Ab: number // mm²
  Ae: number // mm² (área efetiva)
  fub: number // MPa
  // Configuração do cisalhamento
  plano: PlanoCisalhamento
  numParafusos: number // total de parafusos na ligação
  numPlanosCorte: number // planos de corte por parafuso (geralmente 1 ou 2)
  // Chapa (para esmagamento)
  t: number // mm (espessura)
  fuChapa: number // MPa
  e1: number // mm (distância borda na direção da força)
  p1: number // mm (espaçamento longitudinal)
  // Solicitações de cálculo por parafuso
  FvSd?: number // kN (cisalhamento — força total)
  FtSd?: number // kN (tração — força total)
  // Ligação por atrito
  tipoLigacao: TipoLigacao
  mu?: number // coef. atrito
  Nb?: number // número de planos de atrito
}

export interface VerificacaoParafuso {
  titulo: string
  valor: number // kN
  solicitacao?: number // kN
  utilizacao?: number
  passos: PassoCalculo[]
  referencia: string
}

export interface ResultadoParafuso {
  FvRdPorParafuso: number // kN — cisalhamento
  FvRdTotal: number // kN
  FtRdPorParafuso: number // kN — tração
  FtRdTotal: number // kN
  FbRdPorParafuso: number // kN — esmagamento
  FbRdTotal: number // kN
  FvAtritoPorParafuso?: number // kN
  FvAtritoTotal?: number // kN
  interacao?: number // (FvSd/FvRd)² + (FtSd/FtRd)²
  utilizacaoGovernante: number
  statusGovernante: 'ok' | 'alerta' | 'nok'
  estadoGovernante: string
  verificacoes: VerificacaoParafuso[]
}

function r(n: number, d = 2) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

function classify(eta: number): 'ok' | 'alerta' | 'nok' {
  if (eta > 1) return 'nok'
  if (eta > 0.8) return 'alerta'
  return 'ok'
}

export function calcularParafusos(e: EntradasParafuso): ResultadoParafuso {
  // a) Cisalhamento — §6.3.3.1
  // Plano passando pela rosca: FvRd = 0,4·fub·Ab / γa2
  // Plano passando pelo fuste: FvRd = 0,5·fub·Ab / γa2
  const coefCis = e.plano === 'rosca' ? 0.4 : 0.5
  // Converter: fub [MPa = N/mm²] · Ab [mm²] = N → kN dividir por 1000
  const FvRdPorPlano = (coefCis * e.fub * e.Ab) / GAMMA_A2 / 1000 // kN
  const FvRdPorParafuso = FvRdPorPlano * e.numPlanosCorte
  const FvRdTotal = FvRdPorParafuso * e.numParafusos

  // b) Tração — §6.3.3.2
  // FtRd = 0,75·fub·Ae / γa2   (NBR usa Ae/Ab = 0,75·Ab como aproximação)
  // Forma mais correta: FtRd = 0,75·fub·Ab / γa2 (onde 0,75 inclui redução por rosca)
  const FtRdPorParafuso = (0.75 * e.fub * e.Ab) / GAMMA_A2 / 1000
  const FtRdTotal = FtRdPorParafuso * e.numParafusos

  // d) Esmagamento da chapa — §6.3.4
  // FbRd = min(1,2·lf·t·fu ; 2,4·d·t·fu) / γa2
  // lf = min(e1 - d/2; p1 - d)
  const dFuro = e.d + 1.5 // furo padrão
  const lf = Math.min(e.e1 - dFuro / 2, e.p1 - dFuro)
  const FbLim1 = (1.2 * Math.max(lf, 0) * e.t * e.fuChapa) / GAMMA_A2 / 1000
  const FbLim2 = (2.4 * e.d * e.t * e.fuChapa) / GAMMA_A2 / 1000
  const FbRdPorParafuso = Math.min(FbLim1, FbLim2)
  const FbRdTotal = FbRdPorParafuso * e.numParafusos

  // f) Ligação por atrito — §6.3.5
  let FvAtritoPorParafuso: number | undefined
  let FvAtritoTotal: number | undefined
  if (e.tipoLigacao === 'atrito' && e.mu !== undefined && e.Nb !== undefined) {
    // Pretensionamento mínimo (NBR 8800 Tabela 19): Fp = 0,7·fub·Ae
    const Fp = (0.7 * e.fub * e.Ae) / 1000 // kN
    // FvRd,atrito = μ · Nb · Fp / γa3
    FvAtritoPorParafuso = (e.mu * e.Nb * Fp) / GAMMA_A3
    FvAtritoTotal = FvAtritoPorParafuso * e.numParafusos
  }

  // Interação cisalhamento + tração (§6.3.3.3)
  let interacao: number | undefined
  if (e.FvSd && e.FtSd && e.FvSd > 0 && e.FtSd > 0) {
    const Rv = e.FvSd / FvRdTotal
    const Rt = e.FtSd / FtRdTotal
    interacao = Rv * Rv + Rt * Rt
  }

  // Construir as verificações com utilização
  const verificacoes: VerificacaoParafuso[] = []

  // V1 — Cisalhamento
  const etaCis = e.FvSd !== undefined ? e.FvSd / FvRdTotal : undefined
  verificacoes.push({
    titulo: 'Cisalhamento do parafuso (total)',
    valor: FvRdTotal,
    solicitacao: e.FvSd,
    utilizacao: etaCis,
    referencia: 'NBR 8800 §6.3.3.1',
    passos: [
      {
        equacao:
          e.plano === 'rosca'
            ? 'F_{v,Rd}^{(1)} = 0,40·f_{ub}·A_b / γ_{a2}'
            : 'F_{v,Rd}^{(1)} = 0,50·f_{ub}·A_b / γ_{a2}',
        substituicao: `F_{v,Rd}^{(1)} = ${coefCis}·${r(e.fub)}·${r(e.Ab)} / (1000·${GAMMA_A2})`,
        resultado: `${r(FvRdPorPlano)} kN por plano de corte`,
      },
      {
        equacao: 'F_{v,Rd} = F_{v,Rd}^{(1)} · nº planos · nº parafusos',
        substituicao: `${r(FvRdPorPlano)} · ${e.numPlanosCorte} · ${e.numParafusos}`,
        resultado: `F_{v,Rd} = ${r(FvRdTotal)} kN`,
      },
    ],
  })

  // V2 — Tração
  const etaTrac = e.FtSd !== undefined ? e.FtSd / FtRdTotal : undefined
  verificacoes.push({
    titulo: 'Tração do parafuso (total)',
    valor: FtRdTotal,
    solicitacao: e.FtSd,
    utilizacao: etaTrac,
    referencia: 'NBR 8800 §6.3.3.2',
    passos: [
      {
        equacao: 'F_{t,Rd}^{(1)} = 0,75·f_{ub}·A_b / γ_{a2}',
        substituicao: `F_{t,Rd}^{(1)} = 0,75·${r(e.fub)}·${r(e.Ab)} / (1000·${GAMMA_A2})`,
        resultado: `${r(FtRdPorParafuso)} kN por parafuso`,
      },
      {
        equacao: 'F_{t,Rd} = F_{t,Rd}^{(1)} · nº parafusos',
        substituicao: `${r(FtRdPorParafuso)} · ${e.numParafusos}`,
        resultado: `F_{t,Rd} = ${r(FtRdTotal)} kN`,
      },
    ],
  })

  // V3 — Esmagamento
  const etaEsmg = e.FvSd !== undefined ? e.FvSd / FbRdTotal : undefined
  verificacoes.push({
    titulo: 'Esmagamento na chapa (bearing)',
    valor: FbRdTotal,
    solicitacao: e.FvSd,
    utilizacao: etaEsmg,
    referencia: 'NBR 8800 §6.3.4',
    passos: [
      {
        equacao: 'l_f = min(e₁ − d_f/2 ; p₁ − d_f)',
        substituicao: `l_f = min(${r(e.e1)} − ${r(dFuro / 2)} ; ${r(e.p1)} − ${r(dFuro)})`,
        resultado: `l_f = ${r(lf)} mm`,
      },
      {
        equacao: 'F_{b,Rd}^{(1)} = min(1,2·l_f·t·f_u ; 2,4·d·t·f_u) / γ_{a2}',
        substituicao: `min(${r(FbLim1)} ; ${r(FbLim2)}) kN`,
        resultado: `F_{b,Rd}^{(1)} = ${r(FbRdPorParafuso)} kN por parafuso`,
      },
      {
        equacao: 'F_{b,Rd} = F_{b,Rd}^{(1)} · nº parafusos',
        substituicao: `${r(FbRdPorParafuso)} · ${e.numParafusos}`,
        resultado: `F_{b,Rd} = ${r(FbRdTotal)} kN`,
      },
    ],
  })

  // V4 — Atrito (se aplicável)
  if (FvAtritoTotal !== undefined) {
    const etaAtr = e.FvSd !== undefined ? e.FvSd / FvAtritoTotal : undefined
    verificacoes.push({
      titulo: 'Cisalhamento por atrito (HSFG)',
      valor: FvAtritoTotal,
      solicitacao: e.FvSd,
      utilizacao: etaAtr,
      referencia: 'NBR 8800 §6.3.5',
      passos: [
        {
          equacao: 'F_p = 0,7·f_{ub}·A_e',
          substituicao: `F_p = 0,7·${r(e.fub)}·${r(e.Ae)} / 1000`,
          resultado: `F_p = ${r((0.7 * e.fub * e.Ae) / 1000)} kN`,
        },
        {
          equacao: 'F_{v,Rd,atrito}^{(1)} = μ·N_b·F_p / γ_{a3}',
          substituicao: `F_{v,Rd,atrito}^{(1)} = ${e.mu}·${e.Nb}·${r((0.7 * e.fub * e.Ae) / 1000)} / ${GAMMA_A3}`,
          resultado: `${r(FvAtritoPorParafuso ?? 0)} kN por parafuso`,
        },
        {
          equacao: 'F_{v,Rd,atrito} = F_{v,Rd,atrito}^{(1)} · nº parafusos',
          substituicao: `${r(FvAtritoPorParafuso ?? 0)} · ${e.numParafusos}`,
          resultado: `F_{v,Rd,atrito} = ${r(FvAtritoTotal)} kN`,
        },
      ],
    })
  }

  // V5 — Interação (se aplicável)
  if (interacao !== undefined) {
    verificacoes.push({
      titulo: 'Interação cisalhamento + tração',
      valor: 1.0,
      utilizacao: interacao,
      referencia: 'NBR 8800 §6.3.3.3',
      passos: [
        {
          equacao: '(F_{v,Sd}/F_{v,Rd})² + (F_{t,Sd}/F_{t,Rd})² ≤ 1,0',
          substituicao: `(${r(e.FvSd ?? 0)}/${r(FvRdTotal)})² + (${r(e.FtSd ?? 0)}/${r(FtRdTotal)})²`,
          resultado: `η = ${r(interacao, 3)}`,
        },
      ],
    })
  }

  // Determinar o governante: maior utilização
  let utilizacaoGovernante = 0
  let estadoGovernante = '—'
  for (const v of verificacoes) {
    if (v.utilizacao !== undefined && v.utilizacao > utilizacaoGovernante) {
      utilizacaoGovernante = v.utilizacao
      estadoGovernante = v.titulo
    }
  }

  return {
    FvRdPorParafuso,
    FvRdTotal,
    FtRdPorParafuso,
    FtRdTotal,
    FbRdPorParafuso,
    FbRdTotal,
    FvAtritoPorParafuso,
    FvAtritoTotal,
    interacao,
    utilizacaoGovernante,
    statusGovernante: classify(utilizacaoGovernante),
    estadoGovernante,
    verificacoes,
  }
}
