import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PassoCalculo } from '@/calculos/nbr8800/tracao'

export interface SnapshotCalculo {
  id: string // gerado em runtime
  modulo: string // 'Tração', 'Compressão' etc.
  titulo: string // descrição curta
  referencia: string
  resumo: { rotulo: string; valor: string }[]
  utilizacao?: number
  status?: 'ok' | 'alerta' | 'nok'
  passos: PassoCalculo[]
  criadoEm: string // ISO
}

interface ProjetoMeta {
  nome: string
  responsavel: string
  cliente: string
  data: string
}

interface MemorialState {
  projeto: ProjetoMeta
  snapshots: SnapshotCalculo[]
  setProjeto: (p: Partial<ProjetoMeta>) => void
  adicionar: (s: Omit<SnapshotCalculo, 'id' | 'criadoEm'>) => void
  remover: (id: string) => void
  limpar: () => void
}

export const useMemorial = create<MemorialState>()(
  persist(
    (set) => ({
      projeto: {
        nome: '',
        responsavel: '',
        cliente: '',
        data: new Date().toISOString().slice(0, 10),
      },
      snapshots: [],
      setProjeto: (p) =>
        set((s) => ({ projeto: { ...s.projeto, ...p } })),
      adicionar: (s) =>
        set((state) => ({
          snapshots: [
            ...state.snapshots,
            {
              ...s,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              criadoEm: new Date().toISOString(),
            },
          ],
        })),
      remover: (id) =>
        set((state) => ({
          snapshots: state.snapshots.filter((x) => x.id !== id),
        })),
      limpar: () => set({ snapshots: [] }),
    }),
    { name: 'calc-nbr-memorial-v1' },
  ),
)
