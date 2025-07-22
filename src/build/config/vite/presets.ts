import react from '@vitejs/plugin-react'

import { deepMerge } from './util.ts'

import type { UserConfig, UserConfigFn } from 'vite'

const base = {
  plugins: [react()],
  resolve: {
    alias: {
      app: '/src',
    },
  },
}

const development = {
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    sourcemap: true,
    minify: false,
  },
  css: {
    devSourcemap: true,
  },
  esuild: {
    drop: [],
  },
}

const production = {
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 4173,
    host: true,
  },
}

const bundleOptimizations = {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
}

const performance = {
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 1000,
      },
    },
  },
  esbuild: {
    treeShaking: true,
  },
}

const testing = {
  test: {
    globals: true,
    environment: 'jsdom',
  },
}

const presetConfigurations = {
  development: [base, development],
  production: [base, production, bundleOptimizations],
  'production-performance': [
    base,
    production,
    bundleOptimizations,
    performance,
  ],
  testing: [base, development, testing],
}

type Preset = keyof typeof presetConfigurations

const getPreset = (command: string, mode: string): Preset => {
  switch (command) {
    case 'build':
      return mode === 'production' ? 'production' : 'development'
    case 'serve':
      return 'development'
    case 'test':
      return 'testing'
    default:
      return 'development'
  }
}

export const getViteConfig: UserConfigFn = ({ command, mode }) => {
  const config = presetConfigurations[getPreset(command, mode)]
  return deepMerge(...config) as UserConfig
}
