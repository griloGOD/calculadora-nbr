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
import { calcularCompressao } from '@/calculos/nbr8800/compressao'
import { fmt, fmtMPa, fmtKN } from '@/calculos/utils/format'

export default function CompressaoPage() {
  const [acoId, setAcoId] = useState('a572-50')
  const [perfilId, setPerfilId] = useState('w250x38')
  const [Kx, setKx] = useState(1.0)
  const [Ky, setKy] = useState(1.0)
  const [Lx, setLx] = useState(300) // cm
  const [Ly, setLy] = useState(300) // cm
  const [Q, setQ] = useState(1.0)
  const [Nsd, setNsd] = useState(600)

  const aco = getAco(acoId)!
  const perfil = getPerfil(perfilId)!

  const resultado = useMemo(
    () =>
      calcularCompressao({
        Ag: perfil.Ag,
        Ix: perfil.Ix,
        Iy: perfil.Iy,
        rx: perfil.rx,
        ry: perfil.ry,
        fy: aco.fy,
        E: aco.E,
        Kx,
        Ky,
        Lx,
        Ly,
        Q,
        Nsd,
      }),
    [perfil, aco, Kx, Ky, Lx, Ly, Q, Nsd],
  )

  return (
    <div>
      <SectionHeader
        eyebrow="Módulo 1 · Barras"
        title="Compressão axial"
        subtitle="NBR 8800:2008 §5.3 — Flambagem global por flexão. Curva SSRC única (0,658^λ₀²). No MVP considera-se Q = 1 (sem flambagem local)."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label mb-4">Material e perfil</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="aco-c"
                label="Aço estrutural"
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
                id="perfil-c"
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
              <div>A_g = {fmt(perfil.Ag)} cm²</div>
              <div>I_x = {fmt(perfil.Ix, 0)} cm⁴</div>
              <div>I_y = {fmt(perfil.Iy, 0)} cm⁴</div>
              <div>r_x = {fmt(perfil.rx)} cm</div>
              <div>r_y = {fmt(perfil.ry)} cm</div>
              <div>E = {fmtMPa(aco.E)}</div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Comprimento destravado</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="kx"
                label="K_x"
                hint="Coef. de flambagem eixo x. 1,0 = biapoiado; 0,7 = engaste-apoio; 2,0 = engaste livre."
                value={Kx}
                onChange={(e) => setKx(Number(e.target.value))}
                min={0.3}
                max={3}
                step={0.05}
              />
              <NumberField
                id="ky"
                label="K_y"
                hint="Coef. de flambagem eixo y."
                value={Ky}
                onChange={(e) => setKy(Number(e.target.value))}
                min={0.3}
                max={3}
                step={0.05}
              />
              <NumberField
                id="lx"
                label="L_x — comp. destravado x"
                unit="cm"
                value={Lx}
                onChange={(e) => setLx(Number(e.target.value))}
                step={10}
              />
              <NumberField
                id="ly"
                label="L_y — comp. destravado y"
                unit="cm"
                value={Ly}
                onChange={(e) => setLy(Number(e.target.value))}
                step={10}
              />
              <NumberField
                id="q"
                label="Q (fator flambagem local)"
                hint="§5.3.4. Use 1,0 para perfis W com elementos compactos (padrão para W comum)."
                value={Q}
                onChange={(e) => setQ(Number(e.target.value))}
                min={0.3}
                max={1}
                step={0.01}
              />
              <NumberField
                id="nsd-c"
                label="N_Sd — Solicitação"
                unit="kN"
                value={Nsd}
                onChange={(e) => setNsd(Number(e.target.value))}
                step={10}
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Esbeltez e flambagem elástica</h2>
            <div className="grid gap-2 rounded-md border border-border bg-surface-2/60 p-3 font-mono text-[12px] text-muted sm:grid-cols-2">
              <div>K_x·L_x / r_x = {fmt(resultado.esbeltezX)}</div>
              <div>K_y·L_y / r_y = {fmt(resultado.esbeltezY)}</div>
              <div>N_e,x = {fmtKN(resultado.NeX, 0)}</div>
              <div>N_e,y = {fmtKN(resultado.NeY, 0)}</div>
              <div className="sm:col-span-2">
                N_e = {fmtKN(resultado.Ne, 0)} → eixo {resultado.eixoGovernante.toUpperCase()}
              </div>
              <div>λ₀ = {fmt(resultado.lambda0, 3)}</div>
              <div>χ = {fmt(resultado.chi, 4)}</div>
            </div>
            {(resultado.esbeltezX > 200 || resultado.esbeltezY > 200) && (
              <p className="mt-3 text-xs text-warn">
                ⚠ Esbeltez &gt; 200 — NBR 8800 §5.3.4.1 limita K·L/r ≤ 200 para barras
                comprimidas.
              </p>
            )}
          </section>
        </div>

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
              <div className="mt-1 text-[11px] text-muted">
                {aco.norma} {aco.grau !== '—' ? `· ${aco.grau}` : ''}
              </div>
            </div>
          </div>

          <ResultCard
            label="N_c,Rd — Resistência de cálculo"
            value={resultado.NcRd}
            unit="kN"
            digits={1}
            hint={`Eixo governante: ${resultado.eixoGovernante.toUpperCase()} · χ = ${fmt(resultado.chi, 4)}`}
            tone="accent"
          />

          <div className="card p-4">
            <UtilizationBar eta={resultado.utilizacao} />
            <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
              <span>N_Sd = {fmtKN(Nsd)}</span>
              <span>/ N_Rd = {fmtKN(resultado.NcRd)}</span>
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
