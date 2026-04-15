import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import {
  IconTracao,
  IconCompressao,
  IconFlexao,
  IconCisalhamento,
  IconFlexoCompressao,
  IconTorcao,
  IconParafuso,
  IconSolda,
  IconChapa,
  IconRelatorio,
  IconChevron,
} from '@/components/icons'
import type { ReactNode } from 'react'

interface ModuleCard {
  title: string
  to: string
  desc: string
  icon: ReactNode
  ready?: boolean
  group?: string
}

const modules: ModuleCard[] = [
  {
    title: 'Tração',
    to: '/barras/tracao',
    desc: 'Escoamento da seção bruta e ruptura da seção líquida efetiva.',
    icon: <IconTracao />,
    ready: true,
    group: 'Barras',
  },
  {
    title: 'Compressão',
    to: '/barras/compressao',
    desc: 'Flambagem global por flexão com curva SSRC. Q = 1 no MVP.',
    icon: <IconCompressao />,
    ready: true,
    group: 'Barras',
  },
  {
    title: 'Flexão',
    to: '/barras/flexao',
    desc: 'Momento resistente plástico, FLT, FLM, FLA, Cb.',
    icon: <IconFlexao />,
    ready: true,
    group: 'Barras',
  },
  {
    title: 'Cisalhamento',
    to: '/barras/cisalhamento',
    desc: 'Verificação da alma, flambagem e enrijecedores transversais.',
    icon: <IconCisalhamento />,
    ready: true,
    group: 'Barras',
  },
  {
    title: 'Flexo-compressão',
    to: '/barras/flexo-compressao',
    desc: 'Interação biaxial segundo §5.5 da NBR 8800.',
    icon: <IconFlexoCompressao />,
    ready: true,
    group: 'Barras',
  },
  {
    title: 'Torção',
    to: '/barras/torcao',
    desc: 'St. Venant e empenamento para perfis abertos e fechados.',
    icon: <IconTorcao />,
    group: 'Barras',
  },
  {
    title: 'Parafusos',
    to: '/parafusos',
    desc: 'Ligações por apoio e por atrito (HSFG).',
    icon: <IconParafuso />,
    ready: true,
    group: 'Ligações',
  },
  {
    title: 'Soldas',
    to: '/soldas',
    desc: 'Solda de filete: metal da solda e metal base.',
    icon: <IconSolda />,
    ready: true,
    group: 'Ligações',
  },
  {
    title: 'Chapas e Compostos',
    to: '/chapas',
    desc: 'Chapas, perfis compostos e seções mistas simplificadas.',
    icon: <IconChapa />,
    group: 'Elementos',
  },
  {
    title: 'Memória de Cálculo',
    to: '/relatorio',
    desc: 'Memorial consolidado dos cálculos com impressão para PDF.',
    icon: <IconRelatorio />,
    ready: true,
    group: 'Saída',
  },
]

const grouped = modules.reduce<Record<string, ModuleCard[]>>((acc, m) => {
  const k = m.group ?? 'Outros'
  if (!acc[k]) acc[k] = []
  acc[k].push(m)
  return acc
}, {})

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden rounded-xl border border-border bg-surface">
        <div className="absolute inset-0 bg-blueprint-grid opacity-60" aria-hidden />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" aria-hidden />
        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14">
          <div className="label mb-3">ABNT NBR 8800:2008</div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Dimensionamento de <span className="text-accent">estruturas de aço</span>
            <br className="hidden sm:block" /> com precisão normativa.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Calcule as forças resistentes de cálculo de barras, ligações parafusadas e soldadas
            conforme a NBR 8800:2008. Equações transparentes, resultados auditáveis, disponível
            em qualquer dispositivo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/barras/flexao" className="btn-primary">
              Começar pela Flexão
              <IconChevron width={16} height={16} />
            </Link>
            <Link to="/barras/compressao" className="btn-ghost">
              Compressão
            </Link>
            <Link to="/barras/flexo-compressao" className="btn-ghost">
              Flexo-compressão
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-[11px]">
            <span className="chip">γₐ₁ = 1,10</span>
            <span className="chip">γₐ₂ = 1,35</span>
            <span className="chip">E = 200.000 MPa</span>
            <span className="chip">Curva SSRC</span>
          </div>
        </div>
      </section>

      {/* Module sections */}
      {Object.entries(grouped).map(([group, items]) => (
        <section key={group} className="mb-10">
          <SectionHeader
            eyebrow="Módulos"
            title={group}
            subtitle={
              group === 'Barras'
                ? 'Verificações de elementos lineares sujeitos a esforços normais, transversais e de flexão.'
                : undefined
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m, i) => (
              <motion.div
                key={m.to}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Link
                  to={m.to}
                  className="group card-hoverable relative block overflow-hidden p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2 text-accent transition-colors group-hover:border-accent/40">
                      {m.icon}
                    </div>
                    {m.ready ? (
                      <span className="chip !border-accent-alt/40 !text-accent-alt">ativo</span>
                    ) : (
                      <span className="chip">em breve</span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted">{m.desc}</p>
                  <div
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
