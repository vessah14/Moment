// Lien vidéo ou direct collé par l'organisateur (bloc « Vidéo ») : une vidéo YouTube
// s'affiche dans la page (domaine youtube-nocookie, sans traceur avant lecture) ; tout autre
// lien https (Facebook Live, Zoom, TikTok…) devient un bouton.
const YOUTUBE_ID = /^[\w-]{11}$/

export function parseVideoUrl(raw) {
  let url
  try {
    url = new URL(String(raw ?? '').trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null

  const host = url.hostname.replace(/^(www\.|m\.)/, '')
  let id = null
  if (host === 'youtu.be') id = url.pathname.slice(1)
  else if (host === 'youtube.com') {
    const [, kind, value] = url.pathname.split('/')
    id = kind === 'watch' ? url.searchParams.get('v') : ['live', 'shorts', 'embed'].includes(kind) ? value : null
  }
  if (id && YOUTUBE_ID.test(id)) {
    return { kind: 'youtube', url: url.toString(), embedUrl: `https://www.youtube-nocookie.com/embed/${id}` }
  }
  return { kind: 'link', url: url.toString() }
}
