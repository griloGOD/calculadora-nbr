import { Link } from 'react-router-dom'
import SectionHeader from '@/components/ui/SectionHeader'

interface Props {
  title: string
}

export default function ComingSoonPage({ title }: Props) {
  return (
    <div>
      <SectionHeader
        eyebrow="Módulo em desenvolvimento"
        title={title}
        subtitle="Esta verificação normativa está no backlog das próximas sprints. Enquanto isso, use os módulos já implementados."
      />
      <div className="card relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-blueprint-grid opacity-40" aria-hidden />
        <div className="relative z-10">
          <div className="label mb-3">Roadmap</div>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <span className="text-accent-alt">✔</span> Sprint 1 — Tração e Compressão
            </li>
            <li>
              <span className="text-muted">○</span> Sprint 2 — Flexão, Cisalhamento, Flexo-compressão,
              SVG paramétrico
            </li>
            <li>
              <span className="text-muted">○</span> Sprint 3 — Parafusos, Soldas, Memória em PDF
            </li>
            <li>
              <span className="text-muted">○</span> Sprint 4 — Catálogo completo, ELS, Torção
            </li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Link to="/barras/tracao" className="btn-primary">Ir para Tração</Link>
            <Link to="/" className="btn-ghost">Voltar ao Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
