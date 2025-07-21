import {
  hasExistingConfig,
  isYarnPnP,
  resolveConfigFile,
  run,
  hasFile,
} from '../util/index.js'

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
        './config/prettier.config',
        isYarnPnP(),
      )
      prettierArgs.push('--config', configPath)
    }

    const useBuiltinIgnore =
      !args.includes('--ignore-path') && !hasFile('.prettierignore')

    if (useBuiltinIgnore) {
      prettierArgs.push('--ignore-path', './config/prettierignore')
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
