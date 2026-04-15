import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import { NumberField, SelectField } from '@/components/ui/Field'
import UtilizationBar from '@/components/ui/UtilizationBar'
import ResultCard from '@/components/ui/ResultCard'
import FormulaBlock from '@/components/ui/FormulaBlock'
import ProfileSVG from '@/components/ui/ProfileSVG'
import SaveToMemorialButton from '@/components/ui/SaveToMemorialButton'
import { ACOS, getAco } from '@/catalogo/materiais'
import { PERFIS_W, getPerfil } from '@/catalogo/perfis'
import { calcularFlexao } from '@/calculos/nbr8800/flexao'
import { fmt, fmtMPa, fmtKN } from '@/calculos/utils/format'

const REGIME_COLORS: Record<string, string> = {
  compacto: 'var(--color-accent-alt)',
  'semi-compacto': 'var(--color-warn)',
  esbelto: 'var(--color-danger)',
}

export default function FlexaoPage() {
  const [acoId, setAcoId] = useState('a572-50')
  const [perfilId, setPerfilId] = useState('w360x57')
  const [Lb, setLb] = useState(300) // cm
  const [Cb, setCb] = useState(1.0)
  const [MSd, setMSd] = useState(150) // kN·m

  const aco = getAco(acoId)!
  const perfil = getPerfil(perfilId)!

  const resultado = useMemo(
    () =>
      calcularFlexao({
        d: perfil.d,
        bf: perfil.bf,
        tf: perfil.tf,
        tw: perfil.tw,
        Ag: perfil.Ag,
        Iy: perfil.Iy,
        ry: perfil.ry,
        Zx: perfil.Zx,
        Wx: perfil.Sx,
        J: perfil.J,
        Cw: perfil.Cw,
        fy: aco.fy,
        E: aco.E,
        G: aco.G,
        Lb,
        Cb,
        MSd,
      }),
    [perfil, aco, Lb, Cb, MSd],
  )

  return (
    <div>
      <SectionHeader
        eyebrow="Módulo 1 · Barras"
        title="Flexão simples"
        subtitle="NBR 8800:2008 §5.4 e Anexo G — Perfis I com dois eixos de simetria, flexão em relação ao eixo de maior inércia. Verifica FLT, FLM e FLA; governa o menor Mn."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(340px,420px)]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label mb-4">Material e perfil</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField id="aco-f" label="Aço" value={acoId} onChange={(e) => setAcoId(e.target.value)}>
                {ACOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.norma} {a.grau !== '—' ? `• ${a.grau}` : ''} — fy {a.fy} MPa
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="perfil-f"
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
              <div>Z_x = {fmt(perfil.Zx, 0)} cm³</div>
              <div>W_x = {fmt(perfil.Sx, 0)} cm³</div>
              <div>I_y = {fmt(perfil.Iy, 0)} cm⁴</div>
              <div>r_y = {fmt(perfil.ry)} cm</div>
              <div>J = {fmt(perfil.J)} cm⁴</div>
              <div>C_w = {fmt(perfil.Cw, 0)} ·10³cm⁶</div>
              <div>f_y = {fmtMPa(aco.fy)}</div>
              <div>E = {fmtMPa(aco.E)}</div>
              <div>G = {fmtMPa(aco.G)}</div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Parâmetros de cálculo</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                id="lb"
                label="L_b — comp. destravado"
                hint="Distância entre pontos de travamento lateral da mesa comprimida."
                unit="cm"
                value={Lb}
                onChange={(e) => setLb(Number(e.target.value))}
                step={10}
              />
              <NumberField
                id="cb"
                label="C_b — momento equivalente"
                hint="1,0 é conservador. Para carga uniformemente distribuída C_b ≈ 1,14; extremos com momentos opostos até 2,56."
                value={Cb}
                onChange={(e) => setCb(Number(e.target.value))}
                min={1}
                max={3}
                step={0.05}
              />
              <NumberField
                id="msd"
                label="M_Sd — Solicitação"
                unit="kN·m"
                value={MSd}
                onChange={(e) => setMSd(Number(e.target.value))}
                step={5}
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Classificação dos três estados-limite</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['flt', 'flm', 'fla'] as const).map((k) => {
                const s = resultado.estados[k]
                return (
                  <div key={k} className="rounded-md border border-border bg-surface-2/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-semibold">
                        {s.estado}
                      </span>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest"
                        style={{
                          color: REGIME_COLORS[s.regime],
                          borderColor: REGIME_COLORS[s.regime],
                          backgroundColor: `${REGIME_COLORS[s.regime]}15`,
                        }}
                      >
                        {s.regime}
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5 font-mono text-[11px] text-muted">
                      <div>λ = {fmt(s.lambda)}</div>
                      <div>λ_p = {fmt(s.lambdap)}</div>
                      <div>λ_r = {fmt(s.lambdar)}</div>
                      <div className="mt-1 text-text">
                        M_n = {fmt(s.Mn, 0)} kN·cm
                      </div>
                    </div>
                  </div>
                )
              })}
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
            label="M_Rd — Momento resistente"
            value={resultado.MRd}
            unit="kN·m"
            digits={2}
            hint={`Governante: ${resultado.governante} · C_b = ${fmt(resultado.Cb)}`}
            tone="accent"
          />

          <SaveToMemorialButton
            snapshot={{
              modulo: 'Flexão',
              titulo: `${perfil.designacao} · ${aco.norma}${aco.grau !== '—' ? ' ' + aco.grau : ''} · L_b = ${Lb} cm`,
              referencia: resultado.referencia,
              status: resultado.status,
              utilizacao: resultado.utilizacao,
              resumo: [
                { rotulo: 'M_Rd', valor: `${fmt(resultado.MRd, 2)} kN·m` },
                { rotulo: 'M_Sd', valor: `${fmt(MSd, 2)} kN·m` },
                { rotulo: 'Governante', valor: resultado.governante },
                { rotulo: 'C_b', valor: fmt(resultado.Cb) },
              ],
              passos: [
                ...resultado.estados.flt.passos,
                ...resultado.estados.flm.passos,
                ...resultado.estados.fla.passos,
              ],
            }}
          />

          <div className="card p-4">
            <UtilizationBar eta={resultado.utilizacao} />
            <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
              <span>M_Sd = {fmt(MSd)} kN·m</span>
              <span>/ M_Rd = {fmt(resultado.MRd, 2)} kN·m</span>
            </div>
          </div>

          <div className="grid gap-2">
            <FormulaBlock
              titulo={`FLT ⇒ ${fmtKN(resultado.estados.flt.Mn, 0)}·cm · ${resultado.estados.flt.regime}`}
              referencia="NBR 8800 Anexo G — Tabela G.1 caso I"
              passos={resultado.estados.flt.passos}
              defaultOpen={resultado.governante === 'FLT'}
            />
            <FormulaBlock
              titulo={`FLM ⇒ ${fmtKN(resultado.estados.flm.Mn, 0)}·cm · ${resultado.estados.flm.regime}`}
              referencia="NBR 8800 Anexo G — Tabela G.1 caso II"
              passos={resultado.estados.flm.passos}
              defaultOpen={resultado.governante === 'FLM'}
            />
            <FormulaBlock
              titulo={`FLA ⇒ ${fmtKN(resultado.estados.fla.Mn, 0)}·cm · ${resultado.estados.fla.regime}`}
              referencia="NBR 8800 Anexo G — Tabela G.1 caso III"
              passos={resultado.estados.fla.passos}
              defaultOpen={resultado.governante === 'FLA'}
            />
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
