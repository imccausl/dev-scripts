import { createCLICommand, fromHere} from '../util/command.js'
import { applyToAllFilesIfNoneSpecfied } from '../util/transforms.js'

const hereFormat = fromHere(import.meta.url)

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
    flag: ['--config', '-c'],
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
    defaultConfigPath: hereFormat('./config/prettier.config.js'),
  },
  ignore: {
    flag: '--ignore-path',
    fileName: '.prettierignore',
    defaultIgnorePath: hereFormat('./config/prettierignore'),
  },
  transforms: [applyToAllFilesIfNoneSpecfied, writeByDefault],
})
