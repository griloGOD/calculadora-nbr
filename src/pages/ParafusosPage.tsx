import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import { NumberField, SelectField } from '@/components/ui/Field'
import UtilizationBar from '@/components/ui/UtilizationBar'
import ResultCard from '@/components/ui/ResultCard'
import FormulaBlock from '@/components/ui/FormulaBlock'
import SaveToMemorialButton from '@/components/ui/SaveToMemorialButton'
import { ACOS, getAco } from '@/catalogo/materiais'
import {
  CLASSES_ATRITO,
  DIAMETROS,
  TIPOS_PARAFUSO,
  getDiametro,
  getTipoParafuso,
} from '@/catalogo/parafusos'
import { calcularParafusos } from '@/calculos/nbr8800/parafusos'
import { fmt, fmtKN, fmtMPa } from '@/calculos/utils/format'

export default function ParafusosPage() {
  const [tipoId, setTipoId] = useState('a325')
  const [dId, setDId] = useState('m20')
  const [plano, setPlano] = useState<'rosca' | 'fuste'>('rosca')
  const [numParafusos, setNumParafusos] = useState(4)
  const [numPlanosCorte, setNumPlanosCorte] = useState(1)
  const [t, setT] = useState(10)
  const [acoChapaId, setAcoChapaId] = useState('a572-50')
  const [e1, setE1] = useState(40)
  const [p1, setP1] = useState(60)
  const [FvSd, setFvSd] = useState(200)
  const [FtSd, setFtSd] = useState(0)
  const [tipoLigacao, setTipoLigacao] = useState<'apoio' | 'atrito'>('apoio')
  const [classeAtritoId, setClasseAtritoId] = useState<'a' | 'b' | 'c'>('a')
  const [Nb, setNb] = useState(1)

  const tipo = getTipoParafuso(tipoId)!
  const diametro = getDiametro(dId)!
  const acoChapa = getAco(acoChapaId)!
  const classeAtrito = CLASSES_ATRITO.find((c) => c.id === classeAtritoId)!

  const resultado = useMemo(
    () =>
      calcularParafusos({
        d: diametro.d,
        Ab: diametro.Ab,
        Ae: diametro.Ae,
        fub: tipo.fub,
        plano,
        numParafusos,
        numPlanosCorte,
        t,
        fuChapa: acoChapa.fu,
        e1,
        p1,
        FvSd: FvSd > 0 ? FvSd : undefined,
        FtSd: FtSd > 0 ? FtSd : undefined,
        tipoLigacao,
        mu: tipoLigacao === 'atrito' ? classeAtrito.mu : undefined,
        Nb: tipoLigacao === 'atrito' ? Nb : undefined,
      }),
    [
      diametro,
      tipo,
      plano,
      numParafusos,
      numPlanosCorte,
      t,
      acoChapa,
      e1,
      p1,
      FvSd,
      FtSd,
      tipoLigacao,
      classeAtrito,
      Nb,
    ],
  )

  const atritoBloqueado = tipoLigacao === 'atrito' && !tipo.protendido

  return (
    <div>
      <SectionHeader
        eyebrow="Módulo 2 · Ligações"
        title="Parafusos"
        subtitle="NBR 8800:2008 §6.3 — Verificações de cisalhamento, tração, interação, esmagamento da chapa e, opcionalmente, ligação por atrito (HSFG)."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(340px,420px)]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label mb-4">Parafuso e chapa</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField id="tipo-p" label="Tipo de parafuso" value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
                {TIPOS_PARAFUSO.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.norma} {t.grau !== '—' ? `• ${t.grau}` : ''} — fub {t.fub} MPa
                  </option>
                ))}
              </SelectField>
              <SelectField id="diam-p" label="Diâmetro" value={dId} onChange={(e) => setDId(e.target.value)}>
                {DIAMETROS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.designacao} — Ab = {fmt(d.Ab, 0)} mm²
                  </option>
                ))}
              </SelectField>
              <SelectField id="plano-p" label="Plano de corte" value={plano} onChange={(e) => setPlano(e.target.value as 'rosca' | 'fuste')}>
                <option value="rosca">Passando pela rosca (0,40·fub·Ab)</option>
                <option value="fuste">Passando pelo fuste (0,50·fub·Ab)</option>
              </SelectField>
              <SelectField
                id="aco-chapa"
                label="Aço da chapa"
                value={acoChapaId}
                onChange={(e) => setAcoChapaId(e.target.value)}
              >
                {ACOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.norma} {a.grau !== '—' ? `• ${a.grau}` : ''} — fu {a.fu} MPa
                  </option>
                ))}
              </SelectField>
              <NumberField
                id="np"
                label="Nº de parafusos"
                value={numParafusos}
                onChange={(e) => setNumParafusos(Math.max(1, Number(e.target.value)))}
                min={1}
                step={1}
              />
              <NumberField
                id="npl"
                label="Planos de corte por parafuso"
                hint="1 ou 2. Ligações corte duplo: 2."
                value={numPlanosCorte}
                onChange={(e) => setNumPlanosCorte(Math.max(1, Number(e.target.value)))}
                min={1}
                max={2}
                step={1}
              />
              <NumberField
                id="t"
                label="Espessura da chapa t"
                unit="mm"
                value={t}
                onChange={(e) => setT(Number(e.target.value))}
                step={0.5}
              />
              <NumberField
                id="e1"
                label="e₁ — dist. borda"
                unit="mm"
                hint="Distância do centro do furo à borda na direção da força."
                value={e1}
                onChange={(e) => setE1(Number(e.target.value))}
                step={1}
              />
              <NumberField
                id="p1"
                label="p₁ — espaçamento"
                unit="mm"
                hint="Espaçamento longitudinal entre centros de furos."
                value={p1}
                onChange={(e) => setP1(Number(e.target.value))}
                step={1}
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Solicitações</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="fvsd"
                label="F_v,Sd — cisalhamento total"
                unit="kN"
                value={FvSd}
                onChange={(e) => setFvSd(Number(e.target.value))}
                step={5}
              />
              <NumberField
                id="ftsd"
                label="F_t,Sd — tração total"
                unit="kN"
                value={FtSd}
                onChange={(e) => setFtSd(Number(e.target.value))}
                step={5}
              />
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="label">Ligação por atrito (HSFG)</h2>
              {atritoBloqueado && (
                <span className="chip !text-warn !border-warn/40">
                  {tipo.norma} {tipo.grau !== '—' ? tipo.grau : ''} não admite atrito
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                id="tipoliga"
                label="Tipo"
                value={tipoLigacao}
                onChange={(e) => setTipoLigacao(e.target.value as 'apoio' | 'atrito')}
              >
                <option value="apoio">Por apoio (bearing)</option>
                <option value="atrito" disabled={!tipo.protendido}>
                  Por atrito (HSFG)
                </option>
              </SelectField>
              {tipoLigacao === 'atrito' && (
                <>
                  <SelectField
                    id="classe"
                    label="Classe de superfície"
                    value={classeAtritoId}
                    onChange={(e) => setClasseAtritoId(e.target.value as 'a' | 'b' | 'c')}
                  >
                    {CLASSES_ATRITO.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} — μ = {c.mu}
                      </option>
                    ))}
                  </SelectField>
                  <NumberField
                    id="nb"
                    label="Nº de planos de atrito"
                    value={Nb}
                    onChange={(e) => setNb(Math.max(1, Number(e.target.value)))}
                    min={1}
                    max={2}
                    step={1}
                  />
                </>
              )}
            </div>
            {tipoLigacao === 'atrito' && (
              <p className="mt-2 text-[11px] text-muted">{classeAtrito.descricao}</p>
            )}
          </section>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="space-y-5"
        >
          <div className="grid gap-2 rounded-md border border-border bg-surface p-3 font-mono text-[12px] text-muted">
            <div className="flex justify-between">
              <span>{tipo.norma} {tipo.grau !== '—' ? `• ${tipo.grau}` : ''}</span>
              <span className="text-text">{diametro.designacao}</span>
            </div>
            <div className="flex justify-between">
              <span>A_b = {fmt(diametro.Ab, 1)} mm²</span>
              <span>f_ub = {fmtMPa(tipo.fub)}</span>
            </div>
            <div className="flex justify-between">
              <span>A_e = {fmt(diametro.Ae, 1)} mm²</span>
              <span>{numParafusos} × {numPlanosCorte} plano(s)</span>
            </div>
          </div>

          <ResultCard
            label="η — Maior utilização"
            value={resultado.utilizacaoGovernante}
            unit="(≤ 1,0)"
            digits={3}
            hint={resultado.estadoGovernante}
            tone="accent"
          />

          <SaveToMemorialButton
            snapshot={{
              modulo: 'Parafusos',
              titulo: `${numParafusos}× ${diametro.designacao} ${tipo.norma}${tipo.grau !== '—' ? ' ' + tipo.grau : ''} (${tipoLigacao})`,
              referencia: 'NBR 8800:2008 §6.3',
              status: resultado.statusGovernante,
              utilizacao: resultado.utilizacaoGovernante,
              resumo: [
                { rotulo: 'F_v,Rd', valor: fmtKN(resultado.FvRdTotal, 1) },
                { rotulo: 'F_t,Rd', valor: fmtKN(resultado.FtRdTotal, 1) },
                { rotulo: 'F_b,Rd', valor: fmtKN(resultado.FbRdTotal, 1) },
                ...(resultado.FvAtritoTotal !== undefined
                  ? [{ rotulo: 'F_v,Rd atrito', valor: fmtKN(resultado.FvAtritoTotal, 1) }]
                  : []),
                { rotulo: 'Governante', valor: resultado.estadoGovernante },
              ],
              passos: resultado.verificacoes.flatMap((v) => v.passos),
            }}
          />

          <div className="card p-4">
            <UtilizationBar eta={resultado.utilizacaoGovernante} />
          </div>

          <div className="grid gap-2">
            {resultado.verificacoes.map((v, i) => (
              <FormulaBlock
                key={i}
                titulo={`${i + 1} · ${v.titulo} ⇒ ${v.utilizacao !== undefined ? `η = ${fmt(v.utilizacao, 3)}` : `${fmtKN(v.valor, 1)}`}`}
                referencia={v.referencia}
                passos={v.passos}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
