import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { hasAnyDependency, ifAnyDependency } from '../../util/pkg.js'

const plugins = [hasAnyDependency(['react']) && react()].filter(Boolean)

export default defineConfig(({ mode }) => ({
  plugins,
  cacheDir: '.vitest',
  test: {
    globals: true,
    environment: ifAnyDependency(['react'], { then: 'jsdom', orElse: 'node' }),
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      enabled: mode === 'ci' ? true : false,
      provider: 'v8',
      all: true,
    },
  },
}))
