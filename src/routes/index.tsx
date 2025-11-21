import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMotionValue } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Settings2 } from 'lucide-react'
import { Controls } from '@/components/Controls'
import { Palette } from '@/components/Palette'
import { type ColorStop } from '@/lib/color-utils'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [numTiles, setNumTiles] = useState(12)
  const numTilesMV = useMotionValue(numTiles)

  const [colors, setColors] = useState<ColorStop[]>([
    { id: '1', h: 268, s: 1, l: 0.44 },
    { id: '2', h: 0, s: 1, l: 0.67 },
  ])

  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [takeLongWay, setTakeLongWay] = useState(false)

  useEffect(() => {
    numTilesMV.set(numTiles)
  }, [numTiles, numTilesMV])

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
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
                    onNumTilesChange={setNumTiles}
                    colors={colors}
                    setColors={setColors}
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
              onNumTilesChange={setNumTiles}
              colors={colors}
              setColors={setColors}
              selectedColorId={selectedColorId}
              setSelectedColorId={setSelectedColorId}
              takeLongWay={takeLongWay}
              setTakeLongWay={setTakeLongWay}
            />
          </div>
        </div>
       </aside>
    </div>
  )
}
