import { memo, useMemo, forwardRef, useRef, useEffect } from 'react'
import Color from 'colorjs.io'
import { motion, AnimatePresence } from 'motion/react'
import { stagger } from 'motion'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  type ColorStop,
  type ColorSpace,
  generatePalette,
} from '@/lib/color-utils'

export const Palette = memo(
  ({
    numTiles,
    colors,
    takeLongWay,
    colorSpace,
    disableAnimation,
  }: {
    numTiles: number
    numTilesMV?: any // kept for compatibility if needed, but unused
    colors: ColorStop[]
    takeLongWay: boolean
    colorSpace: ColorSpace
    disableAnimation?: boolean
  }) => {
    const hexColors = useMemo(() => {
      return generatePalette(colors, numTiles, takeLongWay, colorSpace)
    }, [colors, numTiles, takeLongWay, colorSpace])

    const hasAnimated = useRef(false)

    useEffect(() => {
      if (hexColors.length > 0) {
        hasAnimated.current = true
      }
    }, [hexColors.length])

    const staggerDelay = useMemo(() => stagger(0.03), [])

    if (hexColors.length === 0) return null

    return (
      <div className="flex h-full min-h-[400px] flex-col gap-1">
        <AnimatePresence mode="popLayout">
          {hexColors.map((color, i) => (
            <PaletteTile
              key={i}
              colorHex={color}
              index={i}
              delay={
                !hasAnimated.current ? staggerDelay(i, hexColors.length) : 0
              }
              disableAnimation={disableAnimation}
            />
          ))}
        </AnimatePresence>
      </div>
    )
  },
)

const PaletteTile = memo(
  forwardRef<
    HTMLDivElement,
    {
      colorHex: string
      index: number
      delay?: number
      disableAnimation?: boolean
    }
  >(({ colorHex, delay = 0, disableAnimation }, ref) => {
    // Calculate contrast
    const textColor = useMemo(() => {
      const c = new Color(colorHex)
      const white = new Color('white')
      const black = new Color('black')
      const contrastWhite = c.contrast(white, 'WCAG21')
      const contrastBlack = c.contrast(black, 'WCAG21')
      return contrastWhite > contrastBlack ? 'white' : 'black'
    }, [colorHex])

    const handleCopy = () => {
      navigator.clipboard.writeText(colorHex)
      toast.success(`Copied ${colorHex} to clipboard`)
    }

    return (
      <motion.div
        layout
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        animate={{
          opacity: 1,
          scale: 1,
          backgroundColor: colorHex,
          color: textColor,
          transition: disableAnimation
            ? { duration: 0 }
            : { delay, type: 'spring', bounce: 0.2 },
        }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
        className="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 shadow-sm hover:shadow-md"
        onClick={handleCopy}
      >
        <span className="font-mono text-sm uppercase opacity-80">
          {colorHex.substring(1)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Copy className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    )
  }),
)
