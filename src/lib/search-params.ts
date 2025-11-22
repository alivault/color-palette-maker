
type JsonLike =
  | null
  | boolean
  | number
  | string
  | JsonLike[]
  | { [key: string]: JsonLike }

const READABLE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\%5B/gi, '['],
  [/\%5D/gi, ']'],
  [/\%7B/gi, '{'],
  [/\%7D/gi, '}'],
  [/\%22/gi, ''], // Remove quotes
  [/\%3A/gi, ':'],
  [/\%2C/gi, ','],
]

const KEY_PRIORITY = new Map<string, number>([
  ['numTiles', 0],
  ['rainbowMode', 1],
  ['colors', 2],
])

const NUMERIC_KEY_REGEX = /^\d+$/

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

const normalize = (value: unknown): JsonLike | undefined => {
  if (value === undefined) return undefined

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Set) {
    const normalized = Array.from(value.values())
      .map((item) => normalize(item))
      .filter((item): item is JsonLike => item !== undefined)

    return normalized as JsonLike
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalize(item))
      .filter((item): item is JsonLike => item !== undefined) as JsonLike
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .map(([key, v]) => [key, normalize(v)] as const)
      .filter((entry): entry is [string, JsonLike] => entry[1] !== undefined)

    if (
      entries.length > 0 &&
      entries.every(([key]) => NUMERIC_KEY_REGEX.test(key))
    ) {
      const arrayResult: JsonLike[] = []
      entries
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([key, val]) => {
          arrayResult[Number(key)] = val
        })
      return arrayResult as JsonLike
    }

    return entries.reduce<Record<string, JsonLike>>((acc, [key, val]) => {
      acc[key] = val
      return acc
    }, {})
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return null
    }
    return value
  }

  if (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return value
  }

  return null
}

const encodeReadableComponent = (value: string) => {
  const encoded = encodeURIComponent(value)
  return READABLE_REPLACEMENTS.reduce((result, [pattern, replacement]) => {
    return result.replace(pattern, replacement)
  }, encoded)
}

const parseValue = (value: string): unknown => {
  if (value === '') return ''

  // Try parsing as standard JSON first
  try {
    return JSON.parse(value)
  } catch (error) {
    // Fallback to custom parsing
    const indexed = parseIndexedEntries(value)
    if (indexed) {
      return indexed
    }

    const structured = parseStructuredPayload(value)
    if (structured !== undefined) {
      return structured
    }

    // If it's just a string without quotes, return it
    return value
  }
}

const parseIndexedEntries = (value: string): JsonLike[] | undefined => {
  const segments = value.split('&').filter(Boolean)
  if (segments.length === 0) return undefined

  const results: JsonLike[] = []
  for (const segment of segments) {
    const separatorIndex = segment.indexOf('=')
    if (separatorIndex === -1) return undefined

    const key = segment.slice(0, separatorIndex)
    if (!NUMERIC_KEY_REGEX.test(key)) return undefined

    const payload = segment.slice(separatorIndex + 1)
    const parsed = parseStructuredPayload(payload)
    if (parsed !== undefined) {
      results[Number(key)] = parsed
    } else {
      return undefined
    }
  }

  if (results.length === 0) return undefined

  return results.filter((item): item is JsonLike => item !== undefined)
}

const parseStructuredPayload = (value: string): JsonLike | undefined => {
  try {
    const parsed = JSON.parse(value)
    const normalized = normalize(parsed)
    return normalized === undefined ? undefined : normalized
  } catch (error) {
    const loose = parseLooseStructure(value)
    if (loose !== undefined) {
      const normalizedLoose = normalize(loose)
      return normalizedLoose === undefined ? undefined : normalizedLoose
    }
    return undefined
  }
}

const parseLooseStructure = (value: string): unknown => {
  const trimmed = value.trim()
  if (!trimmed) return undefined

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return parseLooseObject(trimmed)
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return parseLooseArray(trimmed)
  }

  return undefined
}

const parseLooseObject = (
  value: string,
): Record<string, unknown> | undefined => {
  const inner = value.slice(1, -1).trim()
  if (!inner) return {}

  const entries = splitLooseEntries(inner)
  if (!entries) return undefined

  const result: Record<string, unknown> = {}
  for (const entry of entries) {
    const separatorIndex = entry.indexOf(':')
    if (separatorIndex === -1) return undefined

    const keyPart = entry.slice(0, separatorIndex).trim()
    const valuePart = entry.slice(separatorIndex + 1).trim()

    // Remove quotes if present, but handle unquoted keys too
    const key = keyPart.replace(/^"|"$/g, '')
    const parsedValue = parseLooseValue(valuePart)
    result[key] = parsedValue
  }

  return result
}

const parseLooseArray = (value: string): unknown[] | undefined => {
  const inner = value.slice(1, -1).trim()
  if (!inner) return []

  const entries = splitLooseEntries(inner)
  if (!entries) return undefined

  return entries.map((entry) => parseLooseValue(entry.trim()))
}

const splitLooseEntries = (value: string): string[] | undefined => {
  const entries: string[] = []
  let depth = 0
  let current = ''

  for (const char of value) {
    if (char === '{' || char === '[') {
      depth += 1
    } else if (char === '}' || char === ']') {
      depth -= 1
    }

    if (char === ',' && depth === 0) {
      entries.push(current)
      current = ''
      continue
    }

    current += char
  }

  if (depth !== 0) return undefined

  if (current) {
    entries.push(current)
  }

  return entries.map((entry) => entry.trim()).filter(Boolean)
}

const parseLooseValue = (value: string): unknown => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const nested = parseLooseObject(trimmed)
    return nested ?? trimmed
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const nested = parseLooseArray(trimmed)
    return nested ?? trimmed
  }

  // Handle quoted strings
  if (/^".*"$/.test(trimmed)) {
    return trimmed.slice(1, -1)
  }

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null

  // If it looks like a number, try to parse it.
  // Be careful with hex values that might look like numbers (though without # they might not)
  // But we want simple hex strings like "aabbcc" to be strings, not NaN.
  // Only parse as number if it strictly matches number format.
  if (/^-?\d*\.?\d+$/.test(trimmed)) {
      const numeric = Number(trimmed)
      if (!Number.isNaN(numeric)) {
        return numeric
      }
  }

  return trimmed
}

export const stringifySearchParams = (
  search: Record<string, unknown>,
): string => {
  if (!search) return ''

  const entries = Object.entries(search)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      return [key, normalize(value)] as const
    })
    .filter((entry): entry is [string, JsonLike] => entry[1] !== undefined)
    // Filter out default values: empty arrays for filters, 'and' for joinOperator
    .filter(([key, value]) => {
      if (key === 'filters' && Array.isArray(value) && value.length === 0) {
        return false
      }
      if (key === 'joinOperator' && value === 'and') {
        return false
      }
      return true
    })
    .sort(([a], [b]) => {
      const priorityA = KEY_PRIORITY.get(a)
      const priorityB = KEY_PRIORITY.get(b)
      if (priorityA !== undefined || priorityB !== undefined) {
        if (priorityA === undefined) return 1
        if (priorityB === undefined) return -1
        if (priorityA !== priorityB) return priorityA - priorityB
      }
      return a.localeCompare(b)
    })

  const queryString = entries
    .map(([key, value]) => {
      const encodedKey = encodeReadableComponent(key)
      // Custom stringification to remove quotes for array of strings
      let jsonString
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
         jsonString = `[${value.join(',')}]`
      } else {
         jsonString = JSON.stringify(value)
      }
      
      const encodedValue = encodeReadableComponent(jsonString)
      return `${encodedKey}=${encodedValue}`
    })
    .join('&')

  return queryString ? `?${queryString}` : ''
}

export const parseSearchParams = (
  searchString: string,
): Record<string, unknown> => {
  if (!searchString) return {}

  const trimmed = searchString.startsWith('?')
    ? searchString.slice(1)
    : searchString

  if (!trimmed) return {}

  const segments = trimmed.split('&').filter(Boolean)
  if (segments.length === 0) return {}

  const result = segments.reduce<Record<string, unknown>>((acc, segment) => {
    const separatorIndex = segment.indexOf('=')

    const rawKey =
      separatorIndex === -1 ? segment : segment.slice(0, separatorIndex)
    const rawValue =
      separatorIndex === -1 ? '' : segment.slice(separatorIndex + 1)

    const key = decodeURIComponent(rawKey)
    const valueString = decodeURIComponent(rawValue)
    const parsed = parseValue(valueString)

    if (key in acc) {
      const current = acc[key]
      if (Array.isArray(current)) {
        if (Array.isArray(parsed)) {
          acc[key] = [...current, ...parsed]
        } else {
          acc[key] = [...current, parsed]
        }
      } else if (Array.isArray(parsed)) {
        acc[key] = [current, ...parsed]
      } else {
        acc[key] = [current, parsed]
      }
    } else if (parsed !== undefined) {
      acc[key] = parsed
    }

    return acc
  }, {})

  return result
}
