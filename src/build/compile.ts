import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { hasExistingConfig, here, resolveConfigFile, run } from '../util/index.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function hereRelative(p: string) {
  return here(p, __dirname).replace(process.cwd(), '.')
}
const configFiles = [
  'tsdown.config.js',
  'tsdown.config.mjs',
  'tsdown.config.cjs',
  'tsdown.config.ts',
  'tsdown.config.mts',
  'tsdown.config.cts',
]

export function compile() {
  return run('tsdown', (args) => {
    const tsdownArgs: string[] = []
    const hasConfig =
      args.includes('--config') ||
      args.includes('-c') ||
      hasExistingConfig(configFiles)

    if (!hasConfig) {
      const configPath = resolveConfigFile(hereRelative('./config/tsdown'))
      tsdownArgs.push('--config', configPath)
    }

    return tsdownArgs
  })
}
