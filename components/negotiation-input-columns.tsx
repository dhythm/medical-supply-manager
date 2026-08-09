type NegotiationColumn = {
  title: string
  content: React.ReactNode
  form: React.ReactNode
}

export function NegotiationInputColumns({
  left,
  right,
}: {
  left: NegotiationColumn
  right: NegotiationColumn
}) {
  return (
    <div
      data-testid="negotiation-input-columns"
      className="grid gap-5 p-5 lg:grid-cols-2 lg:grid-rows-[auto_auto_1fr]"
    >
      <NegotiationInputColumn {...left} />
      <NegotiationInputColumn {...right} />
    </div>
  )
}

function NegotiationInputColumn({ title, content, form }: NegotiationColumn) {
  return (
    <section
      data-testid={`negotiation-column-${title}`}
      className="grid content-start gap-3 lg:row-span-3 lg:grid-rows-subgrid"
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <div>{content}</div>
      <div>{form}</div>
    </section>
  )
}
