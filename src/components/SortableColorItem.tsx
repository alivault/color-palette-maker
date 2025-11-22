import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import Color from 'colorjs.io'
import { Button } from '@/components/ui/button'
import type { ColorStop } from '@/lib/color-utils'

interface SortableColorItemProps {
  color: ColorStop
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
  canDelete: boolean
}

export function SortableColorItem({
  color,
  isSelected,
  onClick,
  onDelete,
  canDelete,
}: SortableColorItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: color.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hslString = `hsl(${color.h}, ${color.s * 100}%, ${color.l * 100}%)`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex touch-none items-center gap-2"
    >
      <div
        className={`flex flex-1 items-center gap-3 rounded-md border p-2 ${
          isSelected ? 'border-primary ring-primary ring-1' : 'border-border'
        } bg-card hover:bg-accent/50 cursor-pointer transition-colors`}
        onClick={onClick}
      >
        <div
          {...attributes}
          {...listeners}
          className="hover:bg-background text-muted-foreground cursor-grab rounded p-1 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </div>

        <div
          className="border-border size-6 rounded border shadow-sm"
          style={{ backgroundColor: hslString }}
        />

        <p className="text-muted-foreground flex font-mono text-xs">
          {new Color('hsl', [color.h, color.s * 100, color.l * 100])
            .to('srgb')
            .toString({ format: 'hex' })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="text-muted-foreground hover:bg-red-950 hover:text-red-500"
        disabled={!canDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
