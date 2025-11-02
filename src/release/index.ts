import { createCLICommand, fromHere } from '../util/command.js'

const hereRelease = fromHere(import.meta.url)

export default createCLICommand({
  name: 'release',
  command: 'semantic-release',
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
})
