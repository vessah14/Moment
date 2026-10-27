import { Link } from 'react-router-dom'
import { mediaUrl } from '../../api/client'
import { templateFromCustomFields } from '../../utils/templateTheme'
import TemplatePreview from '../templates/TemplatePreview'
import StatusBadge from '../ui/StatusBadge'

export default function EventCard ({
  name,
  status,
  category,
  date,
  location,
  progressLabel,
  confirmed,
  total,
  barColor,
  coverImageUrl,
  customFields,
  actions
}) {
  const template = templateFromCustomFields(customFields)
  const coverUrl = mediaUrl(coverImageUrl)

  return (
    <div className='overflow-hidden rounded-2xl border border-border-soft bg-surface'>
      <div
        className='relative aspect-video overflow-hidden bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]'
        aria-label={template ? `Aperçu du modèle ${template.name}` : `Aperçu de ${name}`}
        role='img'
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=''
            className='absolute inset-0 h-full w-full object-cover'
            loading='lazy'
          />
        ) : template ? (
          <TemplatePreview template={template} preview={template.preview} />
        ) : (
          <div
            className='absolute inset-0'
            style={template?.preview?.bg ? { backgroundColor: template.preview.bg } : undefined}
          />
        )}
        {template && coverUrl && (
          <span
            className='absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm'
            style={{
              backgroundColor: template.preview?.bg ?? '#12172a',
              color: template.preview?.ink ?? '#f8f9fc'
            }}
          >
            Modèle {template.name}
          </span>
        )}
        <span className='absolute top-3 left-3 z-10'>
          <StatusBadge status={status} />
        </span>
      </div>

      <div className='p-5'>
        <h3 className='font-semibold text-ink'>{name}</h3>
        <p className='mt-1 text-sm text-faint'>
          {[category, date, location].filter(Boolean).join(' · ')}
        </p>

        {progressLabel && (
          <div className='mt-4'>
            <div className='flex items-center justify-between text-xs text-faint'>
              <span>{progressLabel}</span>
              <span className='font-mono text-ink'>
                {total > 0 ? `${confirmed}/${total}` : 'Aucun invité'}
              </span>
            </div>
            <div className='mt-1.5 h-1 rounded-full bg-border-soft'>
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${total ? (confirmed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        <div
          className={`mt-5 gap-2 ${
            actions.length > 3 ? 'grid grid-cols-2' : 'flex'
          }`}
        >
          {actions.map(action =>
            action.to ? (
              <Link
                key={action.label}
                to={action.to}
                target={action.external ? '_blank' : undefined}
                rel={action.external ? 'noopener noreferrer' : undefined}
                className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium transition ${
                  action.highlight
                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                    : 'border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type='button'
                onClick={action.onClick}
                className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium transition ${
                  action.danger
                    ? 'border-danger/40 text-danger hover:bg-danger/10'
                    : action.highlight
                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                    : 'border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {action.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
