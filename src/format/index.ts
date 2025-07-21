import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  hasExistingConfig,
  hasFile,
  here,
  isYarnPnP,
  resolveConfigFile,
  run,
} from '../util/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function hereRelative(p: string) {
  console.log(`Resolving path relative to: ${__dirname}`)
  console.log(`full path: ${here(p, __dirname).replace(process.cwd(), '.')}`)
  return here(p, __dirname).replace(process.cwd(), '.')
}

const configFiles = [
  '.prettierrc',
  '.prettierrc.json',
  '.prettierrc.js',
  '.prettierrc.mjs',
  '.prettierrc.cjs',
  '.prettierrc.ts',
  '.prettierrc.yaml',
  '.prettierrc.yml',
  'prettier.config.js',
  'prettier.config.mjs',
  'prettier.config.cjs',
  'prettier.config.ts',
]

export function runFormat() {
  return run('prettier', (args) => {
    const prettierArgs: string[] = []

    const hasConfig =
      args.includes('--config') || hasExistingConfig(configFiles)

    if (!hasConfig) {
      const configPath = resolveConfigFile(
        hereRelative('./config/prettier.config'),
        isYarnPnP(),
      )
      prettierArgs.push('--config', configPath)
    }

    const useBuiltinIgnore =
      !args.includes('--ignore-path') && !hasFile('.prettierignore')

    if (useBuiltinIgnore) {
      prettierArgs.push(
        '--ignore-path',
        hereRelative('./config/prettierignore'),
      )
    }
    if (!args.some((arg) => !arg.startsWith('-'))) {
      prettierArgs.push('.')
    }

    if (
      !args.includes('--write') &&
      !args.includes('--check') &&
      !args.includes('--list-different')
    ) {
      prettierArgs.push('--write')
    }

    return prettierArgs
  })
}
