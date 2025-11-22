import { useState, useEffect, useMemo } from 'react'
import {
  type ColorStop,
  type ColorSpace,
  hexToColorStop,
  colorsToUrlHex,
  generatePalette,
} from '@/lib/color-utils'
import { arraysEqual } from '@/lib/utils'

const defaultColors: ColorStop[] = [
  { id: '1', h: 268, s: 1, l: 0.44 },
  { id: '2', h: 0, s: 1, l: 0.67 },
]

const defaultColorsUrl = colorsToUrlHex(defaultColors)

interface UsePaletteProps {
  searchParams: {
    numTiles?: number
    colors?: string[]
    rainbowMode?: boolean
    colorSpace?: ColorSpace
  }
  navigate: (opts: any) => void
}

export function usePalette({ searchParams, navigate }: UsePaletteProps) {
  const numTiles = searchParams.numTiles ?? 12
  const takeLongWay = searchParams.rainbowMode ?? false
  const colorsHex = searchParams.colors ?? defaultColorsUrl
  const colorSpace = searchParams.colorSpace ?? 'oklch'

  const [colors, setColors] = useState<ColorStop[]>(() => {
    return colorsHex.map(hexToColorStop)
  })

  // Sync URL changes to local state
  useEffect(() => {
    const currentUrlHex = colorsToUrlHex(colors)
    const targetHex = searchParams.colors ?? defaultColorsUrl

    const isSame =
      targetHex.length === currentUrlHex.length &&
      targetHex.every((hex, i) => hex === currentUrlHex[i])

    if (!isSame) {
      setColors(targetHex.map(hexToColorStop))
    }
  }, [searchParams.colors])

  const handleSetNumTiles = (
    val: number | ((curr: number) => number),
    commit: boolean = true,
  ) => {
    const newValue = typeof val === 'function' ? val(numTiles) : val

    navigate({
      search: (prev: any) => ({
        ...prev,
        numTiles: newValue === 12 ? undefined : newValue,
      }),
      replace: !commit,
    })
  }

  const handleSetColors = (newColors: ColorStop[]) => {
    setColors(newColors)
    const newColorsHex = colorsToUrlHex(newColors)

    navigate({
      search: (prev: any) => {
        const isDefault = arraysEqual(newColorsHex, defaultColorsUrl)
        return { ...prev, colors: isDefault ? undefined : newColorsHex }
      },
      replace: false,
    })
  }

  const handleSetTakeLongWay = (val: boolean) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        rainbowMode: val === false ? undefined : val,
      }),
      replace: false,
    })
  }

  const handleSetColorSpace = (val: ColorSpace) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        colorSpace: val === 'oklch' ? undefined : val,
      }),
      replace: false,
    })
  }

  const hexColors = useMemo(
    () => generatePalette(colors, numTiles, takeLongWay, colorSpace),
    [colors, numTiles, takeLongWay, colorSpace],
  )
  const exportText = hexColors.join(', ')

  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)

  return {
    numTiles,
    colors,
    takeLongWay,
    colorSpace,
    selectedColorId,
    setSelectedColorId,
    setNumTiles: handleSetNumTiles,
    setColors: handleSetColors,
    setLocalColors: setColors,
    setTakeLongWay: handleSetTakeLongWay,
    setColorSpace: handleSetColorSpace,
    exportText,
  }
}
