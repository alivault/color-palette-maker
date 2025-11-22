import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import { Controls, type ControlsProps } from './Controls'

export function MobileControlsTrigger(props: ControlsProps) {
  return (
    <div className="fixed right-4 bottom-4 z-50 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" className="size-12 rounded-full shadow-lg">
            <Settings2 className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="flex h-full w-[300px] flex-col gap-0"
        >
          <SheetHeader className="flex-none">
            <SheetTitle>Controls</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 pb-8">
            <Controls {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
