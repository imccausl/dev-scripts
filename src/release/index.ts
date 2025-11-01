import { createCLICommand } from '../util/command.js'

const release = createCLICommand({
  command: 'semantic-release',
  description: 'Run semantic-release to publish a new release',
  config: {
    flag: '--config',
    fileNames: [
      '.releaserc',
      'release.config.js',
      'release.config.cjs',
      'release.config.mjs',
      'release.config.ts',
      'release.config.mts',
      'release.config.cts',
    ],
    defaultConfigPath: './config/semantic-release.config.js',
  },
  transforms: [
    (args: string[]) => {
      const transformedArgs = [...args]
      // Ensure that CI is disabled
      if (!transformedArgs.includes('--no-ci')) {
        transformedArgs.push('--no-ci')
      }
      return transformedArgs
    },
  ],
  ignore: {
    flag: '--no-ci',
    fileName: '',
    defaultIgnorePath: '',
  },
})

export default release
