import { createCLICommand } from '../util/command.js'
import { applyToAllFilesIfNoneSpecfied } from '../util/transforms.js'

function writeByDefault(args: string[]) {
  if (
    !args.includes('--write') &&
    !args.includes('--check') &&
    !args.includes('--list-different')
  ) {
    return ['--write']
  }

  return []
}

export default createCLICommand({
  command: 'prettier',
  name: 'format',
  description: 'Run Prettier to format the codebase',
  config: {
    flag: '--config',
    hasFlag: (args: string[]) =>
      args.includes('--config') || args.includes('-c'),
    fileNames: [
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
    ],
    defaultConfigPath: './config/prettier.config.js',
  },
  ignore: {
    flag: '--ignore-path',
    fileName: '.prettierignore',
    defaultIgnorePath: './config/prettierignore',
  },
  transforms: [applyToAllFilesIfNoneSpecfied, writeByDefault],
})
