import { type UserConfig, defineConfig } from 'tsdown/config'

export const tsUpConfig: UserConfig = {
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  dts: true,
}

/**
 * Merges the provided configuration with the default tsup configuration.
 */
export function defineMergedConfig(config: UserConfig = {}) {
  return defineConfig({
    ...tsUpConfig,
    ...config
  })
}

export default defineConfig({
  ...tsUpConfig
})
