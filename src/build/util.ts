import { createCLICommand } from '../util/command.js'

export type ViteMode = 'build' | 'serve'

export function createViteCommand(mode: ViteMode) {
  return createCLICommand({
    name: mode,
    command: 'vite',
    description: `Run Vite in ${mode} mode`,
    baseArgs: [mode],
    config: {
      flag: '--config',
      fileNames: [
        'vite.config.js',
        'vite.config.mjs',
        'vite.config.cjs',
        'vite.config.ts',
        'vite.config.mts',
        'vite.config.cts',
      ],
      defaultConfigPath: './config/vite',
    },
  })
}
