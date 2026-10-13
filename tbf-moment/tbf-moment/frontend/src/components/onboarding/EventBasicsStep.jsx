const GUEST_RANGES = ['Moins de 50', '50 à 150', '150 à 300', 'Plus de 300']

export default function EventBasicsStep({ values, onChange }) {
  const update = (patch) => onChange({ ...values, ...patch })

  return (
    <div>
      <h2 className="text-center text-2xl font-bold text-ink">
        Parlez-nous de votre événement
      </h2>
      <p className="mt-2 text-center text-sm text-muted">
        Ces informations préconfigurent votre premier événement — vous
        pourrez tout modifier plus tard.
      </p>

      <div className="mx-auto mt-8 max-w-sm space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-ink">
            Nom de l'événement
          </span>
          <input
            type="text"
            value={values.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Ex: Mariage de Awa & Ibrahim"
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Date approximative (optionnel)
          </span>
          <input
            type="date"
            value={values.date}
            onChange={(e) => update({ date: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-ink">
            Nombre d'invités estimé
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {GUEST_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => update({ guestRange: range })}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  values.guestRange === range
                    ? 'border-brand-purple bg-brand-purple/10 text-ink'
                    : 'border-border-soft text-muted hover:border-faint'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
