import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
}

export function Header({ className, action, ...props }: HeaderProps) {
  return (
    <div className={cn("flex flex-row items-center justify-between gap-4 shrink-0 px-5 py-4 border-b", className)} {...props}>
      <div className="flex flex-col">
      <a href="/" className="font-extrabold tracking-tight text-xl">Color Palette Maker</a>
        <p className="text-xs text-muted-foreground">by <a href="https://www.aliabbas.dev" target="_blank" className="underline">Ali Abbas</a></p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
