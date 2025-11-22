import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const WORKER_ENTRY = "virtual:tanstack-start-server-entry";

const workerIndexChunkPlugin = () => ({
  name: "worker-index-entry",
  config() {
    return {
      environments: {
        ssr: {
          build: {
            rollupOptions: {
              input: {
                index: WORKER_ENTRY,
              },
            },
          },
        },
      },
    };
  },
});

const config = defineConfig(({ command }) => ({
  plugins: [
    ...(command === "build" ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
    devtools({
      eventBusConfig: {
        enabled: false,
      },
    }),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    workerIndexChunkPlugin(),
  ],
}));

export default config;
