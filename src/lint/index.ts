import { createCLICommand } from '../util/command.js'
import { applyToAllFilesIfNoneSpecfied } from '../util/transforms.js'

const configFiles = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
]

export default createCLICommand({
  command: 'eslint',
  name: 'lint',
  description: 'Run ESLint to lint the codebase',
  config: {
    flag: '--config',
    hasFlag: (args: string[]) =>
      args.includes('--config') || args.includes('-c'),
    fileNames: configFiles,
    defaultConfigPath: './config/eslint.config.js',
  },
  transforms: [applyToAllFilesIfNoneSpecfied],
})
