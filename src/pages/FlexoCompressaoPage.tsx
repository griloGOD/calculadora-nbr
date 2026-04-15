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
import { calcularCompressao } from '@/calculos/nbr8800/compressao'
import { calcularFlexao } from '@/calculos/nbr8800/flexao'
import { calcularFlexoCompressao } from '@/calculos/nbr8800/flexoCompressao'
import { fmt, fmtKN, fmtMPa } from '@/calculos/utils/format'

export default function FlexoCompressaoPage() {
  const [acoId, setAcoId] = useState('a572-50')
  const [perfilId, setPerfilId] = useState('w360x57')
  const [Lx, setLx] = useState(400)
  const [Ly, setLy] = useState(400)
  const [Kx, setKx] = useState(1)
  const [Ky, setKy] = useState(1)
  const [Lb, setLb] = useState(400)
  const [Cb, setCb] = useState(1.0)
  const [NSd, setNSd] = useState(600)
  const [MxSd, setMxSd] = useState(80)
  const [MySd, setMySd] = useState(10)

  const aco = getAco(acoId)!
  const perfil = getPerfil(perfilId)!

  const compressao = useMemo(
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
      }),
    [perfil, aco, Kx, Ky, Lx, Ly],
  )

  const flexaoX = useMemo(
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
      }),
    [perfil, aco, Lb, Cb],
  )

  /**
   * Resistência aproximada no eixo fraco: Mn = Zy·fy (sem FLT — lateralmente
   * restringido na flexão sobre eixo y), limitado por FLM no eixo y.
   * Como simplificação, usamos apenas Mpl_y / γa1 (comum na prática para perfis W).
   */
  const MyRd = useMemo(() => {
    const fyKNcm2 = aco.fy / 10
    const Mpl = perfil.Zy * fyKNcm2 // kN·cm
    return Mpl / 1.1 / 100 // kN·m, γa1 = 1,10
  }, [perfil, aco])

  const interacao = useMemo(
    () =>
      calcularFlexoCompressao({
        NSd,
        NRd: compressao.NcRd,
        MxSd,
        MxRd: flexaoX.MRd,
        MySd,
        MyRd,
      }),
    [NSd, compressao.NcRd, MxSd, flexaoX.MRd, MySd, MyRd],
  )

  return (
    <div>
      <SectionHeader
        eyebrow="Módulo 1 · Barras"
        title="Flexo-compressão"
        subtitle="NBR 8800:2008 §5.5 — Interação de força axial de compressão com momentos fletores em dois eixos. Calcula N_c,Rd, M_x,Rd e M_y,Rd internamente e aplica as equações de interação."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(340px,420px)]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label mb-4">Material e perfil</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField id="aco-fc" label="Aço" value={acoId} onChange={(e) => setAcoId(e.target.value)}>
                {ACOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.norma} {a.grau !== '—' ? `• ${a.grau}` : ''} — fy {a.fy} MPa
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="perfil-fc"
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
              <div>Z_x = {fmt(perfil.Zx, 0)} cm³</div>
              <div>Z_y = {fmt(perfil.Zy, 0)} cm³</div>
              <div>r_x = {fmt(perfil.rx)}</div>
              <div>r_y = {fmt(perfil.ry)}</div>
              <div>f_y = {fmtMPa(aco.fy)}</div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Compressão</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              <NumberField id="kx-fc" label="K_x" value={Kx} onChange={(e) => setKx(Number(e.target.value))} step={0.05} />
              <NumberField id="ky-fc" label="K_y" value={Ky} onChange={(e) => setKy(Number(e.target.value))} step={0.05} />
              <NumberField id="lx-fc" label="L_x" unit="cm" value={Lx} onChange={(e) => setLx(Number(e.target.value))} step={10} />
              <NumberField id="ly-fc" label="L_y" unit="cm" value={Ly} onChange={(e) => setLy(Number(e.target.value))} step={10} />
            </div>
            <div className="mt-3 font-mono text-[12px] text-muted">
              N_c,Rd = <span className="text-text">{fmtKN(compressao.NcRd, 1)}</span> · χ = {fmt(compressao.chi, 4)} · λ₀ = {fmt(compressao.lambda0, 3)}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Flexão eixo x (M_x,Rd)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField id="lb-fc" label="L_b" unit="cm" value={Lb} onChange={(e) => setLb(Number(e.target.value))} step={10} />
              <NumberField id="cb-fc" label="C_b" value={Cb} onChange={(e) => setCb(Number(e.target.value))} step={0.05} min={1} />
            </div>
            <div className="mt-3 font-mono text-[12px] text-muted">
              M_x,Rd = <span className="text-text">{fmt(flexaoX.MRd, 2)} kN·m</span> · governante {flexaoX.governante}
            </div>
            <div className="mt-1 font-mono text-[12px] text-muted">
              M_y,Rd ≈ <span className="text-text">{fmt(MyRd, 2)} kN·m</span> (Z_y·f_y/γa1 — eixo fraco)
            </div>
          </section>

          <section className="card p-5">
            <h2 className="label mb-4">Solicitações</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField id="nsd-fc" label="N_Sd" unit="kN" value={NSd} onChange={(e) => setNSd(Number(e.target.value))} step={10} />
              <NumberField id="mxsd" label="M_x,Sd" unit="kN·m" value={MxSd} onChange={(e) => setMxSd(Number(e.target.value))} step={2} />
              <NumberField id="mysd" label="M_y,Sd" unit="kN·m" value={MySd} onChange={(e) => setMySd(Number(e.target.value))} step={2} />
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
            label="η — Utilização na interação"
            value={interacao.utilizacao}
            unit="(≤ 1,0)"
            digits={3}
            hint={`Caso ${interacao.caso === 'alta' ? 'N_Sd/N_Rd ≥ 0,2' : 'N_Sd/N_Rd < 0,2'}`}
            tone="accent"
          />

          <SaveToMemorialButton
            snapshot={{
              modulo: 'Flexo-compressão',
              titulo: `${perfil.designacao} · ${aco.norma}${aco.grau !== '—' ? ' ' + aco.grau : ''}`,
              referencia: interacao.referencia,
              status: interacao.status,
              utilizacao: interacao.utilizacao,
              resumo: [
                { rotulo: 'N_c,Rd', valor: fmtKN(compressao.NcRd, 1) },
                { rotulo: 'M_x,Rd', valor: `${fmt(flexaoX.MRd, 2)} kN·m` },
                { rotulo: 'M_y,Rd', valor: `${fmt(MyRd, 2)} kN·m` },
                { rotulo: 'N_Sd', valor: fmtKN(NSd, 1) },
                { rotulo: 'M_x,Sd', valor: `${fmt(MxSd, 2)} kN·m` },
                { rotulo: 'M_y,Sd', valor: `${fmt(MySd, 2)} kN·m` },
              ],
              passos: interacao.passos,
            }}
          />

          <div className="card p-4">
            <UtilizationBar eta={interacao.utilizacao} />
            <div className="mt-3 grid gap-1 font-mono text-xs text-muted">
              <div>N_Sd/N_Rd = {fmt(interacao.razaoN, 3)}</div>
              <div>M_x,Sd/M_x,Rd = {fmt(MxSd / flexaoX.MRd, 3)}</div>
              <div>M_y,Sd/M_y,Rd = {fmt(MySd / MyRd, 3)}</div>
            </div>
          </div>

          <FormulaBlock
            titulo="Desenvolvimento da interação"
            referencia={interacao.referencia}
            passos={interacao.passos}
            defaultOpen
          />
        </motion.aside>
      </div>
    </div>
  )
}
