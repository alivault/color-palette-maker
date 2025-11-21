import { memo, useMemo } from 'react'
import Color from 'colorjs.io'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ColorStop } from '@/lib/color-utils'

export const Palette = memo(({ numTiles, colors, takeLongWay }: {
  numTiles: number,
  numTilesMV?: any, // kept for compatibility if needed, but unused
  colors: ColorStop[],
  takeLongWay: boolean
}) => {
  
  const hexColors = useMemo(() => {
    if (colors.length === 0) return []
    if (colors.length === 1) {
      const c = new Color("hsl", [colors[0].h, colors[0].s * 100, colors[0].l * 100]).to("srgb").toString({ format: "hex" })
      return Array(numTiles).fill(c)
    }

    // Create color objects
    const colorObjects = colors.map(c => new Color("hsl", [c.h, c.s * 100, c.l * 100]))

    // If colorjs.io supports multiple stops in range (it usually does via separate method or just constructor in some versions)
    // Let's try a safe approach: create a custom interpolation function
    // We want to distribute the colors evenly at 0, 1/(n-1), 2/(n-1), ... 1
    
    // We'll use the `range` function. If it supports multiple args: new Color.Range(c1, c2, c3)
    // If not, we can use `Color.mix` piecewise.
    
    // Let's assume standard range(start, end) for now and implement multi-stop manually if needed.
    // Actually, the `steps` method on a range returns an array.
    // We can construct a piecewise scale.
    
    const stops = colors.length
    const result: string[] = []
    
    // If we want exactly `numTiles` output
    // We have `stops - 1` segments.
    // To be simple, let's use a Range that covers all stops if possible.
    // `new Color.Range` in recent versions accepts "linear" interpolation over multiple stops?
    // Let's just do piecewise linear interpolation for safety.
    
    // Total domain is 0..1.
    // Stop i is at i / (stops - 1).
    
    // For each step j in 0..numTiles-1:
    // t = j / (numTiles - 1)
    // Find which segment t falls into.
    
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
      const mixed = c1.mix(c2, segmentT, { space: "oklch", hue: takeLongWay ? "longer" : "shorter" })
      result.push(mixed.to("srgb").toString({ format: "hex" }))
    }
    
    return result
  }, [colors, numTiles, takeLongWay])

  return (
    <>
      {hexColors.map((color, i) => (
        <PaletteTile key={i} colorHex={color} />
      ))}
    </>
  )
})

const PaletteTile = memo(({ colorHex }: { colorHex: string }) => {
  // Calculate contrast
  const textColor = useMemo(() => {
    const c = new Color(colorHex)
    const white = new Color("white")
    const black = new Color("black")
    const contrastWhite = c.contrast(white, "WCAG21")
    const contrastBlack = c.contrast(black, "WCAG21")
    return contrastWhite > contrastBlack ? 'white' : 'black'
  }, [colorHex])

  const handleCopy = () => {
    navigator.clipboard.writeText(colorHex)
    toast.success(`Copied ${colorHex} to clipboard`)
  }

  return (
    <motion.div 
      className="group cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-transform hover:scale-[1.01] active:scale-[1] hover:shadow-md flex-1"
      style={{ backgroundColor: colorHex, color: textColor }}
      onClick={handleCopy}
    >
      <span className="uppercase opacity-80 font-mono text-sm">{colorHex.substring(1)}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  )
})
