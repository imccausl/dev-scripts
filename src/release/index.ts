import { createCommand, fromHere } from '../util/command.js'

import { parseConfig } from './utils.ts'

const hereRelease = fromHere(import.meta.url)

export default createCommand({
  name: 'release',
  description: 'Run semantic-release to publish a new release',
  config: {
    flag: '--extends',
    fileNames: [
      '.releaserc',
      'release.config.js',
      'release.config.cjs',
      'release.config.mjs',
      'release.config.ts',
      'release.config.mts',
      'release.config.cts',
    ],
    defaultConfigPath: hereRelease('./config/index.js'),
  },
  action: async ({ configPath }) => {
    const parsedConfig = configPath ? await parseConfig(configPath) : null
    if (!parsedConfig) {
      throw new Error(
        'No configuration found for semantic-release. Provide a valid config file at the root of your project.',
      )
    }
    const semanticRelease = await import('semantic-release')
    await semanticRelease.default(parsedConfig)
  },
})
