export default function BrandLoader ({ text }) {
  return (
    <div className='brand-loader' role='status' aria-label='Chargement de TBF Moment'>
      <div className='brand-loader-content'>
        <svg
          className='brand-loader-mark'
          viewBox='0 0 100 100'
          aria-hidden='true'
        >
          <defs>
            <linearGradient id='brand-loader-gradient' x1='15%' y1='100%' x2='85%' y2='0%'>
              <stop offset='0%' stopColor='#ff7a3d' />
              <stop offset='52%' stopColor='#ec4ec2' />
              <stop offset='100%' stopColor='#6c4bf4' />
            </linearGradient>
          </defs>
          <path
            className='brand-loader-mark-base'
            d='M20 80V24L50 53L80 24V80'
          />
          <path
            className='brand-loader-mark-draw'
            d='M20 80V24L50 53L80 24V80'
          />
          <circle className='brand-loader-dot' cx='80' cy='15' r='7' />
        </svg>
        <p className='brand-loader-wordmark'>TBF MOMENT</p>
        {text && <p className='brand-loader-message'>{text}</p>}
      </div>
    </div>
  )
}
