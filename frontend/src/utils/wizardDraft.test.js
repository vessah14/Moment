import { describe, expect, it } from 'vitest'
import { clearWizardDraft, readWizardDraft, writeWizardDraft } from './wizardDraft'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

const form = { univers: 'prives', type: 'mariage', display: 'Awa & Ibrahim', name: 'Mariage · Awa & Ibrahim', logo: { file: {}, dataUrl: 'data:…' } }

describe('brouillon de l’assistant de création', () => {
  it('garde la saisie sans le fichier du logo, et la rend', () => {
    const storage = memoryStorage()
    writeWizardDraft('u1', { form, pageContent: { Histoire: { body: 'Il était une fois' } }, step: 3, templatePicked: true }, storage)
    const draft = readWizardDraft('u1', storage)
    expect(draft.form).toEqual({ univers: 'prives', type: 'mariage', display: 'Awa & Ibrahim', name: 'Mariage · Awa & Ibrahim' })
    expect(draft).toMatchObject({ hadLogo: true, step: 3, templatePicked: true, pageContent: { Histoire: { body: 'Il était une fois' } } })
  })

  it('ne garde rien tant qu’aucun univers n’est choisi, et sépare les comptes', () => {
    const storage = memoryStorage()
    writeWizardDraft('u1', { form: { univers: null }, pageContent: {}, step: 0 }, storage)
    expect(readWizardDraft('u1', storage)).toBeNull()
    writeWizardDraft('u1', { form, pageContent: {}, step: 1 }, storage)
    expect(readWizardDraft('u2', storage)).toBeNull()
  })

  it('oublie un brouillon effacé ou trop ancien', () => {
    const storage = memoryStorage()
    writeWizardDraft('u1', { form, pageContent: {}, step: 1 }, storage)
    expect(readWizardDraft('u1', storage, Date.now() + 15 * 24 * 3600 * 1000)).toBeNull()
    writeWizardDraft('u1', { form, pageContent: {}, step: 1 }, storage)
    clearWizardDraft('u1', storage)
    expect(readWizardDraft('u1', storage)).toBeNull()
  })
})
