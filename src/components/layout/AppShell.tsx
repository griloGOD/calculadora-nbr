import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'
import { IconBars, IconLogo, IconX } from '../icons'

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header (mobile + tablet top bar) */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <IconLogo className="text-accent" />
            <span className="font-display text-sm font-semibold tracking-wide">
              NBR 8800
            </span>
            <span className="chip hidden sm:inline-flex">Calculadora</span>
          </Link>
          <button
            className="btn-ghost !p-2"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <IconX /> : <IconBars />}
          </button>
        </div>
      </header>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-72 lg:shrink-0 lg:border-r lg:border-border lg:bg-surface/40">
          <div className="sticky top-0 h-screen overflow-y-auto px-4 py-6">
            <Link to="/" className="mb-8 flex items-center gap-2 px-2">
              <IconLogo className="text-accent" width={24} height={24} />
              <div>
                <div className="font-display text-base font-bold tracking-wide">NBR 8800</div>
                <div className="text-[11px] uppercase tracking-widest text-muted">
                  Estruturas de aço
                </div>
              </div>
            </Link>
            <Sidebar pathname={pathname} />
            <div className="mt-8 rounded-md border border-border bg-surface p-3 text-[11px] text-muted">
              <p className="mb-1 font-semibold uppercase tracking-widest text-text/80">Aviso</p>
              Ferramenta auxiliar. Sempre validar os resultados com um engenheiro responsável.
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="fixed inset-0 top-14 z-20 bg-bg/95 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="h-full overflow-y-auto px-4 py-6"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Bottom tabs (mobile only) */}
      <BottomTabs pathname={pathname} />
    </div>
  )
}
