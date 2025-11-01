import { type UserConfig, defineConfig } from 'tsdown/config'

const defaultConfig: UserConfig = {
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  dts: true,
}

/**
 * Merges the provided configuration with the default tsup configuration.
 */
function defineMergedConfig(config: UserConfig = {}) {
  return defineConfig({
    ...defaultConfig,
    ...config,
  })
}

export default defineConfig({
  ...defaultConfig,
})

export { defineConfig, defineMergedConfig, defaultConfig }
