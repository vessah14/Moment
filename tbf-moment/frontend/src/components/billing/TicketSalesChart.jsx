import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DATA = [
  { day: '01', tickets: 8 },
  { day: '03', tickets: 14 },
  { day: '05', tickets: 11 },
  { day: '07', tickets: 22 },
  { day: '09', tickets: 19 },
  { day: '11', tickets: 27 },
  { day: '13', tickets: 31 },
  { day: '15', tickets: 24 },
  { day: '17', tickets: 35 },
  { day: '19', tickets: 29 },
  { day: '21', tickets: 42 },
  { day: '23', tickets: 33 },
  { day: '25', tickets: 38 },
  { day: '27', tickets: 45 },
]

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

export default function TicketSalesChart() {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
