

import { createCLICommand } from '../util/command.js'


export default createCLICommand({
  name: 'lib',
  command: 'tsdown',
  description: 'Compile TypeScript library code using TSDown',
  config: {
    flag: '--config',
    hasFlag: (args) => args.includes('--config') || args.includes('-c'),
    fileNames: [
  'tsdown.config.js',
  'tsdown.config.mjs',
  'tsdown.config.cjs',
  'tsdown.config.ts',
  'tsdown.config.mts',
  'tsdown.config.cts',
],
    defaultConfigPath: './config/tsdown',
  }


})
