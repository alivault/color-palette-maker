import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GradientSlider } from './GradientSlider'
import { useState, useEffect, useId, useRef } from 'react'
import {
  getHueGradient,
  getSatGradient,
  getLightGradient,
  POLAR_COLOR_SPACES,
  wrapHue,
  clamp,
} from '@/lib/color-utils'
import { Plus, Info } from 'lucide-react'
import { ShiftAll } from './ShiftAll'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { v4 as uuidv4 } from 'uuid'
import type { ColorStop, ColorSpace } from '@/lib/color-utils'
import Color from 'colorjs.io'
import { SortableColorItem } from './SortableColorItem'

export type ControlsProps = {
  numTiles: number
  onNumTilesChange: (value: number, commit?: boolean) => void
  colors: ColorStop[]
  setColors: (colors: ColorStop[]) => void
  onColorsChange?: (colors: ColorStop[]) => void
  selectedColorId: string | null
  setSelectedColorId: (id: string | null) => void
  takeLongWay: boolean
  setTakeLongWay: (value: boolean) => void
  colorSpace?: ColorSpace
  setColorSpace?: (space: ColorSpace) => void
  onDragChange?: (isDragging: boolean) => void
}

export function Controls({
  numTiles,
  onNumTilesChange,
  colors,
  setColors,
  onColorsChange,
  selectedColorId,
  setSelectedColorId,
  takeLongWay,
  setTakeLongWay,
  colorSpace = 'oklch',
  setColorSpace,
  onDragChange,
}: ControlsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setColors(
        arrayMove(
          colors,
          colors.findIndex((item) => item.id === active.id),
          colors.findIndex((item) => item.id === over.id),
        ),
      )
    }
  }

  const addColor = () => {
    const lastColor = colors[colors.length - 1]
    const newColor: ColorStop = {
      id: uuidv4(),
      h: lastColor.h,
      s: lastColor.s,
      l: lastColor.l,
    }
    setColors([...colors, newColor])
    setSelectedColorId(newColor.id)
  }

  const removeColor = (id: string) => {
    if (colors.length <= 2) return
    const newColors = colors.filter((c) => c.id !== id)
    setColors(newColors)
    if (selectedColorId === id) {
      setSelectedColorId(null)
    }
  }

  const updateColor = (
    id: string,
    updates: Partial<ColorStop>,
    commit: boolean = true,
  ) => {
    const newColors = colors.map((c) =>
      c.id === id ? { ...c, ...updates } : c,
    )
    if (onDragChange) {
      onDragChange(!commit)
    }
    if (commit) {
      setColors(newColors)
    } else if (onColorsChange) {
      onColorsChange(newColors)
    } else {
      setColors(newColors)
    }
  }

  const selectedColor = colors.find((c) => c.id === selectedColorId)

  const [hexInput, setHexInput] = useState('')

  useEffect(() => {
    if (selectedColor) {
      const hex = new Color('hsl', [
        selectedColor.h,
        selectedColor.s * 100,
        selectedColor.l * 100,
      ])
        .to('srgb')
        .toString({ format: 'hex' })
      setHexInput(hex)
    }
  }, [selectedColor])

  const handleHexChange = (val: string) => {
    setHexInput(val)
  }

  const handleHexBlur = () => {
    if (!selectedColor) return

    try {
      const color = new Color(hexInput)
      const hsl = color.to('hsl')
      updateColor(selectedColor.id, {
        h: isNaN(hsl.coords[0]) ? 0 : hsl.coords[0],
        s: hsl.coords[1] / 100,
        l: hsl.coords[2] / 100,
      })
    } catch (error) {
      const hex = new Color('hsl', [
        selectedColor.h,
        selectedColor.s * 100,
        selectedColor.l * 100,
      ])
        .to('srgb')
        .toString({ format: 'hex' })
      setHexInput(hex)
    }
  }

  const hueGradient = getHueGradient()
  const satGradient = selectedColor ? getSatGradient(selectedColor.h) : ''
  const lightGradient = selectedColor
    ? getLightGradient(selectedColor.h, selectedColor.s)
    : ''

  const isPolar = POLAR_COLOR_SPACES.includes(colorSpace)

  const id = useId()

  const [globalHue, setGlobalHue] = useState(0)
  const [globalSat, setGlobalSat] = useState(0)
  const [globalLight, setGlobalLight] = useState(0)

  const dragStartColors = useRef<ColorStop[] | null>(null)

  const handleGlobalUpdate = (
    type: 'h' | 's' | 'l',
    value: number,
    commit: boolean,
  ) => {
    if (!dragStartColors.current) {
      dragStartColors.current = colors
    }

    // Update the slider UI state
    if (type === 'h') setGlobalHue(value)
    if (type === 's') setGlobalSat(value)
    if (type === 'l') setGlobalLight(value)

    const newColors = dragStartColors.current.map((c) => {
      const newColor = { ...c }
      if (type === 'h') {
        newColor.h = wrapHue(c.h + value)
      } else if (type === 's') {
        newColor.s = clamp(c.s + value, 0, 1)
      } else if (type === 'l') {
        newColor.l = clamp(c.l + value, 0, 1)
      }
      return newColor
    })

    if (onDragChange) {
      onDragChange(!commit)
    }

    if (commit) {
      setColors(newColors)
      // Reset UI state
      setGlobalHue(0)
      setGlobalSat(0)
      setGlobalLight(0)
      dragStartColors.current = null
    } else if (onColorsChange) {
      onColorsChange(newColors)
    } else {
      setColors(newColors)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div>
        <div className="space-y-5 border-b p-5">
          <div className="flex items-center justify-between">
            <Label>Number of colors</Label>
            <NumberInput
              value={numTiles}
              onValueChange={(v) =>
                v !== undefined && onNumTilesChange(v, true)
              }
              min={2}
              max={48}
              stepper={1}
            />
          </div>
          {setColorSpace && (
            <div className="flex items-center justify-between">
              <Label>Color Space</Label>
              <Select
                value={colorSpace}
                onValueChange={(v) => setColorSpace(v as ColorSpace)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="srgb">sRGB</SelectItem>
                  <SelectItem value="hsl">HSL</SelectItem>
                  <SelectItem value="lch">LCH</SelectItem>
                  <SelectItem value="oklch">OKLCH</SelectItem>
                  <SelectItem value="lab">LAB</SelectItem>
                  <SelectItem value="oklab">OKLAB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="long-way-switch"
                className={
                  !isPolar ? 'text-muted-foreground' : 'cursor-pointer'
                }
              >
                Rainbow Mode
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    className={`h-4 w-4 ${!isPolar ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px]">
                    {isPolar
                      ? 'Force the gradient to take the long route around the color wheel, effectively creating a rainbow.'
                      : 'Rainbow mode is only available for polar color spaces (HSL, LCH, OKLCH).'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id="long-way-switch"
              checked={takeLongWay}
              onCheckedChange={setTakeLongWay}
              disabled={!isPolar}
            />
          </div>
        </div>
        <ShiftAll
          globalHue={globalHue}
          globalSat={globalSat}
          globalLight={globalLight}
          onGlobalUpdate={handleGlobalUpdate}
        />
      </div>

      <div className="p-5">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Colors</h3>
          </div>

          <DndContext
            id={id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={colors.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {colors.map((color) => (
                  <SortableColorItem
                    key={color.id}
                    color={color}
                    isSelected={color.id === selectedColorId}
                    onClick={() =>
                      setSelectedColorId(
                        color.id === selectedColorId ? null : color.id,
                      )
                    }
                    onDelete={() => removeColor(color.id)}
                    canDelete={colors.length > 2}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button onClick={addColor} className="w-full" variant="outline">
            <Plus className="h-4 w-4" /> Add Color
          </Button>
        </div>
      </div>

      {selectedColor && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-5 border-t px-5 pt-5 pb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Edit Color</h3>
            <div
              className="border-border h-6 w-6 rounded-full border shadow-sm"
              style={{
                backgroundColor: `hsl(${selectedColor.h}, ${selectedColor.s * 100}%, ${selectedColor.l * 100}%)`,
              }}
            />
          </div>

          {/* Hue */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Hue</Label>
              <span className="font-mono text-xs">
                {Math.round(selectedColor.h)}
              </span>
            </div>
            <GradientSlider
              value={[selectedColor.h]}
              onValueChange={(v) =>
                updateColor(selectedColor.id, { h: v[0] }, false)
              }
              onValueCommit={(v) =>
                updateColor(selectedColor.id, { h: v[0] }, true)
              }
              min={0}
              max={360}
              step={1}
              background={hueGradient}
              thumbColor={`hsl(${selectedColor.h}, 100%, 50%)`}
            />
          </div>

          {/* Saturation */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Saturation</Label>
              <span className="font-mono text-xs">
                {selectedColor.s.toFixed(2)}
              </span>
            </div>
            <GradientSlider
              value={[selectedColor.s]}
              onValueChange={(v) =>
                updateColor(selectedColor.id, { s: v[0] }, false)
              }
              onValueCommit={(v) =>
                updateColor(selectedColor.id, { s: v[0] }, true)
              }
              min={0}
              max={1}
              step={0.01}
              background={satGradient}
              thumbColor={`hsl(${selectedColor.h}, ${selectedColor.s * 100}%, 50%)`}
            />
          </div>

          {/* Lightness */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Lightness</Label>
              <span className="font-mono text-xs">
                {selectedColor.l.toFixed(2)}
              </span>
            </div>
            <GradientSlider
              value={[selectedColor.l]}
              onValueChange={(v) =>
                updateColor(selectedColor.id, { l: v[0] }, false)
              }
              onValueCommit={(v) =>
                updateColor(selectedColor.id, { l: v[0] }, true)
              }
              min={0}
              max={1}
              step={0.01}
              background={lightGradient}
              thumbColor={`hsl(${selectedColor.h}, ${selectedColor.s * 100}%, ${selectedColor.l * 100}%)`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs" htmlFor="hex-input">
              Hex
            </Label>
            <Input
              id="hex-input"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              onBlur={handleHexBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleHexBlur()
                }
              }}
              className="w-[90px] font-mono"
            />
          </div>
        </div>
      )}
    </div>
  )
}
