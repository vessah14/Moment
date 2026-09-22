import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs shadow-xl">
      <p className="font-mono font-semibold text-ink">
        {name} : {value}
      </p>
    </div>
  )
}

export default function RsvpDonut({ data }) {
  const total = data?.reduce((sum, d) => sum + d.value, 0) ?? 0

  if (!total) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-faint">
        Aucun invité pour le moment.
      </div>
    )
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="var(--color-panel)"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
