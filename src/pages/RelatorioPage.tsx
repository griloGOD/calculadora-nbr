import SectionHeader from '@/components/ui/SectionHeader'
import { useMemorial } from '@/store/memorial'
import { fmt } from '@/calculos/utils/format'
import { IconLogo, IconX } from '@/components/icons'

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  alerta: 'ALERTA',
  nok: 'NOK',
}

const STATUS_COLOR: Record<string, string> = {
  ok: 'var(--color-accent-alt)',
  alerta: 'var(--color-warn)',
  nok: 'var(--color-danger)',
}

export default function RelatorioPage() {
  const projeto = useMemorial((s) => s.projeto)
  const setProjeto = useMemorial((s) => s.setProjeto)
  const snapshots = useMemorial((s) => s.snapshots)
  const remover = useMemorial((s) => s.remover)
  const limpar = useMemorial((s) => s.limpar)

  return (
    <div className="memorial">
      <SectionHeader
        eyebrow="Memória de Cálculo"
        title="Relatório consolidado"
        subtitle="Preencha os dados do projeto e adicione cálculos a partir das páginas dos módulos. Use o botão Imprimir para gerar um PDF via navegador."
        right={
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-primary"
            >
              Imprimir / Salvar PDF
            </button>
            {snapshots.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Remover todos os cálculos da memória?')) limpar()
                }}
                className="btn-ghost"
              >
                Limpar tudo
              </button>
            )}
          </div>
        }
      />

      {/* Cabeçalho impresso (visível só na impressão) */}
      <div className="hidden border-b border-border pb-4 print:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconLogo className="text-accent" />
            <div>
              <div className="font-display text-lg font-bold">Calculadora NBR 8800</div>
              <div className="text-[11px] uppercase tracking-widest text-muted">
                Memorial de cálculo — ABNT NBR 8800:2008
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-muted">
            Emitido em {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Metadados do projeto */}
      <section className="card mb-6 mt-4 p-5">
        <h2 className="label mb-4">Identificação</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="label">Nome do projeto</span>
            <input
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={projeto.nome}
              onChange={(e) => setProjeto({ nome: e.target.value })}
              placeholder="ex.: Galpão industrial — bloco A"
            />
          </label>
          <label className="space-y-1">
            <span className="label">Cliente</span>
            <input
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={projeto.cliente}
              onChange={(e) => setProjeto({ cliente: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="label">Responsável técnico</span>
            <input
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={projeto.responsavel}
              onChange={(e) => setProjeto({ responsavel: e.target.value })}
              placeholder="Engº ... CREA ..."
            />
          </label>
          <label className="space-y-1">
            <span className="label">Data</span>
            <input
              type="date"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={projeto.data}
              onChange={(e) => setProjeto({ data: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* Lista de cálculos salvos */}
      {snapshots.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-12 text-center print:hidden">
          <p className="font-display text-lg">Nenhum cálculo no memorial ainda.</p>
          <p className="mt-1 text-sm text-muted">
            Vá até qualquer módulo (Tração, Compressão, Flexão, …) e clique em
            <span className="mx-1 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px]">
              + Adicionar à memória
            </span>
            ao lado do resultado.
          </p>
        </div>
      ) : (
        <section className="space-y-5">
          <div className="label print:hidden">
            {snapshots.length} cálculo(s) na memória
          </div>
          {snapshots.map((s, idx) => (
            <article
              key={s.id}
              className="card overflow-hidden print:break-inside-avoid"
            >
              <header className="flex items-start justify-between gap-3 border-b border-border bg-surface-2/40 px-5 py-3">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted">
                    {String(idx + 1).padStart(2, '0')} · {s.modulo}
                  </div>
                  <h3 className="font-display text-base font-semibold">
                    {s.titulo}
                  </h3>
                  <div className="mt-0.5 text-[11px] text-muted">{s.referencia}</div>
                </div>
                <div className="flex items-center gap-2">
                  {s.status && (
                    <span
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                      style={{
                        color: STATUS_COLOR[s.status],
                        borderColor: STATUS_COLOR[s.status],
                        backgroundColor: `${STATUS_COLOR[s.status]}15`,
                      }}
                    >
                      {STATUS_LABEL[s.status]}
                      {s.utilizacao !== undefined &&
                        ` · η = ${fmt(s.utilizacao * 100, 1)}%`}
                    </span>
                  )}
                  <button
                    onClick={() => remover(s.id)}
                    className="btn-ghost !p-1.5 print:hidden"
                    aria-label="Remover"
                  >
                    <IconX width={14} height={14} />
                  </button>
                </div>
              </header>
              <div className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_2fr]">
                {/* Resumo */}
                <div className="space-y-2">
                  {s.resumo.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-3 py-2"
                    >
                      <span className="label">{r.rotulo}</span>
                      <span className="font-mono text-sm">{r.valor}</span>
                    </div>
                  ))}
                </div>
                {/* Passos */}
                <div className="rounded-md border border-border bg-surface-2/40 p-3 font-mono text-[12px] leading-relaxed">
                  {s.passos.map((p, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <div className="text-accent">{p.equacao}</div>
                      <div className="text-muted">  {p.substituicao}</div>
                      <div className="text-text">  → {p.resultado}</div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}

          <footer className="hidden border-t border-border pt-4 text-[11px] text-muted print:block">
            Memorial gerado pela Calculadora NBR 8800. Os resultados devem ser
            validados por engenheiro responsável conforme a ABNT NBR 8800:2008.
          </footer>
        </section>
      )}
    </div>
  )
}
