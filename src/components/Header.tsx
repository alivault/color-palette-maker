import { cn } from "@/lib/utils"

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Header({ className, ...props }: HeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 shrink-0 px-5 py-4 border-b", className)} {...props}>
      <h1 className="font-extrabold tracking-tight text-xl">Color Palette Maker</h1>
    </div>
  )
}

