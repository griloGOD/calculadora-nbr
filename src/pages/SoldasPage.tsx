import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import { NumberField, SelectField } from '@/components/ui/Field'
import UtilizationBar from '@/components/ui/UtilizationBar'
import ResultCard from '@/components/ui/ResultCard'
import FormulaBlock from '@/components/ui/FormulaBlock'
import SaveToMemorialButton from '@/components/ui/SaveToMemorialButton'
import { ACOS, getAco } from '@/catalogo/materiais'
import { ELETRODOS, getEletrodo } from '@/catalogo/parafusos'
import { calcularSoldaFilete } from '@/calculos/nbr8800/soldas'
import { fmt, fmtKN, fmtMPa } from '@/calculos/utils/format'

export default function SoldasPage() {
  const [eletrodoId, setEletrodoId] = useState('e70')
  const [acoBaseId, setAcoBaseId] = useState('a572-50')
  const [p, setP] = useState(6) // mm — perna do cordão
  const [Lw, setLw] = useState(200) // mm — comprimento
  const [t, setT] = useState(10) // mm — espessura base
  const [FSd, setFSd] = useState(200)

  const eletrodo = getEletrodo(eletrodoId)!
  const acoBase = getAco(acoBaseId)!

  const resultado = useMemo(
    () =>
      calcularSoldaFilete({
        p,
        Lw,
        fuE: eletrodo.fuE,
        fu: acoBase.fu,
        t,
        FSd,
      }),
    [eletrodo, acoBase, p, Lw, t, FSd],
  )

  return (
    <div>
      <SectionHeader
        eyebrow="Módulo 3 · Ligações"
        title="Solda de filete"
        subtitle="NBR 8800:2008 §6.2.6 — Verifica simultaneamente a resistência do metal da solda (garganta efetiva) e do metal base adjacente."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(340px,420px)]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label mb-4">Eletrodo e metal base</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="eletrodo"
                label="Eletrodo AWS"
                value={eletrodoId}
                onChange={(e) => setEletrodoId(e.target.value)}
              >
                {ELETRODOS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.classificacao} — f_uE = {e.fuE} MPa
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="aco-base"
                label="Aço do metal base"
                value={acoBaseId}
                onChange={(e) => setAcoBaseId(e.target.value)}
              >
                {ACOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.norma} {a.grau !== '—' ? `• ${a.grau}` : ''} — fu {a.fu} MPa
                  </option>
                ))}
              </SelectField>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Geometria do cordão</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                id="p"
                label="p — perna do cordão"
                hint="Dimensão nominal da perna. Garganta a = 0,7·p."
                unit="mm"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                min={3}
                step={0.5}
              />
              <NumberField
                id="lw"
                label="L_w — comprimento"
                unit="mm"
                value={Lw}
                onChange={(e) => setLw(Number(e.target.value))}
                step={10}
              />
              <NumberField
                id="tbase"
                label="t — esp. metal base"
                unit="mm"
                value={t}
                onChange={(e) => setT(Number(e.target.value))}
                step={0.5}
              />
              <NumberField
                id="fsd"
                label="F_Sd — solicitação"
                unit="kN"
                value={FSd}
                onChange={(e) => setFSd(Number(e.target.value))}
                step={5}
              />
            </div>
            <div className="mt-4 grid gap-2 rounded-md border border-border bg-surface-2/60 p-3 font-mono text-[12px] text-muted sm:grid-cols-3">
              <div>a = 0,7·p = {fmt(resultado.a)} mm</div>
              <div>A_w (garganta) = {fmt(resultado.a * Lw, 0)} mm²</div>
              <div>A_MB (base) = {fmt(t * Lw, 0)} mm²</div>
              <div>f_uE = {fmtMPa(eletrodo.fuE)}</div>
              <div>f_u base = {fmtMPa(acoBase.fu)}</div>
            </div>
          </section>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="space-y-5"
        >
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="label">Governa</span>
              <span className="font-mono text-text">
                {resultado.governante === 'metal-solda' ? 'metal da solda' : 'metal base'}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs text-muted">
              <div>F_w,Rd = {fmtKN(resultado.FwRd, 1)}</div>
              <div>F_wb,Rd = {fmtKN(resultado.FwbRd, 1)}</div>
            </div>
          </div>

          <ResultCard
            label="F_Rd — Resistência do cordão"
            value={resultado.FRd}
            unit="kN"
            digits={1}
            hint={`Governante: ${resultado.governante === 'metal-solda' ? 'Metal da solda' : 'Metal base'}`}
            tone="accent"
          />

          <SaveToMemorialButton
            snapshot={{
              modulo: 'Solda de filete',
              titulo: `Cordão p=${p}mm × L=${Lw}mm · ${eletrodo.classificacao} sobre ${acoBase.norma}${acoBase.grau !== '—' ? ' ' + acoBase.grau : ''}`,
              referencia: resultado.referencia,
              status: resultado.status,
              utilizacao: resultado.utilizacao,
              resumo: [
                { rotulo: 'F_Rd', valor: fmtKN(resultado.FRd, 1) },
                { rotulo: 'F_w,Rd', valor: fmtKN(resultado.FwRd, 1) },
                { rotulo: 'F_wb,Rd', valor: fmtKN(resultado.FwbRd, 1) },
                { rotulo: 'a (garganta)', valor: `${fmt(resultado.a)} mm` },
                { rotulo: 'Governante', valor: resultado.governante === 'metal-solda' ? 'Metal da solda' : 'Metal base' },
              ],
              passos: resultado.passos,
            }}
          />

          <div className="card p-4">
            <UtilizationBar eta={resultado.utilizacao} />
            <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
              <span>F_Sd = {fmtKN(FSd)}</span>
              <span>/ F_Rd = {fmtKN(resultado.FRd)}</span>
            </div>
          </div>

          <FormulaBlock
            titulo="Desenvolvimento completo"
            referencia={resultado.referencia}
            passos={resultado.passos}
            defaultOpen
          />
        </motion.aside>
      </div>
    </div>
  )
}
