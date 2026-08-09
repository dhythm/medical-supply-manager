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
    <div className="border-border bg-card rounded-md border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-2 font-mono text-2xl font-medium tracking-tight">{value}</p>
      {delta ? (
        <p
          className={cn(
            'mt-1 text-xs',
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
    <div className={cn('bg-secondary h-2 w-full overflow-hidden rounded-full', className)}>
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
    <section className={cn('border-border bg-card rounded-md border', className)}>
      <div className="border-border flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}
