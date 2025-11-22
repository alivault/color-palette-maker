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
import { type ColorStop, generatePalette } from '@/lib/color-utils'

export const Palette = memo(({ numTiles, colors, takeLongWay }: {
  numTiles: number,
  numTilesMV?: any, // kept for compatibility if needed, but unused
  colors: ColorStop[],
  takeLongWay: boolean
}) => {
  
  const hexColors = useMemo(() => {
    return generatePalette(colors, numTiles, takeLongWay)
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
