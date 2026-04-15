import { Link } from 'react-router-dom'
import { IconHome, IconTracao, IconCompressao, IconParafuso, IconRelatorio } from '../icons'

interface Props {
  pathname: string
}

const items = [
  { label: 'Início', to: '/', icon: <IconHome /> },
  { label: 'Tração', to: '/barras/tracao', icon: <IconTracao /> },
  { label: 'Compressão', to: '/barras/compressao', icon: <IconCompressao /> },
  { label: 'Parafusos', to: '/parafusos', icon: <IconParafuso /> },
  { label: 'Relatório', to: '/relatorio', icon: <IconRelatorio /> },
]

export default function BottomTabs({ pathname }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/90 backdrop-blur-md lg:hidden"
      aria-label="Atalhos"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map((it) => {
          const active =
            pathname === it.to || (it.to !== '/' && pathname.startsWith(it.to))
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={[
                  'flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors',
                  active ? 'text-accent' : 'text-muted',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-6 w-6 items-center justify-center',
                    active ? '' : '',
                  ].join(' ')}
                >
                  {it.icon}
                </span>
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
