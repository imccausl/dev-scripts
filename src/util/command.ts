import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  hasExistingConfig,
  hasFile,
  here,
  isYarnPnP,
  resolveConfigFile,
  run,
} from './index.js'

interface IgnoreDefaults {
  flag: string
  hasFlag?: (args: string[]) => boolean
  fileName: string
  defaultIgnorePath: string
}

interface ConfigDefaults {
  flag?: string
  hasFlag?: (args: string[]) => boolean
  fileNames: string[]
  defaultConfigPath: string
}

type TransformArgsFunc = (args: string[]) => string[]

export interface Command {
  description: string
  run(): Promise<void>
}

interface CLICommandOptions {
  command: string
  name: string
  description: string
  config?: ConfigDefaults
  ignore?: IgnoreDefaults
  transforms?: TransformArgsFunc[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function hereRelative(p: string) {
  return here(p, __dirname).replace(process.cwd(), '.')
}

function ensureIgnore(args: string[], ignore?: IgnoreDefaults) {
  if (!ignore) return []

  const hasIgnore =
    args.includes(ignore.flag) ||
    ignore.hasFlag?.(args) ||
    hasFile(ignore.fileName)

  if (hasIgnore) {
    return []
  }
  return [ignore.flag, hereRelative(ignore.defaultIgnorePath)]
}

function ensureConfig(args: string[], config?: ConfigDefaults) {
  if (!config) return []

  const flag = config.flag ?? '--config'
  const hasConfigArg =
    args.includes(flag) ||
    config.hasFlag?.(args) ||
    hasExistingConfig(config.fileNames)

  if (hasConfigArg) {
    return []
  }

  return [flag, resolveConfigFile(config.defaultConfigPath, isYarnPnP())]
}

function applyTransforms(args: string[], transforms?: TransformArgsFunc[]) {
  return transforms?.flatMap((transform) => transform(args)) ?? []
}

export const createCLICommand = ({
  command,
  name,
  description,
  config,
  ignore,
  transforms,
}: CLICommandOptions) => {
  const buildArgs = (incomingArgs: string[]) => {
    return [
      ...ensureConfig(incomingArgs, config),
      ...ensureIgnore(incomingArgs, ignore),
      ...applyTransforms(incomingArgs, transforms),
    ]
  }

  return {
    name,
    description,
    action: async () => {
      try {
        await run(command, buildArgs)
      } catch (error) {
        console.error(`Failed to execute task: ${name}`, error)
        process.exit(2)
      }
    },
  }
}
