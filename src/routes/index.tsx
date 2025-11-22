import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { Controls } from '@/components/Controls'
import { MobileControlsTrigger } from '@/components/MobileControlsTrigger'
import { Palette } from '@/components/Palette'
import { ExportDialog } from '@/components/ExportDialog'
import { usePalette } from '@/hooks/usePalette'
import type { ColorSpace } from '@/lib/color-utils'

type SearchParams = {
  numTiles?: number
  colors?: string[]
  rainbowMode?: boolean
  colorSpace?: ColorSpace
}

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      numTiles: search.numTiles ? Number(search.numTiles) : undefined,
      colors: Array.isArray(search.colors)
        ? (search.colors as string[])
        : undefined,
      rainbowMode: search.rainbowMode ? Boolean(search.rainbowMode) : undefined,
      colorSpace: search.colorSpace
        ? (search.colorSpace as ColorSpace)
        : undefined,
    }
  },
})

function App() {
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()

  const {
    numTiles,
    colors,
    takeLongWay,
    colorSpace,
    selectedColorId,
    setSelectedColorId,
    setNumTiles,
    setColors,
    setLocalColors,
    setTakeLongWay,
    setColorSpace,
    exportText,
  } = usePalette({ searchParams, navigate })

  return (
    <div className="flex h-full w-full flex-col">
      <Header action={<ExportDialog exportText={exportText} />} />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <MobileControlsTrigger
            numTiles={numTiles}
            onNumTilesChange={setNumTiles}
            colors={colors}
            setColors={setColors}
            onColorsChange={setLocalColors}
            selectedColorId={selectedColorId}
            setSelectedColorId={setSelectedColorId}
            takeLongWay={takeLongWay}
            setTakeLongWay={setTakeLongWay}
            colorSpace={colorSpace}
            setColorSpace={setColorSpace}
          />

          {/* Palette Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex h-full min-h-[400px] flex-col gap-1">
              <Palette
                numTiles={numTiles}
                colors={colors}
                takeLongWay={takeLongWay}
                colorSpace={colorSpace}
              />
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="border-border bg-card hidden h-full w-70 flex-col overflow-hidden border-l md:flex">
          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1">
              <Controls
                numTiles={numTiles}
                onNumTilesChange={setNumTiles}
                colors={colors}
                setColors={setColors}
                onColorsChange={setLocalColors}
                selectedColorId={selectedColorId}
                setSelectedColorId={setSelectedColorId}
                takeLongWay={takeLongWay}
                setTakeLongWay={setTakeLongWay}
                colorSpace={colorSpace}
                setColorSpace={setColorSpace}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
