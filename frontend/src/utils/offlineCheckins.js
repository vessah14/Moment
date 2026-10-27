// Entrées scannées sans réseau (salles qui captent mal) : le QR est vérifié sur le
// téléphone avec la liste des invités déjà chargée, l'entrée est gardée ici puis envoyée
// au retour du réseau. Une file par événement, rangée dans le navigateur.
const key = (eventId) => `tbf_checkin_queue_${eventId}`

export function readQueue(eventId, storage = globalThis.localStorage) {
  try {
    const items = JSON.parse(storage?.getItem(key(eventId)) ?? '[]')
    return Array.isArray(items) ? items.filter((i) => i?.guestId && i?.at) : []
  } catch {
    return []
  }
}

function writeQueue(eventId, items, storage) {
  try {
    if (items.length) storage?.setItem(key(eventId), JSON.stringify(items))
    else storage?.removeItem(key(eventId))
  } catch {
    // Stockage indisponible : la file reste en mémoire pour cette page.
  }
  return items
}

export function enqueueCheckin(eventId, guestId, at = new Date().toISOString(), storage = globalThis.localStorage) {
  const items = readQueue(eventId, storage).filter((i) => i.guestId !== guestId)
  return writeQueue(eventId, [...items, { guestId, at }], storage)
}

export function dequeueCheckin(eventId, guestId, storage = globalThis.localStorage) {
  return writeQueue(eventId, readQueue(eventId, storage).filter((i) => i.guestId !== guestId), storage)
}

// Une erreur sans réponse du serveur (fetch rejeté) : réseau absent ou coupé.
export const isNetworkError = (err) => err?.name !== 'ApiError'

// Envoie la file dans l'ordre. Le serveur a répondu (même par un refus, ex. invité déjà
// pointé ailleurs) : l'entrée quitte la file. Réseau toujours absent : on s'arrête là.
export async function flushQueue(eventId, send, storage = globalThis.localStorage) {
  const sent = []
  for (const item of readQueue(eventId, storage)) {
    try {
      sent.push({ guestId: item.guestId, guest: await send(item.guestId) })
    } catch (err) {
      if (isNetworkError(err)) break
      sent.push({ guestId: item.guestId, guest: null })
    }
    dequeueCheckin(eventId, item.guestId, storage)
  }
  return sent
}

// Liste du serveur + entrées encore en attente sur ce téléphone.
export function withQueued(guests, queue) {
  const at = new Map(queue.map((i) => [i.guestId, i.at]))
  return guests.map((g) => (!g.checkedInAt && at.has(g.id) ? { ...g, checkedInAt: at.get(g.id), pendingSync: true } : g))
}
