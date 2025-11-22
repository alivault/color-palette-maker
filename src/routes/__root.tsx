import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { Toaster } from '../components/ui/sonner'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Chromagine',
      },
      {
        name: 'description',
        content:
          'Chromagine is a unique and intuitive tool for crafting harmonious color palettes. It supports multiple color spaces like OKLCH, sRGB, HSL, and more.',
      },
      {
        property: 'og:title',
        content: 'Chromagine',
      },
      {
        property: 'og:description',
        content:
          'Chromagine is a unique and intuitive tool for crafting harmonious color palettes. It supports multiple color spaces like OKLCH, sRGB, HSL, and more.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon.png',
      },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <div className="bg-background text-foreground flex h-screen flex-col">
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster richColors />
        <Scripts />
      </body>
    </html>
  )
}
