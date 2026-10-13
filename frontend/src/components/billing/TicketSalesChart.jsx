import {
  Bar,
  BarChart,
  CartesianGrid,
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
      <p className="mt-0.5 font-mono font-semibold text-ink">
        {payload[0].value} billets
      </p>
    </div>
  )
}

export default function TicketSalesChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-faint">
        Aucune vente enregistrée pour le moment.
      </div>
    )
  }

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-2)' }} />
          <Bar dataKey="tickets" fill="var(--color-chart-purple)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
