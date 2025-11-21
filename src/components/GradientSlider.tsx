import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export function GradientSlider({ background, thumbColor, className, ...props }: React.ComponentProps<typeof Slider> & { background?: string, thumbColor?: string }) {
  return (
    <Slider
      className={cn(
        "**:data-[slot=slider-track]:bg-(image:--track-bg)",
        "**:data-[slot=slider-track]:h-2",
        "**:data-[slot=slider-track]:shadow-[inset_0_0_2px_var(--slider-border)]",
        "**:data-[slot=slider-range]:bg-transparent",
        "**:data-[slot=slider-thumb]:bg-(--thumb-color)",
        "**:data-[slot=slider-thumb]:border-none",
        "**:data-[slot=slider-thumb]:shadow-[0_0_0_2px_rgba(255,255,255,1),0_0_2px_2px_rgba(0,0,0,0.8)]",
        className
      )}
      style={{ '--track-bg': background || 'var(--muted)', '--thumb-color': thumbColor || 'white' } as React.CSSProperties}
      {...props}
    />
  )
}

