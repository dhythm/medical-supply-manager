import { PageHeader } from '@/components/app-shell'
import { MeterBar, Panel } from '@/components/shared'
import { VoiceBoard } from '@/components/voice-board'
import { exhibition } from '@/lib/mock-data'

export default function VoicePage() {
  const maxCount = exhibition.funnel[0].count

  return (
    <>
      <PageHeader
        eyebrow="Voice of Customer / Exhibition"
        title="作れる人が客先へ行くと、商談率が変わる"
        description="展示会は、すでに関心を持って会場まで来た相手と直接話せる場です。誰が聞いたかまで含めて要望を記録し、開発・経営が現場と接触した量を成果として計測します。"
      />

      <div className="grid gap-4 px-5 py-6 md:px-8 md:py-8">
        <Panel title={exhibition.name} hint={`${exhibition.venue} / ${exhibition.period}`}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.16em]">
                来訪から商談化まで
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {exhibition.funnel.map((f) => (
                  <li key={f.stage}>
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm">{f.stage}</p>
                      <p className="font-mono text-xs">{f.count}</p>
                    </div>
                    <MeterBar value={(f.count / maxCount) * 100} className="mt-2" />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.16em]">
                対応者別の成果
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {exhibition.staffing.map((s) => {
                  const rate = (s.opportunities / s.conversations) * 100
                  return (
                    <li key={s.name} className="border-border rounded-md border p-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm">
                          {s.name}
                          <span className="text-muted-foreground ml-2 text-xs">{s.role}</span>
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {s.conversations}件対話 → 商談{s.opportunities}件
                        </p>
                      </div>
                      <MeterBar
                        value={rate * 4}
                        tone={rate >= 15 ? 'primary' : rate >= 5 ? 'accent' : 'muted'}
                        className="mt-2"
                      />
                      <p className="text-muted-foreground mt-1 font-mono text-[11px]">
                        商談化率 {rate.toFixed(1)}%
                      </p>
                    </li>
                  )
                })}
              </ul>
              <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                呼び込み専任は対話数が最多（96件）でも商談化率1.0%。製品を作れる人・意思決定できる人が対応した場合は18〜22%で、対話の質が成果を決めています。
              </p>
            </div>
          </div>
        </Panel>

        <VoiceBoard />
      </div>
    </>
  )
}
