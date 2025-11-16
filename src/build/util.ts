import { createCLICommand, fromHere } from '../util/command.js'

export type ViteMode = 'build' | 'serve'

const hereVite = fromHere(import.meta.url)

export function createViteCommand(mode: ViteMode) {
  return createCLICommand({
    name: mode,
    command: 'vite',
    description: `Run Vite in ${mode} mode`,
    baseArgs: [mode],
    supportsWorkspaces: true,
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
      defaultConfigPath: hereVite('./config/vite'),
    },
  })
}
