import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  hasExistingConfig,
  here,
  resolveConfigFile,
  run,
} from '../util/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function hereRelative(p: string) {
  return here(p, __dirname).replace(process.cwd(), '.')
}

const configFiles = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
]

export function runLint() {
  return run('eslint', (args) => {
    const eslintArgs: string[] = []
    const hasConfig =
      args.includes('--config') ||
      args.includes('-c') ||
      hasExistingConfig(configFiles)

    if (!hasConfig) {
      const configPath = resolveConfigFile(hereRelative('./config/index'))
      eslintArgs.push('--config', configPath)
    }

    if (!args.some((arg) => !arg.startsWith('-'))) {
      eslintArgs.push('.')
    }

    return eslintArgs
  })
}
