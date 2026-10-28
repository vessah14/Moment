const DOUALA_TIME_ZONE = 'Africa/Douala'

function zonedParts(date, timeZone) {
  const values = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(date)
    .reduce((parts, part) => {
      if (part.type !== 'literal') parts[part.type] = Number(part.value)
      return parts
    }, {})
  return values
}

function zoneOffsetAt(date, timeZone) {
  const parts = zonedParts(date, timeZone)
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return localAsUtc - date.getTime()
}

export function parseDateTimeInTimeZone(value, timeZone = DOUALA_TIME_ZONE) {
  if (!value) return null
  const text = String(value)
  const wallTime = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (!wallTime) return new Date(text)

  const [, year, month, day, hour = '0', minute = '0', second = '0'] = wallTime
  const expectedLocalAsUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
  let guess = expectedLocalAsUtc
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = zonedParts(new Date(guess), timeZone)
    const actualLocalAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second)
    guess += expectedLocalAsUtc - actualLocalAsUtc
  }
  return new Date(guess)
}

export function timeZoneYear(date, timeZone = DOUALA_TIME_ZONE) {
  return zonedParts(date, timeZone).year
}

export function nextMidnightInTimeZone(date, timeZone = DOUALA_TIME_ZONE) {
  const parts = zonedParts(date, timeZone)
  const nextWallMidnight = Date.UTC(parts.year, parts.month - 1, parts.day + 1)
  const guess = new Date(nextWallMidnight)
  return new Date(nextWallMidnight - zoneOffsetAt(guess, timeZone))
}

export function isNewYearMidnight(date, timeZone = DOUALA_TIME_ZONE) {
  const parts = zonedParts(date, timeZone)
  return parts.month === 1 && parts.day === 1 && parts.hour === 0 && parts.minute === 0 && parts.second === 0
}

export function isSameDayInTimeZone(target, now = new Date(), timeZone = DOUALA_TIME_ZONE) {
  const targetParts = zonedParts(new Date(target), timeZone)
  const nowParts = zonedParts(new Date(now), timeZone)
  return targetParts.year === nowParts.year && targetParts.month === nowParts.month && targetParts.day === nowParts.day
}

export function minuitCountdownTarget(eventStart, mode) {
  if (!eventStart) return null
  if (mode === 'debut' || mode === 'start') return eventStart
  const parts = zonedParts(eventStart, DOUALA_TIME_ZONE)
  return parts.month === 12 && parts.day === 31
    ? nextMidnightInTimeZone(eventStart, DOUALA_TIME_ZONE)
    : eventStart
}
