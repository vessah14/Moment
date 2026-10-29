import { findTemplate, resolveSiteStyle, siteRootStyle } from '../../utils/templateTheme'

export default function InvitationLoader({ invitation, eventName, displayTitle, logoSrc }) {
  const template = findTemplate(invitation?.template)
  const siteStyle = resolveSiteStyle({
    template,
    themeColor: invitation?.themeColor,
  })
  const guestFirstName = invitation?.guestFullName?.trim().split(/\s+/)[0]
  const name = invitation?.eventName || eventName
  const heroTitle = displayTitle?.trim()
  const showEventName =
    name &&
    heroTitle &&
    heroTitle.toLocaleLowerCase() !== name.toLocaleLowerCase()

  return (
    <main
      className='invitation-loader'
      role='status'
      aria-label={
        guestFirstName
          ? `Préparation de l’invitation de ${guestFirstName}`
          : 'Préparation de votre invitation'
      }
      style={siteRootStyle(template, siteStyle)}
    >
      <div className='invitation-loader-card'>
        <div className='invitation-loader-seal' aria-hidden='true'>
          {logoSrc ? (
            <img src={logoSrc} alt='' className='invitation-loader-logo' />
          ) : (
          <svg viewBox='0 0 48 48' fill='none'>
            <path
              d='M10 24c0-8 6-14 14-14s14 6 14 14-6 14-14 14-14-6-14-14Z'
              stroke='currentColor'
              strokeWidth='1.5'
            />
            <path
              d='m17 24 5 5 10-11'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
            />
          </svg>
          )}
        </div>
        <p className='invitation-loader-eyebrow'>Une invitation personnelle</p>
        <h1 className='invitation-loader-title'>
          {heroTitle || name || 'Votre invitation arrive'}
        </h1>
        {showEventName && <p className='invitation-loader-event'>{name}</p>}
        {guestFirstName && (
          <p className='invitation-loader-recipient'>Une invitation pour {guestFirstName}</p>
        )}
        <span className='invitation-loader-progress' aria-hidden='true' />
        <p className='invitation-loader-caption'>Nous préparons votre moment…</p>
      </div>
    </main>
  )
}
