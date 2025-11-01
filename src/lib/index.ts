

import { createCLICommand, fromHere } from '../util/command.js'

const hereLib = fromHere(import.meta.url)

export default createCLICommand({
  name: 'lib',
  command: 'tsdown',
  description: 'Compile TypeScript library code using TSDown',
  config: {
    flag: ['--config', '-c'],
    fileNames: [
      'tsdown.config.js',
      'tsdown.config.mjs',
      'tsdown.config.cjs',
      'tsdown.config.ts',
      'tsdown.config.mts',
      'tsdown.config.cts',
    ],
    defaultConfigPath: hereLib('./config/tsdown'),
  }


})
