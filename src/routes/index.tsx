import { createFileRoute } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import { Header } from '@/components/Header'
import { Controls } from '@/components/Controls'
import { Palette } from '@/components/Palette'
import { ExportDialog } from '@/components/ExportDialog'
import { usePalette } from '@/hooks/usePalette'

type SearchParams = {
  numTiles?: number
  colors?: string[]
  rainbowMode?: boolean
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
    selectedColorId,
    setSelectedColorId,
    setNumTiles,
    setColors,
    setLocalColors,
    setTakeLongWay,
    exportText,
  } = usePalette({ searchParams, navigate })

  return (
    <div className="flex h-full w-full flex-col">
      <Header action={<ExportDialog exportText={exportText} />} />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="flex h-full min-h-0 flex-1 flex-col">
          {/* Mobile Trigger */}
          <div className="fixed right-4 bottom-4 z-50 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                >
                  <Settings2 className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex h-full w-[300px] flex-col sm:w-[340px]"
              >
                <SheetHeader className="flex-none">
                  <SheetTitle>Controls</SheetTitle>
                  <SheetDescription>Adjust settings.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 min-h-0 flex-1 pb-8">
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
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Palette Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex h-full min-h-[400px] flex-col gap-1">
              <Palette
                numTiles={numTiles}
                colors={colors}
                takeLongWay={takeLongWay}
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
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
