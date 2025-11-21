import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMotionValue } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Settings2 } from 'lucide-react'
import { Controls, type ControlsProps } from '@/components/Controls'
import { Palette } from '@/components/Palette'
import { wrapHue, clamp } from '@/lib/color-utils'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  // --- React State (for UI controls & structure) ---
  const [numTiles, setNumTiles] = useState(12)
  
  const [startHue, setStartHue] = useState(31)
  const [endHue, setEndHue] = useState(243)
  const [hueShift, setHueShift] = useState(180)
  
  const [startSat, setStartSat] = useState(1)
  const [endSat, setEndSat] = useState(1)
  const [satShift, setSatShift] = useState(1)
  
  const [startLight, setStartLight] = useState(0.8)
  const [endLight, setEndLight] = useState(0.4)
  const [lightShift, setLightShift] = useState(0.5)

  const [prevHueShift, setPrevHueShift] = useState(180)
  const [prevSatShift, setPrevSatShift] = useState(1)
  const [prevLightShift, setPrevLightShift] = useState(0.5)

  // --- Motion Values (for high-freq updates) ---
  const numTilesMV = useMotionValue(numTiles)
  const startHueMV = useMotionValue(startHue)
  const endHueMV = useMotionValue(endHue)
  const startSatMV = useMotionValue(startSat)
  const endSatMV = useMotionValue(endSat)
  const startLightMV = useMotionValue(startLight)
  const endLightMV = useMotionValue(endLight)

  // Keep numTilesMV in sync (since it affects array length, it's less freq but needed for transform)
  useEffect(() => { numTilesMV.set(numTiles) }, [numTiles, numTilesMV])

  // --- Handlers ---
  // We update both React state (for sliders/UI) and MotionValues (for palette)
  
  const updateStartHue = (v: number) => { setStartHue(v); startHueMV.set(v); }
  const updateEndHue = (v: number) => { setEndHue(v); endHueMV.set(v); }
  
  const updateStartSat = (v: number) => { setStartSat(v); startSatMV.set(v); }
  const updateEndSat = (v: number) => { setEndSat(v); endSatMV.set(v); }
  
  const updateStartLight = (v: number) => { setStartLight(v); startLightMV.set(v); }
  const updateEndLight = (v: number) => { setEndLight(v); endLightMV.set(v); }

  const handleHueShift = (val: number[]) => {
    const newVal = val[0]
    const delta = newVal - prevHueShift
    
    const nextStart = wrapHue(startHue + delta)
    const nextEnd = wrapHue(endHue + delta)
    
    setStartHue(nextStart); startHueMV.set(nextStart)
    setEndHue(nextEnd); endHueMV.set(nextEnd)
    
    setHueShift(newVal)
    setPrevHueShift(newVal)
  }

  const handleSatShift = (val: number[]) => {
    const newVal = val[0]
    const delta = newVal - prevSatShift
    
    const nextStart = clamp(startSat + delta, 0, 1)
    const nextEnd = clamp(endSat + delta, 0, 1)
    
    setStartSat(nextStart); startSatMV.set(nextStart)
    setEndSat(nextEnd); endSatMV.set(nextEnd)
    
    setSatShift(newVal)
    setPrevSatShift(newVal)
  }

  const handleLightShift = (val: number[]) => {
    const newVal = val[0]
    const delta = newVal - prevLightShift
    
    const nextStart = clamp(startLight + delta, 0, 1)
    const nextEnd = clamp(endLight + delta, 0, 1)
    
    setStartLight(nextStart); startLightMV.set(nextStart)
    setEndLight(nextEnd); endLightMV.set(nextEnd)
    
    setLightShift(newVal)
    setPrevLightShift(newVal)
  }

  const controlsProps: ControlsProps = {
    numTiles,
    onNumTilesChange: (value) => setNumTiles(value),
    startHue,
    endHue,
    hueShift,
    onStartHueChange: updateStartHue,
    onEndHueChange: updateEndHue,
    onHueShiftChange: handleHueShift,
    startSat,
    endSat,
    satShift,
    onStartSatChange: updateStartSat,
    onEndSatChange: updateEndSat,
    onSatShiftChange: handleSatShift,
    startLight,
    endLight,
    lightShift,
    onStartLightChange: updateStartLight,
    onEndLightChange: updateEndLight,
    onLightShiftChange: handleLightShift,
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground">
       <div className="flex-1 flex flex-col h-full min-h-0">
         <div className="p-6 md:p-10 flex flex-col gap-4 shrink-0">
           <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Color Palette Maker</h1>
           <p className="text-muted-foreground max-w-prose">
             A unique and intuitive tool for crafting harmonious color palettes. Uses OKLCH and framer-motion for smooth performance.
           </p>
         </div>

         {/* Mobile Trigger */}
         <div className="md:hidden fixed bottom-4 right-4 z-50">
           <Sheet>
             <SheetTrigger asChild>
               <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                 <Settings2 className="h-6 w-6" />
               </Button>
             </SheetTrigger>
             <SheetContent side="right" className="w-[300px] sm:w-[340px] overflow-y-auto">
               <SheetHeader><SheetTitle>Controls</SheetTitle><SheetDescription>Adjust settings.</SheetDescription></SheetHeader>
               <div className="mt-6 pb-8"><Controls {...controlsProps} /></div>
             </SheetContent>
           </Sheet>
         </div>

         {/* Palette Grid */}
         <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
           <div className="flex flex-col gap-1 h-full min-h-[400px]">
             <Palette 
               numTiles={numTiles}
               numTilesMV={numTilesMV}
               startHue={startHueMV} endHue={endHueMV}
               startSat={startSatMV} endSat={endSatMV}
               startLight={startLightMV} endLight={endLightMV}
             />
           </div>
         </div>
       </div>

       {/* Desktop Sidebar */}
       <aside className="hidden md:flex flex-col w-70 border-l border-border bg-card h-full overflow-y-auto">
        <div className="p-4"><h2 className="font-semibold text-lg mb-4">Controls</h2><Controls {...controlsProps} /></div>
       </aside>
    </div>
  )
}
