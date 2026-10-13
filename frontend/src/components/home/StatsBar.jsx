const STATS = [
  { value: '10 000+', label: 'Événements créés' },
  { value: '500 000+', label: 'Invités gérés' },
  { value: '98%', label: 'Satisfaction client' },
]

export default function StatsBar() {
  return (
    <section className="border-y border-border-soft/60 bg-panel/40">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-14 text-center sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-brand-gradient font-mono text-4xl font-bold">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
