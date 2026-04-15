import { Link } from 'react-router-dom'
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
  IconHome,
} from '../icons'
import type { ReactNode } from 'react'

type Item = {
  label: string
  to: string
  icon: ReactNode
  soon?: boolean
}

type Group = {
  title: string
  items: Item[]
}

const groups: Group[] = [
  {
    title: 'Início',
    items: [{ label: 'Dashboard', to: '/', icon: <IconHome /> }],
  },
  {
    title: 'Módulo 1 — Barras',
    items: [
      { label: 'Tração', to: '/barras/tracao', icon: <IconTracao /> },
      { label: 'Compressão', to: '/barras/compressao', icon: <IconCompressao /> },
      { label: 'Flexão', to: '/barras/flexao', icon: <IconFlexao />, soon: true },
      { label: 'Cisalhamento', to: '/barras/cisalhamento', icon: <IconCisalhamento />, soon: true },
      {
        label: 'Flexo-compressão',
        to: '/barras/flexo-compressao',
        icon: <IconFlexoCompressao />,
        soon: true,
      },
      { label: 'Torção', to: '/barras/torcao', icon: <IconTorcao />, soon: true },
    ],
  },
  {
    title: 'Ligações & Chapas',
    items: [
      { label: 'Parafusos', to: '/parafusos', icon: <IconParafuso />, soon: true },
      { label: 'Soldas', to: '/soldas', icon: <IconSolda />, soon: true },
      { label: 'Chapas e Compostos', to: '/chapas', icon: <IconChapa />, soon: true },
    ],
  },
  {
    title: 'Saída',
    items: [{ label: 'Memória de Cálculo', to: '/relatorio', icon: <IconRelatorio />, soon: true }],
  },
]

interface Props {
  pathname: string
  onNavigate?: () => void
}

export default function Sidebar({ pathname, onNavigate }: Props) {
  return (
    <nav className="space-y-6" aria-label="Navegação principal">
      {groups.map((g) => (
        <div key={g.title}>
          <h3 className="label mb-2 px-2">{g.title}</h3>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = pathname === it.to
              return (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={onNavigate}
                    className={[
                      'group flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                      active
                        ? 'bg-surface text-text shadow-[inset_3px_0_0_0_var(--color-accent)]'
                        : 'text-muted hover:bg-surface/60 hover:text-text',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex h-7 w-7 items-center justify-center rounded border border-transparent transition-colors',
                        active
                          ? 'border-accent/40 text-accent'
                          : 'text-muted group-hover:text-text',
                      ].join(' ')}
                    >
                      {it.icon}
                    </span>
                    <span className="flex-1">{it.label}</span>
                    {it.soon && (
                      <span className="chip !px-1.5 !py-0 text-[10px] uppercase">em breve</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
