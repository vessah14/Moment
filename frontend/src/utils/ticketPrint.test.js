import { afterEach, describe, expect, it, vi } from 'vitest'
import { deliverTicketImage } from './ticketPrint'

const options = {
  title: 'Concert',
  guestName: 'Ada',
  prefix: 'billet',
  palette: { vars: {} },
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ticketImage', () => {
  it('shares the ticket as a PNG file when the phone supports file sharing', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('File', class MockFile {
      constructor(parts, name, { type }) {
        this.parts = parts
        this.name = name
        this.type = type
      }
    })
    vi.stubGlobal('navigator', {
      canShare: vi.fn(data => data.files?.[0]?.type === 'image/png'),
      share,
    })

    const result = await deliverTicketImage(new Blob(['ticket']), options)

    expect(result).toBe('shared')
    expect(share).toHaveBeenCalledOnce()
    expect(share.mock.calls[0][0].files[0].name).toBe('billet-concert-ada.png')
  })

  it('does not download another copy when the visitor cancels sharing', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('Cancelled'), { name: 'AbortError' }))
    vi.stubGlobal('File', class MockFile {
      constructor(parts, name, { type }) {
        this.name = name
        this.type = type
      }
    })
    vi.stubGlobal('navigator', { canShare: () => true, share })

    const result = await deliverTicketImage(new Blob(['ticket']), options)

    expect(result).toBe('cancelled')
  })

  it('downloads the PNG using a Blob URL when file sharing is unavailable', async () => {
    const click = vi.fn()
    const remove = vi.fn()
    const createObjectURL = vi.fn(() => 'blob:ticket')
    const revokeObjectURL = vi.fn()
    const anchor = { style: {}, click, remove }
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.stubGlobal('navigator', { canShare: () => false })
    vi.stubGlobal('window', { setTimeout: callback => callback() })
    vi.stubGlobal('document', {
      createElement: () => anchor,
      body: { appendChild: vi.fn() },
    })

    const result = await deliverTicketImage(new Blob(['ticket']), options)

    expect(result).toBe('downloaded')
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(anchor.href).toBe('blob:ticket')
    expect(anchor.download).toBe('billet-concert-ada.png')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:ticket')
  })

  it('falls back to a Blob download when checking file sharing throws', async () => {
    const click = vi.fn()
    const createObjectURL = vi.fn(() => 'blob:ticket')
    vi.stubGlobal('File', class MockFile {
      constructor(parts, name, { type }) {
        this.name = name
        this.type = type
      }
    })
    vi.stubGlobal('navigator', {
      canShare: () => { throw new Error('Unsupported file sharing') },
      share: vi.fn(),
    })
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
    vi.stubGlobal('window', { setTimeout: vi.fn() })
    vi.stubGlobal('document', {
      createElement: () => ({ style: {}, click, remove: vi.fn() }),
      body: { appendChild: vi.fn() },
    })

    const result = await deliverTicketImage(new Blob(['ticket']), options)

    expect(result).toBe('downloaded')
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
  })
})
