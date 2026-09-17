import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const DATA = [
  { name: 'Confirmés', value: 287, color: 'var(--color-chart-green)' },
  { name: 'En attente', value: 96, color: 'var(--color-chart-amber)' },
  { name: 'Refus', value: 29, color: 'var(--color-chart-rose)' },
]

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

export default function RsvpDonut() {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={DATA}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="var(--color-panel)"
            strokeWidth={2}
          >
            {DATA.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
