import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs shadow-xl">
      <p className="text-faint">Jour {label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-0.5 font-mono font-semibold text-ink">
          {entry.name} : {entry.value}
        </p>
      ))}
    </div>
  )
}

export default function VisitsChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-faint">
        Pas encore de trafic enregistré pour cet événement.
      </div>
    )
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-faint)', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-faint)', fontSize: 11 }}
            width={32}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            height={24}
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: 'var(--color-muted)' }}
          />
          <Line
            type="monotone"
            dataKey="visites"
            name="Visites"
            stroke="var(--color-chart-purple)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="partages"
            name="Partages"
            stroke="var(--color-chart-pink)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
