import { describe, expect, it } from 'vitest'
import { parseVideoUrl } from './videoEmbed'

const embed = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'

describe('parseVideoUrl', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://m.youtube.com/live/dQw4w9WgXcQ?si=abc',
    'https://youtube.com/shorts/dQw4w9WgXcQ',
  ])('embeds YouTube link %s', (link) => {
    expect(parseVideoUrl(link)).toMatchObject({ kind: 'youtube', embedUrl: embed })
  })

  it('keeps other https links as a button', () => {
    expect(parseVideoUrl('https://www.facebook.com/famille.ngo/live')).toEqual({
      kind: 'link',
      url: 'https://www.facebook.com/famille.ngo/live',
    })
  })

  it('rejects empty, non-https and malformed links', () => {
    expect(parseVideoUrl('')).toBeNull()
    expect(parseVideoUrl('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(parseVideoUrl('javascript:alert(1)')).toBeNull()
    expect(parseVideoUrl('https://youtube.com/watch?v=bad')).toMatchObject({ kind: 'link' })
  })
})
