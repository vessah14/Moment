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

const DATA = [
  { day: '01', visites: 120, rsvp: 40 },
  { day: '04', visites: 180, rsvp: 70 },
  { day: '07', visites: 240, rsvp: 110 },
  { day: '10', visites: 300, rsvp: 160 },
  { day: '13', visites: 260, rsvp: 190 },
  { day: '16', visites: 340, rsvp: 230 },
  { day: '19', visites: 400, rsvp: 260 },
  { day: '22', visites: 380, rsvp: 300 },
  { day: '25', visites: 430, rsvp: 340 },
  { day: '28', visites: 470, rsvp: 380 },
]

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

export default function VisitsChart() {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
            dataKey="rsvp"
            name="RSVP"
            stroke="var(--color-chart-pink)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
