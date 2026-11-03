import { useState } from 'react'

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
}

// Photo si elle se charge, sinon le repli (initiales) : une adresse refusée ou un fichier
// disparu ne laisse jamais un rond vide. La clé sur `src` réessaie après un changement.
export function PhotoOr({ src, alt = '', className = 'h-full w-full object-cover', children }) {
  const [failed, setFailed] = useState('')
  if (!src || failed === src) return children
  return <img key={src} src={src} alt={alt} className={className} onError={() => setFailed(src)} />
}

export default function Avatar({ name, size = 'sm', src }) {
  return (
    <PhotoOr src={src} alt={name} className={`shrink-0 rounded-full object-cover ${SIZES[size]}`}>
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-brand-purple/20 font-semibold text-brand-purple ${SIZES[size]}`}
      >
        {initials(name)}
      </span>
    </PhotoOr>
  )
}
