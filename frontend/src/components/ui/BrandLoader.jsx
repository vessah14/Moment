export default function BrandLoader() {
  return (
    <div className='brand-loader' role='status' aria-label='Chargement de TBF Moment'>
      <div className='brand-loader-content'>
        <svg
          className='brand-loader-mark'
          viewBox='0 0 32 32'
          aria-hidden='true'
        >
          <defs>
            <linearGradient id='brand-loader-gradient' x1='0' x2='1' y1='1' y2='0'>
              <stop offset='0' stopColor='#FF7A3D' />
              <stop offset='.5' stopColor='#E2337E' />
              <stop offset='1' stopColor='#6C4BF4' />
            </linearGradient>
          </defs>
          <path
            className='brand-loader-mark-draw'
            pathLength='1'
            d='M4 27V6l12 12L28 6v21'
          />
          <circle className='brand-loader-dot' cx='27' cy='4' r='2.4' />
        </svg>
        <b className='brand-loader-wordmark'>TBF MOMENT</b>
      </div>
    </div>
  )
}
