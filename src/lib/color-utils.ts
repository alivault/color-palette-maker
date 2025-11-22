import Color from 'colorjs.io'
import { v4 as uuidv4 } from 'uuid'

export const wrapHue = (h: number) => ((h % 360) + 360) % 360

export const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(val, max))

export const getHueGradient = () =>
  `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`

export const getSatGradient = (hue: number) =>
  `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`

export const getLightGradient = (hue: number, sat: number) =>
  `linear-gradient(to right, hsl(${hue}, ${sat * 100}%, 0%), hsl(${hue}, ${sat * 100}%, 50%), hsl(${hue}, ${
    sat * 100
  }%, 100%))`

export type ColorStop = {
  id: string
  h: number
  s: number
  l: number
}

export const hexToColorStop = (hex: string): ColorStop => {
  try {
    // Add hash if missing
    const hexWithHash = hex.startsWith('#') ? hex : `#${hex}`
    const c = new Color(hexWithHash)
    const hsl = c.to('hsl')
    return {
      id: uuidv4(),
      h: hsl.coords[0] || 0, // Handle NaN for achromatic colors
      s: (hsl.coords[1] || 0) / 100,
      l: (hsl.coords[2] || 0) / 100,
    }
  } catch (e) {
    console.error(`Failed to parse color: ${hex}`, e)
    // Fallback
    return { id: uuidv4(), h: 0, s: 0, l: 0 }
  }
}

// This function is used for URL generation - strip the hash
export const colorsToUrlHex = (colors: ColorStop[]): string[] => {
  return colors.map((c) =>
    new Color('hsl', [c.h, c.s * 100, c.l * 100])
      .to('srgb')
      .toString({ format: 'hex' })
      .replace('#', ''),
  )
}

// This function is used for displaying full hex codes (e.g. in the export dialog)
export const colorsToFullHex = (colors: ColorStop[]): string[] => {
  return colors.map((c) =>
    new Color('hsl', [c.h, c.s * 100, c.l * 100])
      .to('srgb')
      .toString({ format: 'hex' }),
  )
}

export function generatePalette(
  colors: ColorStop[],
  numTiles: number,
  takeLongWay: boolean,
): string[] {
  if (colors.length === 0) return []
  if (colors.length === 1) {
    const c = new Color('hsl', [
      colors[0].h,
      colors[0].s * 100,
      colors[0].l * 100,
    ])
      .to('srgb')
      .toString({ format: 'hex' })
    return Array(numTiles).fill(c)
  }

  // Create color objects
  const colorObjects = colors.map(
    (c) => new Color('hsl', [c.h, c.s * 100, c.l * 100]),
  )

  const stops = colors.length
  const result: string[] = []

  for (let i = 0; i < numTiles; i++) {
    const t = numTiles <= 1 ? 0 : i / (numTiles - 1)

    // Map t to segment
    // overall progress t maps to segment index
    const segmentPos = t * (stops - 1)
    const segmentIndex = Math.min(Math.floor(segmentPos), stops - 2)
    const segmentT = segmentPos - segmentIndex

    const c1 = colorObjects[segmentIndex]
    const c2 = colorObjects[segmentIndex + 1]

    // Interpolate in OKLCH
    const mixed = c1.mix(c2, segmentT, {
      space: 'oklch',
      hue: takeLongWay ? 'longer' : 'shorter',
    })
    result.push(mixed.to('srgb').toString({ format: 'hex' }))
  }

  return result
}
