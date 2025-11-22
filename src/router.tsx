import { createRouter } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { parseSearchParams, stringifySearchParams } from '@/lib/search-params'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    parseSearch: parseSearchParams,
    stringifySearch: stringifySearchParams,
    Wrap: ({ children }) => (
      <TooltipProvider>{children}</TooltipProvider>
    ),
  })

  return router
}
