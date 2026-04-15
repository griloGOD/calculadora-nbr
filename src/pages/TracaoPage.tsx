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
import { calcularTracao } from '@/calculos/nbr8800/tracao'
import { fmt, fmtMPa, fmtKN } from '@/calculos/utils/format'

type Modo = 'sem-furos' | 'com-furos'

export default function TracaoPage() {
  const [acoId, setAcoId] = useState('a572-50')
  const [perfilId, setPerfilId] = useState('w250x38')
  const [modo, setModo] = useState<Modo>('sem-furos')
  const [Ct, setCt] = useState(1.0)
  const [furos, setFuros] = useState(2) // quantidade de furos na seção crítica
  const [dFuro, setDFuro] = useState(20) // diâmetro do furo [mm]
  const [Nsd, setNsd] = useState(500) // kN

  const aco = getAco(acoId)!
  const perfil = getPerfil(perfilId)!

  const { An, AnCm2 } = useMemo(() => {
    if (modo === 'sem-furos') {
      return { An: perfil.Ag, AnCm2: perfil.Ag }
    }
    // NBR 8800 §5.2.4 — Área líquida An = Ag − n·d·t
    // Usa espessura da alma tw (simplificação: furos na alma)
    const deducao = (furos * dFuro * perfil.tw) / 100 // cm²
    const an = Math.max(perfil.Ag - deducao, 0)
    return { An: an, AnCm2: an }
  }, [modo, furos, dFuro, perfil])

  const resultado = useMemo(
    () =>
      calcularTracao({
        Ag: perfil.Ag,
        An: AnCm2,
        Ct,
        fy: aco.fy,
        fu: aco.fu,
        Nsd,
      }),
    [perfil, AnCm2, Ct, aco, Nsd],
  )

  const govLabel =
    resultado.governante === 'escoamento'
      ? 'Escoamento da seção bruta'
      : 'Ruptura da seção líquida'

  return (
    <div>
      <SectionHeader
        eyebrow="Módulo 1 · Barras"
        title="Tração axial"
        subtitle="NBR 8800:2008 §5.2 — Barras submetidas à força axial de tração. Calcula a menor força resistente de cálculo entre escoamento da seção bruta e ruptura da seção líquida efetiva."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
        {/* Formulário */}
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label mb-4">Material e perfil</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="aco"
                label="Aço estrutural"
                hint="Tensão de escoamento (fy) e ruptura (fu) conforme normativa."
                value={acoId}
                onChange={(e) => setAcoId(e.target.value)}
              >
                {ACOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.norma} {a.grau !== '—' ? `• ${a.grau}` : ''} — fy {a.fy} MPa
                  </option>
                ))}
              </SelectField>

              <SelectField
                id="perfil"
                label="Perfil laminado (W)"
                hint="Catálogo Gerdau / ASTM. Propriedades já incluídas."
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

            <div className="mt-4 grid gap-2 rounded-md border border-border bg-surface-2/60 p-3 font-mono text-[12px] text-muted sm:grid-cols-2">
              <div>
                <span className="text-text/90">A_g</span> = {fmt(perfil.Ag)} cm²
              </div>
              <div>
                <span className="text-text/90">f_y</span> = {fmtMPa(aco.fy)} ·{' '}
                <span className="text-text/90">f_u</span> = {fmtMPa(aco.fu)}
              </div>
              <div>
                <span className="text-text/90">r_x</span> = {fmt(perfil.rx)} cm ·{' '}
                <span className="text-text/90">r_y</span> = {fmt(perfil.ry)} cm
              </div>
              <div>
                <span className="text-text/90">t_w</span> = {fmt(perfil.tw)} mm ·{' '}
                <span className="text-text/90">t_f</span> = {fmt(perfil.tf)} mm
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Seção líquida e esforço</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="modo"
                label="Condição da seção"
                value={modo}
                onChange={(e) => setModo(e.target.value as Modo)}
              >
                <option value="sem-furos">Sem furos (An = Ag)</option>
                <option value="com-furos">Com furos</option>
              </SelectField>

              <NumberField
                id="ct"
                label="Ct (coef. redução)"
                hint="§5.2.5 — Coeficiente de redução de área líquida efetiva. Use 1,0 para conexões com todos os elementos transmitindo a força."
                value={Ct}
                onChange={(e) => setCt(Number(e.target.value))}
                min={0.3}
                max={1}
                step={0.05}
              />

              {modo === 'com-furos' && (
                <>
                  <NumberField
                    id="furos"
                    label="Nº de furos na seção crítica"
                    value={furos}
                    onChange={(e) => setFuros(Math.max(0, Number(e.target.value)))}
                    min={0}
                    step={1}
                  />
                  <NumberField
                    id="dfuro"
                    label="Diâmetro do furo"
                    hint="Usual: diâmetro nominal + 1,5 mm (furos padrão)."
                    unit="mm"
                    value={dFuro}
                    onChange={(e) => setDFuro(Number(e.target.value))}
                    min={0}
                    step={0.5}
                  />
                </>
              )}

              <NumberField
                id="nsd"
                label="N_Sd — Solicitação"
                hint="Força normal solicitante de cálculo (combinação última)."
                unit="kN"
                value={Nsd}
                onChange={(e) => setNsd(Number(e.target.value))}
                step={10}
              />

              <div className="flex items-end">
                <div className="w-full rounded-md border border-border bg-surface-2/60 p-3 font-mono text-[12px] text-muted">
                  <div>A_n = {fmt(An)} cm²</div>
                  <div>A_e = {fmt(Ct * An)} cm²</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Painel de resultado */}
        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between rounded-md border border-border bg-surface p-3">
            <ProfileSVG perfil={perfil} className="h-24 w-24" />
            <div className="text-right">
              <div className="label">Perfil</div>
              <div className="font-display text-base font-semibold">{perfil.designacao}</div>
              <div className="mt-1 text-[11px] text-muted">{aco.norma} {aco.grau !== '—' ? `· ${aco.grau}` : ''}</div>
            </div>
          </div>

          <ResultCard
            label="N_t,Rd — Resistência de cálculo"
            value={resultado.NtRd}
            unit="kN"
            digits={1}
            hint={`Estado-limite governante: ${govLabel}`}
            tone="accent"
          />

          <SaveToMemorialButton
            snapshot={{
              modulo: 'Tração',
              titulo: `${perfil.designacao} · ${aco.norma}${aco.grau !== '—' ? ' ' + aco.grau : ''} · L = —`,
              referencia: 'NBR 8800:2008 §5.2',
              status: resultado.status,
              utilizacao: resultado.utilizacao,
              resumo: [
                { rotulo: 'N_t,Rd', valor: fmtKN(resultado.NtRd, 1) },
                { rotulo: 'N_Sd', valor: fmtKN(Nsd, 1) },
                { rotulo: 'Governante', valor: govLabel },
                { rotulo: 'Perfil', valor: perfil.designacao },
              ],
              passos: [
                ...resultado.escoamento.passos,
                ...resultado.ruptura.passos,
              ],
            }}
          />

          <div className="card p-4">
            <UtilizationBar eta={resultado.utilizacao} />
            <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
              <span>N_Sd = {fmtKN(Nsd)}</span>
              <span>/ N_Rd = {fmtKN(resultado.NtRd)}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <FormulaBlock
              titulo={`1 · Escoamento ⇒ ${fmtKN(resultado.escoamento.NRd)}`}
              referencia={resultado.escoamento.referencia}
              passos={resultado.escoamento.passos}
              defaultOpen={resultado.governante === 'escoamento'}
            />
            <FormulaBlock
              titulo={`2 · Ruptura ⇒ ${fmtKN(resultado.ruptura.NRd)}`}
              referencia={resultado.ruptura.referencia}
              passos={resultado.ruptura.passos}
              defaultOpen={resultado.governante === 'ruptura'}
            />
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
