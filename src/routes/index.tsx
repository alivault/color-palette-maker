import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useMotionValue } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings2, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/Header'
import { Controls } from '@/components/Controls'
import { Palette } from '@/components/Palette'
import { type ColorStop, generatePalette, hexToColorStop, colorsToUrlHex } from '@/lib/color-utils'

type SearchParams = {
  numTiles?: number
  colors?: string[]
  rainbowMode?: boolean
}

const defaultColors: ColorStop[] = [
  { id: '1', h: 268, s: 1, l: 0.44 },
  { id: '2', h: 0, s: 1, l: 0.67 },
]

const defaultColorsUrl = colorsToUrlHex(defaultColors)

// Helper to check if arrays are equal
function arraysEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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
  const { numTiles: urlNumTiles, colors: urlColors, rainbowMode: urlRainbowMode } = Route.useSearch()

  // Use default values if URL params are missing
  const numTiles = urlNumTiles ?? 12
  const takeLongWay = urlRainbowMode ?? false
  const colorsHex = urlColors ?? defaultColorsUrl

  const numTilesMV = useMotionValue(numTiles)
  
  // We maintain local state for colors to preserve HSL precision and stable IDs during interaction.
  // The URL is the source of truth for deep linking, but during a session, local state takes precedence
  // for smooth updates, syncing to URL.
  const [colors, setColors] = useState<ColorStop[]>(() => {
    return colorsHex.map(hexToColorStop)
  })

  // Sync URL changes to local state (e.g. Back/Forward button)
  useEffect(() => {
    const currentUrlHex = colorsToUrlHex(colors)
    const targetHex = urlColors ?? defaultColorsUrl
    
    const isSame = targetHex.length === currentUrlHex.length && 
      targetHex.every((hex, i) => hex === currentUrlHex[i])
    
    if (!isSame) {
      setColors(targetHex.map(hexToColorStop))
    }
  }, [urlColors])

  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)

  useEffect(() => {
    numTilesMV.set(numTiles)
  }, [numTiles, numTilesMV])

  const hexColors = useMemo(() => generatePalette(colors, numTiles, takeLongWay), [colors, numTiles, takeLongWay])
  const exportText = hexColors.join(', ')

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportText)
    toast.success("Copied palette to clipboard")
  }

  const handleSetNumTiles = (val: number | ((curr: number) => number)) => {
    const newValue = typeof val === 'function' ? val(numTiles) : val
    
    navigate({
      search: (prev) => {
        const next = { ...prev, numTiles: newValue === 12 ? undefined : newValue }
        return next
      },
      replace: true, // Don't push to history for slider changes
    })
  }

  const handleSetColors = (newColors: ColorStop[]) => {
    setColors(newColors)
    
    // Sync to URL using stripped hex
    const newColorsHex = colorsToUrlHex(newColors)
    
    navigate({
      search: (prev) => {
         const isDefault = arraysEqual(newColorsHex, defaultColorsUrl)
         return { ...prev, colors: isDefault ? undefined : newColorsHex }
      },
      replace: false, // Push to history
    })
  }

  const handleSetTakeLongWay = (val: boolean) => {
    navigate({
      search: (prev) => ({ ...prev, rainbowMode: val === false ? undefined : val }),
      replace: false, // Push to history
    })
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header action={
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Download className="size-4" />
              Export
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Palette</DialogTitle>
              <DialogDescription>
                Copy your palette as a comma-separated list of hex codes.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Input
                value={exportText}
                readOnly
                className="font-mono text-sm"
              />
              <Button size="icon" onClick={handleCopyExport} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <div className="flex flex-col md:flex-row flex-1 min-h-0">
         <div className="flex-1 flex flex-col h-full min-h-0">
           
           {/* Mobile Trigger */}
           <div className="md:hidden fixed bottom-4 right-4 z-50">
             <Sheet>
               <SheetTrigger asChild>
                 <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                   <Settings2 className="h-6 w-6" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="w-[300px] sm:w-[340px] flex flex-col h-full">
                 <SheetHeader className="flex-none"><SheetTitle>Controls</SheetTitle><SheetDescription>Adjust settings.</SheetDescription></SheetHeader>
                 <div className="flex-1 min-h-0 mt-6 pb-8">
                    <Controls 
                      numTiles={numTiles} 
                      onNumTilesChange={handleSetNumTiles}
                      colors={colors}
                      setColors={handleSetColors}
                      selectedColorId={selectedColorId}
                      setSelectedColorId={setSelectedColorId}
                      takeLongWay={takeLongWay}
                      setTakeLongWay={handleSetTakeLongWay}
                    />
                 </div>
               </SheetContent>
             </Sheet>
           </div>

           {/* Palette Grid */}
           <div className="flex-1 overflow-y-auto p-5">
             <div className="flex flex-col gap-1 h-full min-h-[400px]">
               <Palette 
                 numTiles={numTiles}
                 colors={colors}
                 takeLongWay={takeLongWay}
               />
             </div>
           </div>
         </div>

         {/* Desktop Sidebar */}
         <aside className="hidden md:flex flex-col w-70 border-l border-border bg-card h-full overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <Controls 
                numTiles={numTiles} 
                onNumTilesChange={handleSetNumTiles}
                colors={colors}
                setColors={handleSetColors}
                selectedColorId={selectedColorId}
                setSelectedColorId={setSelectedColorId}
                takeLongWay={takeLongWay}
                setTakeLongWay={handleSetTakeLongWay}
              />
            </div>
          </div>
         </aside>
      </div>
    </div>
  )
}
