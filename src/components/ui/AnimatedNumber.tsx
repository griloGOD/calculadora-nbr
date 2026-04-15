import { useEffect, useRef, useState } from 'react'
import { fmt } from '@/calculos/utils/format'

interface Props {
  value: number
  digits?: number
  duration?: number
  className?: string
}

export default function AnimatedNumber({
  value,
  digits = 1,
  duration = 520,
  className,
}: Props) {
  const [shown, setShown] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const start = performance.now()
    const from = prev.current
    const to = value
    if (!Number.isFinite(to)) {
      setShown(to)
      prev.current = to
      return
    }
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      // cubic ease-out
      const e = 1 - Math.pow(1 - p, 3)
      setShown(from + (to - from) * e)
      if (p < 1) raf = requestAnimationFrame(tick)
      else prev.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <span className={className + ' tabular-nums'}>
      {Number.isFinite(shown) ? fmt(shown, digits) : '—'}
    </span>
  )
}
