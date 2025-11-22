import { useState, useEffect, useMemo } from 'react'
import {
  type ColorStop,
  type ColorSpace,
  hexToColorStop,
  colorsToUrlHex,
  generatePalette,
} from '@/lib/color-utils'
import { arraysEqual } from '@/lib/utils'

const DARK_DEFAULTS = ['21002e', 'a43400']
const LIGHT_DEFAULTS = ['ab61ff', 'ffd7d7']

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(media.matches)
    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  // Wait for hydration/mount to avoid flash of wrong theme defaults
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const defaultColorsUrl = isDarkMode ? DARK_DEFAULTS : LIGHT_DEFAULTS

  const numTiles = searchParams.numTiles ?? 12
  const takeLongWay = searchParams.rainbowMode ?? false
  const colorSpace = searchParams.colorSpace ?? 'oklch'

  const [colors, setColors] = useState<ColorStop[]>(() => {
    // If we have explicit colors, render them immediately (SSR friendly if possible)
    if (searchParams.colors) return searchParams.colors.map(hexToColorStop)
    // If using defaults, start empty to prevent flash of wrong theme
    return []
  })

  // Sync URL changes to local state
  useEffect(() => {
    // If we're not mounted yet and using defaults, wait (though isMounted check below handles the return)
    // But we need to populate 'colors' once mounted and we know the theme.
    if (!searchParams.colors && !isMounted) return

    const currentUrlHex = colorsToUrlHex(colors)
    const targetHex = searchParams.colors ?? defaultColorsUrl

    const targetNormalized = colorsToUrlHex(targetHex.map(hexToColorStop))

    const isSame =
      targetNormalized.length === currentUrlHex.length &&
      targetNormalized.every((hex, i) => hex === currentUrlHex[i])

    if (!isSame) {
      setColors(targetHex.map(hexToColorStop))
    }
  }, [searchParams.colors, defaultColorsUrl, isMounted])

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
