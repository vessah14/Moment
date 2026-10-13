import { useSeo } from '../utils/seo'

export default function LoadingPage ({ text = 'Chargement de votre espace…' }) {
  useSeo({ title: 'Chargement', noindex: true })
  return (
    <div className='flex min-h-svh items-center justify-center bg-bg px-6'>
      <div className='w-full max-w-md rounded-[28px] border border-border-soft bg-surface/90 px-6 py-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm'>
        <div className='mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-brand-purple/25 border-t-brand-purple' />

        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-faint'>
          TBF Moment
        </p>
        <h1 className='mt-3 text-2xl font-bold text-ink'>
          Préparation du moment
        </h1>
        <p className='mt-2 text-sm leading-relaxed text-muted'>{text}</p>
      </div>
    </div>
  )
}
