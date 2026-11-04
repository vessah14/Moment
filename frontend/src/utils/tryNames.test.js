import { describe, expect, it } from 'vitest'
import { normalizeNames, tryDemo, tryUrl } from './tryNames'

describe('essai avec ses prénoms', () => {
  it('écrit les deux prénoms avec une esperluette', () => {
    expect(normalizeNames('  Inès   et Kevin ')).toBe('Inès & Kevin')
    expect(normalizeNames('Awa&Ibrahim')).toBe('Awa & Ibrahim')
    expect(normalizeNames('x'.repeat(80))).toHaveLength(40)
  })

  it('ouvre le modèle du type choisi, avec un exemple si rien n’est saisi', () => {
    expect(tryUrl('mariage', 'Inès et Kevin')).toBe('/modeles/bloom?essai=In%C3%A8s%20%26%20Kevin')
    expect(tryUrl('anniversaire', '')).toBe('/modeles/fiesta?essai=Brenda')
    expect(tryUrl('inconnu', 'A')).toBe('/modeles/bloom?essai=A')
  })

  it('remplace les textes de la démo', () => {
    expect(tryDemo('bloom', 'Inès & Kevin')).toMatchObject({ title: 'Inès & Kevin', description: 'Inès et Kevin vous invitent à célébrer leur union.' })
    expect(tryDemo('fiesta', 'Brenda').title).toBe("L'anniversaire de Brenda")
    expect(tryDemo('horizon', 'Sawa Énergie').kicker).toBe('Soirée de gala')
    expect(tryDemo('noor', 'A')).toBeNull()
    expect(tryDemo('bloom', null)).toBeNull()
  })
})
