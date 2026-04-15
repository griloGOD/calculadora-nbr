import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import { NumberField, SelectField } from '@/components/ui/Field'
import UtilizationBar from '@/components/ui/UtilizationBar'
import ResultCard from '@/components/ui/ResultCard'
import FormulaBlock from '@/components/ui/FormulaBlock'
import ProfileSVG from '@/components/ui/ProfileSVG'
import { ACOS, getAco } from '@/catalogo/materiais'
import { PERFIS_W, getPerfil } from '@/catalogo/perfis'
import { calcularCisalhamento } from '@/calculos/nbr8800/cisalhamento'
import { fmt, fmtKN, fmtMPa } from '@/calculos/utils/format'

export default function CisalhamentoPage() {
  const [acoId, setAcoId] = useState('a572-50')
  const [perfilId, setPerfilId] = useState('w360x57')
  const [temEnrij, setTemEnrij] = useState<'nao' | 'sim'>('nao')
  const [a, setA] = useState(150) // cm — espaçamento dos enrijecedores
  const [VSd, setVSd] = useState(250)

  const aco = getAco(acoId)!
  const perfil = getPerfil(perfilId)!

  const resultado = useMemo(
    () =>
      calcularCisalhamento({
        d: perfil.d,
        tf: perfil.tf,
        tw: perfil.tw,
        fy: aco.fy,
        E: aco.E,
        a: temEnrij === 'sim' ? a : undefined,
        VSd,
      }),
    [perfil, aco, temEnrij, a, VSd],
  )

  return (
    <div>
      <SectionHeader
        eyebrow="Módulo 1 · Barras"
        title="Cisalhamento"
        subtitle="NBR 8800:2008 §5.4.3 — Verificação da alma à força cortante. Considera escoamento, flambagem inelástica e elástica conforme a esbeltez h/tw."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(340px,420px)]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label mb-4">Material e perfil</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField id="aco-v" label="Aço" value={acoId} onChange={(e) => setAcoId(e.target.value)}>
                {ACOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.norma} {a.grau !== '—' ? `• ${a.grau}` : ''} — fy {a.fy} MPa
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="perfil-v"
                label="Perfil laminado (W)"
                value={perfilId}
                onChange={(e) => setPerfilId(e.target.value)}
              >
                {PERFIS_W.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.designacao}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="mt-4 grid gap-2 rounded-md border border-border bg-surface-2/60 p-3 font-mono text-[12px] text-muted sm:grid-cols-3">
              <div>d = {perfil.d} mm</div>
              <div>t_w = {perfil.tw} mm</div>
              <div>t_f = {perfil.tf} mm</div>
              <div>h ≈ {resultado.h} mm</div>
              <div>f_y = {fmtMPa(aco.fy)}</div>
              <div>E = {fmtMPa(aco.E)}</div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Enrijecedores e solicitação</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                id="enrij"
                label="Enrijecedores transversais"
                value={temEnrij}
                onChange={(e) => setTemEnrij(e.target.value as 'nao' | 'sim')}
              >
                <option value="nao">Sem enrijecedores</option>
                <option value="sim">Com enrijecedores</option>
              </SelectField>
              {temEnrij === 'sim' && (
                <NumberField
                  id="a"
                  label="a — espaçamento"
                  unit="cm"
                  hint="Distância livre entre enrijecedores transversais."
                  value={a}
                  onChange={(e) => setA(Number(e.target.value))}
                  step={5}
                />
              )}
              <NumberField
                id="vsd"
                label="V_Sd — Solicitação"
                unit="kN"
                value={VSd}
                onChange={(e) => setVSd(Number(e.target.value))}
                step={10}
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Esbeltez e classificação</h2>
            <div className="grid gap-2 rounded-md border border-border bg-surface-2/60 p-3 font-mono text-[12px] text-muted sm:grid-cols-2">
              <div>A_w = {fmt(resultado.Aw)} cm²</div>
              <div>V_pl = {fmtKN(resultado.Vpl, 1)}</div>
              <div>λ = h/t_w = {fmt(resultado.lambda)}</div>
              <div>k_v = {fmt(resultado.kv)}</div>
              <div>λ_p = {fmt(resultado.lambdap)}</div>
              <div>λ_r = {fmt(resultado.lambdar)}</div>
              <div className="sm:col-span-2">
                Regime:{' '}
                <span className="text-accent">{resultado.regime}</span>
              </div>
            </div>
          </section>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between rounded-md border border-border bg-surface p-3">
            <ProfileSVG perfil={perfil} className="h-28 w-28" />
            <div className="text-right">
              <div className="label">Perfil</div>
              <div className="font-display text-base font-semibold">{perfil.designacao}</div>
              <div className="mt-1 text-[11px] text-muted">
                {aco.norma} {aco.grau !== '—' ? `· ${aco.grau}` : ''}
              </div>
            </div>
          </div>

          <ResultCard
            label="V_Rd — Cortante resistente"
            value={resultado.VRd}
            unit="kN"
            digits={1}
            hint={`λ = ${fmt(resultado.lambda)} · regime ${resultado.regime}`}
            tone="accent"
          />

          <div className="card p-4">
            <UtilizationBar eta={resultado.utilizacao} />
            <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
              <span>V_Sd = {fmtKN(VSd)}</span>
              <span>/ V_Rd = {fmtKN(resultado.VRd)}</span>
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
