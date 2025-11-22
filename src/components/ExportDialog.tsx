import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { ReactNode } from 'react'

interface ExportDialogProps {
  exportText: string
  trigger?: ReactNode
}

export function ExportDialog({ exportText, trigger }: ExportDialogProps) {
  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportText)
    toast.success('Copied palette to clipboard')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Download className="size-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Palette</DialogTitle>
          <DialogDescription>
            Copy your palette as a comma-separated list of hex codes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input value={exportText} readOnly className="font-mono text-sm" />
          <Button size="icon" onClick={handleCopyExport} className="shrink-0">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
