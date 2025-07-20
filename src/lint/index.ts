import { hasExistingConfig, resolveConfigFile, run } from '../util/index.js'

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
      const configPath = resolveConfigFile('./config/eslint.config')
      eslintArgs.push('--config', configPath)
    }

    if (!args.some((arg) => !arg.startsWith('-'))) {
      eslintArgs.push('.')
    }

    return eslintArgs
  })
}
