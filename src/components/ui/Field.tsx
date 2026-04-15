import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { IconInfo } from '../icons'

interface FieldWrapProps {
  label: string
  hint?: string
  error?: string
  suffix?: ReactNode
  children: ReactNode
  id: string
}

export function FieldWrap({ label, hint, error, suffix, children, id }: FieldWrapProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="label flex items-center gap-1.5">
        {label}
        {hint && (
          <span className="group relative inline-flex cursor-help">
            <IconInfo width={12} height={12} className="text-muted" />
            <span className="absolute left-1/2 top-full z-10 mt-1 hidden w-52 -translate-x-1/2 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-[11px] font-normal normal-case tracking-normal text-text shadow-lg group-hover:block">
              {hint}
            </span>
          </span>
        )}
      </label>
      <div
        className={[
          'group flex items-center rounded-md border bg-surface transition-colors',
          error
            ? 'border-danger focus-within:border-danger'
            : 'border-border focus-within:border-accent',
        ].join(' ')}
      >
        {children}
        {suffix && (
          <span className="shrink-0 border-l border-border px-3 py-2 text-xs text-muted">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

type NumberFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  unit?: string
  id: string
}

export function NumberField({
  label,
  hint,
  error,
  unit,
  id,
  ...rest
}: NumberFieldProps) {
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error} suffix={unit}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        className="flex-1 bg-transparent px-3 py-2 text-sm tabular-nums focus:outline-none"
        {...rest}
      />
    </FieldWrap>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  hint?: string
  error?: string
  id: string
  children: ReactNode
}

export function SelectField({
  label,
  hint,
  error,
  id,
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        className="flex-1 appearance-none bg-transparent px-3 py-2 pr-8 text-sm focus:outline-none"
        {...rest}
      >
        {children}
      </select>
      <span className="pointer-events-none -ml-8 mr-3 text-muted">▾</span>
    </FieldWrap>
  )
}
