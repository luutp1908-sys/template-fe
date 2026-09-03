import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'
import { fileURLToPath } from 'url'
import path from 'path'
import React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactQuery from '@tanstack/react-query'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const editorRemoteEntryPath = path.resolve(__dirname, 'src/embedded/EditorRemoteEntry.tsx')
// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    federation({
      name: 'editor',
      filename: 'remoteEntry.js',
      exposes: {
        './EditorRemoteEntry': editorRemoteEntryPath,
      },
      shared: {
        react: {
          version: '18.3.1',
          lib: () => React,
          shareConfig: {
            singleton: true,
            eager: false,
            requiredVersion: '18.3.1',
          },
        },
        'react-dom': {
          version: '18.3.1',
          lib: () => ReactDOM,
          shareConfig: {
            singleton: true,
            eager: false,
            requiredVersion: '18.3.1',
          },
        },
        '@tanstack/react-query': {
          version: '5.101.4',
          lib: () => ReactQuery,
          shareConfig: {
            singleton: true,
            eager: false,
            requiredVersion: '5.101.4',
          },
        },
      },
    }),
  ],
  server: {
    port: 5174,
    strictPort: true,
    origin: 'http://localhost:5174',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
