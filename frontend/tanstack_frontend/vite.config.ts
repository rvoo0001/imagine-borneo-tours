import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    proxy: {
      '/animals': {
        target: 'http://localhost:8000',
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) return req.url
        },
      },
      '/tours': {
        target: 'http://localhost:8000',
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) return req.url
        },
      },
      '/images': 'http://localhost:8000',
      '/contact': {
        target: 'http://localhost:8000',
        bypass(req) {
          if (req.method === 'GET') return req.url
        },
      },
      '/admin': {
        target: 'http://localhost:8000',
        bypass(req) {
          if (req.method === 'GET') return req.url
        },
      },
      '/image': 'http://localhost:8000',
    },
  },
})

export default config
