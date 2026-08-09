import { Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export function FeaturePreparation({ featureName }: { featureName: string }) {
  return (
    <section className="border-border/80 bg-card mx-auto flex min-h-72 max-w-3xl flex-col items-center justify-center rounded-xl border px-6 py-12 text-center shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)]">
      <span className="bg-secondary text-muted-foreground grid size-12 place-items-center rounded-xl">
        <Clock3 className="size-5" aria-hidden="true" />
      </span>
      <Badge variant="outline" className="mt-5">
        準備中
      </Badge>
      <p className="mt-3 text-sm font-medium">{featureName}は準備中です。</p>
    </section>
  )
}
