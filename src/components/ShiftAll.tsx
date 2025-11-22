import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

type ShiftAllProps = {
  globalHue: number
  globalSat: number
  globalLight: number
  onGlobalUpdate: (
    type: 'h' | 's' | 'l',
    value: number,
    commit: boolean,
  ) => void
}

export function ShiftAll({
  globalHue,
  globalSat,
  globalLight,
  onGlobalUpdate,
}: ShiftAllProps) {
  return (
    <Accordion type="single" collapsible className="w-full border-b">
      <AccordionItem value="global-controls" className="border-none">
        <AccordionTrigger className="px-5 py-2 text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <p>Shift All</p>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px]">
                  Shift all colors by the same amount. Resets the sliders to 0
                  when you release, allowing for incremental adjustments.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 px-5 py-5">
            {/* Global Hue */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Hue Shift</Label>
                <span className="font-mono text-xs">
                  {globalHue > 0 ? '+' : ''}
                  {Math.round(globalHue)}
                </span>
              </div>
              <Slider
                value={[globalHue]}
                onValueChange={(v) => onGlobalUpdate('h', v[0], false)}
                onValueCommit={(v) => onGlobalUpdate('h', v[0], true)}
                min={-180}
                max={180}
                step={1}
              />
            </div>

            {/* Global Saturation */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Saturation Shift</Label>
                <span className="font-mono text-xs">
                  {globalSat > 0 ? '+' : ''}
                  {globalSat.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[globalSat]}
                onValueChange={(v) => onGlobalUpdate('s', v[0], false)}
                onValueCommit={(v) => onGlobalUpdate('s', v[0], true)}
                min={-1}
                max={1}
                step={0.01}
              />
            </div>

            {/* Global Lightness */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Lightness Shift</Label>
                <span className="font-mono text-xs">
                  {globalLight > 0 ? '+' : ''}
                  {globalLight.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[globalLight]}
                onValueChange={(v) => onGlobalUpdate('l', v[0], false)}
                onValueCommit={(v) => onGlobalUpdate('l', v[0], true)}
                min={-1}
                max={1}
                step={0.01}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
