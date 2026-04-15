import { useState } from 'react'
import { useMemorial, type SnapshotCalculo } from '@/store/memorial'
import { IconCheck } from '../icons'

interface Props {
  snapshot: Omit<SnapshotCalculo, 'id' | 'criadoEm'>
  className?: string
}

export default function SaveToMemorialButton({ snapshot, className }: Props) {
  const adicionar = useMemorial((s) => s.adicionar)
  const [salvo, setSalvo] = useState(false)

  const onClick = () => {
    adicionar(snapshot)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={['btn-ghost text-xs', className].filter(Boolean).join(' ')}
    >
      {salvo ? (
        <>
          <IconCheck width={14} height={14} className="text-accent-alt" />
          Adicionado
        </>
      ) : (
        '+ Adicionar à memória'
      )}
    </button>
  )
}
