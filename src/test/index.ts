import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { createCLICommand, fromHere } from '../util/command.js'

export default createCLICommand({
  name: 'test',
  command: 'vitest',
  description: 'Run tests with Vitest',
  config: {
    flag: ['--config', '-c'],
    fileNames: [
      'vitest.config.js',
      'vitest.config.cjs',
      'vitest.config.mjs',
      'vitest.config.ts',
      'vitest.config.mts',
      'vitest.config.cts',
      'vite.config.js',
      'vite.config.cjs',
      'vite.config.mjs',
      'vite.config.ts',
      'vite.config.mts',
      'vite.config.cts',
    ],
    predicate: async (filePath: string) => {
      if (filePath.startsWith('vitest.config')) return true
      // if a vite.config file is found, check if there is a test config present
      const fileContent = await import(
        pathToFileURL(path.resolve(filePath)).toString()
      )
      return 'test' in fileContent.default
    },
    defaultConfigPath: fromHere(import.meta.url)('./config/index'),
  },
})
