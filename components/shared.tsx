import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  delta,
  tone = 'neutral',
}: {
  label: string
  value: string
  delta?: string
  tone?: 'neutral' | 'up' | 'warn'
}) {
  return (
    <div className="border-border/80 bg-card rounded-xl border p-5 shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)]">
      <p className="text-muted-foreground text-[13px] font-medium">{label}</p>
      <p className="mt-3 font-mono text-[1.75rem] font-semibold tracking-[-0.04em]">{value}</p>
      {delta ? (
        <p
          className={cn(
            'mt-1.5 text-xs font-medium',
            tone === 'up' && 'text-primary',
            tone === 'warn' && 'text-accent-foreground',
            tone === 'neutral' && 'text-muted-foreground',
          )}
        >
          {delta}
        </p>
      ) : null}
    </div>
  )
}

export function MeterBar({
  value,
  className,
  tone = 'primary',
}: {
  value: number
  className?: string
  tone?: 'primary' | 'accent' | 'muted'
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, Math.max(0, Math.round(value)))}
      className={cn('bg-secondary h-2 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className={cn(
          'h-full rounded-full',
          tone === 'primary' && 'bg-primary',
          tone === 'accent' && 'bg-accent',
          tone === 'muted' && 'bg-muted-foreground/40',
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function Panel({
  title,
  hint,
  children,
  className,
}: {
  title: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'border-border/80 bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)]',
        className,
      )}
    >
      <div className="border-border/70 flex min-h-14 flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5">
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        {hint ? <p className="text-muted-foreground text-xs font-medium">{hint}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
