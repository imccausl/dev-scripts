import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  type AdditionalArgs,
  hasExistingConfig,
  here,
  resolveConfigFile,
  run,
} from '../util/index.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function hereRelative(p: string) {
  return here(p, __dirname).replace(process.cwd(), '.')
}

const configFiles = [
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.cjs',
  'vite.config.ts',
  'vite.config.mts',
  'vite.config.cts',
]

export type BundleMode = 'bundle' | 'serve'

const bundleArgs = (mode: BundleMode = 'bundle'): AdditionalArgs => {
  return (args) => {
    const viteArgs: string[] = [mode]

    const hasConfig =
      args.includes('--config') ||
      args.includes('-c') ||
      hasExistingConfig(configFiles)

    if (!hasConfig) {
      const configPath = resolveConfigFile(hereRelative('./config/vite'))
      viteArgs.push('--config', configPath)
    }

    return viteArgs
  }
}

export function runVite(mode: BundleMode) {
  return run('vite', bundleArgs(mode))
}
