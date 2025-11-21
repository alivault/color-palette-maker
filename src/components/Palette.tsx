import { memo } from 'react'
import Color from 'colorjs.io'
import { motion, useTransform, MotionValue } from 'motion/react'

export const Palette = memo(({ numTiles, numTilesMV, startHue, endHue, startSat, endSat, startLight, endLight }: {
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

export const PaletteTile = memo(({ index, allColors }: { index: number, allColors: MotionValue<string[]> }) => {
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

