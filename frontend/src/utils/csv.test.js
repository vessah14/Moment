import { describe, expect, it } from 'vitest'
import { csvCell, toCsv } from './csv'

describe('csv', () => {
  it('neutralise les formules mais garde les numéros de téléphone', () => {
    expect(csvCell('=HYPERLINK("http://x","clic")')).toBe('"\'=HYPERLINK(""http://x"",""clic"")"')
    expect(csvCell('@SUM(A1)')).toBe('"\'@SUM(A1)"')
    expect(csvCell('-2+3')).toBe('"\'-2+3"')
    expect(csvCell('+237 699 00 00 00')).toBe('"+237 699 00 00 00"')
  })

  it('met tout entre guillemets, avec BOM et lignes Windows', () => {
    expect(toCsv(['Nom', 'Note'], [['Awa, Paul', 'ok']])).toBe('﻿"Nom","Note"\r\n"Awa, Paul","ok"')
  })
})
