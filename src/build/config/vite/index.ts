import { type UserConfig, type UserConfigFn, defineConfig } from 'vite'

import { getViteConfig } from './presets.ts'

function defineMergedConfig(config: UserConfig | UserConfigFn = {}) {
  return defineConfig((args) => ({
    ...getViteConfig(args),
    ...(typeof config === 'function' ? config(args) : config),
  }))
}

export default defineConfig(getViteConfig)

export { defineConfig, defineMergedConfig }
