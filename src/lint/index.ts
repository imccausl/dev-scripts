import { createCLICommand, fromHere } from '../util/command.js'
import { applyToAllFilesIfNoneSpecfied } from '../util/transforms.js'

const hereLint = fromHere(import.meta.url)

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
    flag: ['--config', '-c'],
    fileNames: configFiles,
    defaultConfigPath: hereLint('./config/eslint.config.js'),
  },
  transforms: [applyToAllFilesIfNoneSpecfied],
})
