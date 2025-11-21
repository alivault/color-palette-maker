import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Header } from '@/components/Header'

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
        title: 'Color Palette Maker',
      },
      {
        name: 'description',
        content: 'A unique and intuitive tool for crafting harmonious color palettes. Uses OKLCH and framer-motion for smooth performance.',
      },
      {
        property: 'og:title',
        content: 'Color Palette Maker',
      },
      {
        property: 'og:description',
        content: 'A unique and intuitive tool for crafting harmonious color palettes. Uses OKLCH and framer-motion for smooth performance.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <div className="flex-1 min-h-0">
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

import { Toaster } from '../components/ui/sonner'

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
