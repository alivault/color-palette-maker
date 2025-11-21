import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { GradientSlider } from './GradientSlider'
import { getHueGradient, getSatGradient, getLightGradient } from '@/lib/color-utils'

export type ControlsProps = {
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

export function Controls({
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

