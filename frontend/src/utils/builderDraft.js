// Brouillon local du Builder : chaque modification est gardée sur l'appareil, pour la
// retrouver après un appel, un onglet fermé ou une coupure. Le site en ligne, lui, ne
// change qu'au clic sur « Enregistrer » (pas d'envoi automatique de pages à moitié faites).
const key = (eventId) => `tbf_builder_draft_${eventId}`

// JSON à clés triées : deux états identiques donnent toujours le même texte.
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(value ?? null)
}

export function builderSnapshot({ heroStyle, pageBlocks, blockContent, customFields }) {
  return stableStringify({ heroStyle, pageBlocks, blockContent, customFields: customFields ?? null })
}

export function readBuilderDraft(eventId, storage = globalThis.localStorage) {
  try {
    const draft = JSON.parse(storage?.getItem(key(eventId)) ?? 'null')
    return draft?.snapshot && draft?.savedAt ? draft : null
  } catch {
    return null
  }
}

export function writeBuilderDraft(eventId, snapshot, storage = globalThis.localStorage) {
  try {
    storage?.setItem(key(eventId), JSON.stringify({ snapshot, savedAt: new Date().toISOString() }))
  } catch {
    // Stockage plein ou indisponible : l'alerte en quittant la page reste le filet.
  }
}

export function clearBuilderDraft(eventId, storage = globalThis.localStorage) {
  try {
    storage?.removeItem(key(eventId))
  } catch {
    // rien à nettoyer
  }
}
