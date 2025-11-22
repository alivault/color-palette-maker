import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
}

export function Header({ className, action, ...props }: HeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-row items-center justify-between gap-4 border-b px-5 py-4',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col">
        <a href="/" className="text-xl font-extrabold tracking-tight">
          Color Palette Maker
        </a>
        <p className="text-muted-foreground text-xs">
          by{' '}
          <a
            href="https://www.aliabbas.dev"
            target="_blank"
            className="underline"
          >
            Ali Abbas
          </a>
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
