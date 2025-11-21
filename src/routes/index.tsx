import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, memo } from 'react'
import Color from 'colorjs.io'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, useMotionValue, useTransform, MotionValue } from 'motion/react'

export const Route = createFileRoute('/')({
  component: App,
})

// Helper functions
const wrapHue = (h: number) => ((h % 360) + 360) % 360
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max))
const getHueGradient = () =>
  `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`
const getSatGradient = (hue: number) =>
  `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`
const getLightGradient = (hue: number, sat: number) =>
  `linear-gradient(to right, hsl(${hue}, ${sat * 100}%, 0%), hsl(${hue}, ${sat * 100}%, 50%), hsl(${hue}, ${
    sat * 100
  }%, 100%))`

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
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden">
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
       <aside className="hidden md:flex flex-col w-80 border-l border-border bg-card h-full overflow-y-auto">
        <div className="p-6"><h2 className="font-semibold text-lg mb-4">Controls</h2><Controls {...controlsProps} /></div>
       </aside>
    </div>
  )
}

// --- Components ---

type ControlsProps = {
  numTiles: number
  onNumTilesChange: (value: number) => void
  startHue: number
  endHue: number
  hueShift: number
  onStartHueChange: (value: number) => void
  onEndHueChange: (value: number) => void
  onHueShiftChange: (value: number[]) => void
  startSat: number
  endSat: number
  satShift: number
  onStartSatChange: (value: number) => void
  onEndSatChange: (value: number) => void
  onSatShiftChange: (value: number[]) => void
  startLight: number
  endLight: number
  lightShift: number
  onStartLightChange: (value: number) => void
  onEndLightChange: (value: number) => void
  onLightShiftChange: (value: number[]) => void
}

function Controls({
  numTiles,
  onNumTilesChange,
  startHue,
  endHue,
  hueShift,
  onStartHueChange,
  onEndHueChange,
  onHueShiftChange,
  startSat,
  endSat,
  satShift,
  onStartSatChange,
  onEndSatChange,
  onSatShiftChange,
  startLight,
  endLight,
  lightShift,
  onStartLightChange,
  onEndLightChange,
  onLightShiftChange,
}: ControlsProps) {
  const hueGradient = getHueGradient()
  const startSatGradient = getSatGradient(startHue)
  const endSatGradient = getSatGradient(endHue)
  const startLightGradient = getLightGradient(startHue, startSat)
  const endLightGradient = getLightGradient(endHue, endSat)

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Number of colors</Label>
          <span className="font-mono text-sm">{numTiles}</span>
        </div>
        <Slider
          value={[numTiles]}
          onValueChange={(v) => onNumTilesChange(v[0])}
          min={2}
          max={100}
          step={1}
        />
      </div>

      {/* Hue Controls */}
      <div className="border-t border-border pt-4 space-y-4">
        <h3 className="font-bold">Hue</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Hue Start</Label>
            <span className="font-mono text-sm">{Math.round(startHue)}</span>
          </div>
          <GradientSlider
            value={[startHue]}
            onValueChange={(v) => onStartHueChange(v[0])}
            min={0}
            max={360}
            step={1}
            background={hueGradient}
            thumbColor={`hsl(${startHue}, 100%, 50%)`}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Hue End</Label>
            <span className="font-mono text-sm">{Math.round(endHue)}</span>
          </div>
          <GradientSlider
            value={[endHue]}
            onValueChange={(v) => onEndHueChange(v[0])}
            min={0}
            max={360}
            step={1}
            background={hueGradient}
            thumbColor={`hsl(${endHue}, 100%, 50%)`}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Hue Shift</Label>
            <span className="font-mono text-sm">
              {hueShift - 180 > 0 ? `+${hueShift - 180}` : hueShift - 180}
            </span>
          </div>
          <Slider value={[hueShift]} onValueChange={onHueShiftChange} min={0} max={360} step={1} />
        </div>
      </div>

      {/* Saturation Controls */}
      <div className="border-t border-border pt-4 space-y-4">
        <h3 className="font-bold">Saturation</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Saturation Start</Label>
            <span className="font-mono text-sm">{startSat.toFixed(2)}</span>
          </div>
          <GradientSlider
            value={[startSat]}
            onValueChange={(v) => onStartSatChange(v[0])}
            min={0}
            max={1}
            step={0.01}
            background={startSatGradient}
            thumbColor={`hsl(${startHue}, ${startSat * 100}%, 50%)`}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Saturation End</Label>
            <span className="font-mono text-sm">{endSat.toFixed(2)}</span>
          </div>
          <GradientSlider
            value={[endSat]}
            onValueChange={(v) => onEndSatChange(v[0])}
            min={0}
            max={1}
            step={0.01}
            background={endSatGradient}
            thumbColor={`hsl(${endHue}, ${endSat * 100}%, 50%)`}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Saturation Shift</Label>
            <span className="font-mono text-sm">{satShift.toFixed(2)}</span>
          </div>
          <Slider value={[satShift]} onValueChange={onSatShiftChange} min={0} max={1} step={0.01} />
        </div>
      </div>

      {/* Lightness Controls */}
      <div className="border-t border-border pt-4 space-y-4">
        <h3 className="font-bold">Lightness</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Lightness Start</Label>
            <span className="font-mono text-sm">{startLight.toFixed(2)}</span>
          </div>
          <GradientSlider
            value={[startLight]}
            onValueChange={(v) => onStartLightChange(v[0])}
            min={0}
            max={1}
            step={0.01}
            background={startLightGradient}
            thumbColor={`hsl(${startHue}, ${startSat * 100}%, ${startLight * 100}%)`}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Lightness End</Label>
            <span className="font-mono text-sm">{endLight.toFixed(2)}</span>
          </div>
          <GradientSlider
            value={[endLight]}
            onValueChange={(v) => onEndLightChange(v[0])}
            min={0}
            max={1}
            step={0.01}
            background={endLightGradient}
            thumbColor={`hsl(${endHue}, ${endSat * 100}%, ${endLight * 100}%)`}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Lightness Shift</Label>
            <span className="font-mono text-sm">{lightShift.toFixed(2)}</span>
          </div>
          <Slider
            value={[lightShift]}
            onValueChange={onLightShiftChange}
            min={0}
            max={1}
            step={0.01}
          />
        </div>
      </div>
    </div>
  )
}

// Wrapper for shadcn slider to add custom styling
function GradientSlider({ background, thumbColor, className, ...props }: React.ComponentProps<typeof Slider> & { background?: string, thumbColor?: string }) {
  return (
    <Slider
      className={cn(
        "**:data-[slot=slider-track]:bg-(image:--track-bg)",
        "**:data-[slot=slider-track]:h-3",
        "**:data-[slot=slider-range]:bg-transparent",
        "**:data-[slot=slider-thumb]:bg-(--thumb-color)",
        "**:data-[slot=slider-thumb]:border-2",
        "**:data-[slot=slider-thumb]:border-white",
        "**:data-[slot=slider-thumb]:shadow-md",
        className
      )}
      style={{ '--track-bg': background || 'var(--muted)', '--thumb-color': thumbColor || 'white' } as React.CSSProperties}
      {...props}
    />
  )
}

// Optimized Palette Component
const Palette = memo(({ numTiles, numTilesMV, startHue, endHue, startSat, endSat, startLight, endLight }: {
  numTiles: number,
  numTilesMV: MotionValue<number>,
  startHue: MotionValue<number>, endHue: MotionValue<number>,
  startSat: MotionValue<number>, endSat: MotionValue<number>,
  startLight: MotionValue<number>, endLight: MotionValue<number>
}) => {
  // Create a single transform that returns ALL colors (string[])
  const allColors = useTransform(
    [startHue, endHue, startSat, endSat, startLight, endLight, numTilesMV],
    (latest: number[]) => {
      const [sH, eH, sS, eS, sL, eL, tiles] = latest
      const startColor = new Color("hsl", [sH, sS * 100, sL * 100])
      const endColor = new Color("hsl", [eH, eS * 100, eL * 100])
      return startColor.steps(endColor, { space: "oklch", steps: tiles })
        .map((c: Color) => c.to("srgb").toString({ format: "hex" }))
    }
  )

  return (
    <>
      {Array.from({ length: numTiles }).map((_, i) => (
        <PaletteTile key={i} index={i} allColors={allColors} />
      ))}
    </>
  )
})

const PaletteTile = memo(({ index, allColors }: { index: number, allColors: MotionValue<string[]> }) => {
  // Derive individual color and text props
  const color = useTransform(allColors, (colors) => colors[index] || "#000000")
  
  // Derived values for contrast
  const contrastData = useTransform(color, (cStr) => {
    const c = new Color(cStr)
    const white = new Color("white")
    const black = new Color("black")
    const contrastWhite = c.contrast(white, "WCAG21")
    const contrastBlack = c.contrast(black, "WCAG21")
    const text = contrastWhite > contrastBlack ? 'white' : 'black'
    const val = Math.max(contrastWhite, contrastBlack).toFixed(1)
    return { text, val, hex: cStr.substring(1) }
  })

  const textColor = useTransform(contrastData, d => d.text)
  // We can't easily render MotionValue content inside standard elements, 
  // but motion components support MotionValue as children.
  const contrastVal = useTransform(contrastData, d => d.val)
  const hexVal = useTransform(contrastData, d => d.hex)

  return (
    <motion.div 
      className="flex items-center justify-between px-4 py-2 rounded-lg shadow-sm hover:scale-[1.01] hover:shadow-md flex-1"
      style={{ backgroundColor: color, color: textColor }}
    >
      <motion.span className="font-bold opacity-90">{contrastVal}</motion.span>
      <motion.span className="uppercase opacity-80 font-mono text-sm">{hexVal}</motion.span>
    </motion.div>
  )
})
