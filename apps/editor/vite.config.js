import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@module-federation/vite'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    federation({
      name: 'editor',
      filename: 'remoteEntry.js',
      exposes: {
        './EditorRemoteEntry': './src/embedded/EditorRemoteEntry.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false,
        },
        '@tanstack/react-query': {
          singleton: true,
          requiredVersion: false,
        },
      },
    }),
  ],
  server: {
    port: 5174,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
