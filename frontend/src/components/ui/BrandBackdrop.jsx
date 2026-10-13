import logoMark from '../../assets/logo-mark.png'

export default function BrandBackdrop({ side = 'right', className = '' }) {
  const isRight = side === 'right'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)] ${className}`}
    >
      {/* Aurore de marque : violet + magenta officiels */}
      <div
        className={`absolute -top-32 h-[520px] w-[720px] bg-[radial-gradient(closest-side,_rgba(108,75,244,0.24),_transparent)] blur-2xl ${
          isRight ? 'left-[8%]' : 'right-[8%]'
        }`}
      />
      <div
        className={`absolute top-10 h-[420px] w-[560px] bg-[radial-gradient(closest-side,_rgba(217,70,239,0.14),_transparent)] blur-2xl ${
          isRight ? 'right-[6%]' : 'left-[6%]'
        }`}
      />

      {/* Trame de points, texture discrète */}
      <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(248,249,252,0.14)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />

      {/* Logotype en filigrane */}
      <img
        src={logoMark}
        alt=""
        className={`absolute top-[-8%] h-[560px] w-[560px] opacity-[0.06] blur-[2px] sm:h-[640px] sm:w-[640px] ${
          isRight ? 'right-[-10%] rotate-[8deg]' : 'left-[-10%] -rotate-[8deg]'
        }`}
      />
    </div>
  )
}
