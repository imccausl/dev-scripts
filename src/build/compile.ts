import { hasExistingConfig, resolveConfigFile, run } from '../util/index.ts'

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
      const configPath = resolveConfigFile('./tsdown.config')
      tsdownArgs.push('--config', configPath)
    }

    return tsdownArgs
  })
}
