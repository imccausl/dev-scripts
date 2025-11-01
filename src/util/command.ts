import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  findExistingConfig,
  hasExistingConfig,
  hasFile,
  here,
  isYarnPnP,
  resolveConfigFile,
  run,
} from './index.js'

interface IgnoreDefaults {
  flag: string | string[]
  fileName: string
  defaultIgnorePath: string
}

interface ConfigDefaults {
  flag?: string | string[]
  fileNames: string[]
  defaultConfigPath: string
}

type TransformArgsFunc = (args: string[]) => string[]
type ArgsSeed = string[] | ((args: string[]) => string[])
interface CLICommandOptions {
  command: string
  name: string
  description: string
  baseArgs?: ArgsSeed
  config?: ConfigDefaults
  ignore?: IgnoreDefaults
  transforms?: TransformArgsFunc[]
}

function ensureIgnore(args: string[], ignore?: IgnoreDefaults) {
  if (!ignore) return []

  const flagValues = Array.isArray(ignore.flag) ? ignore.flag : [ignore.flag]
  const hasIgnore =
    flagValues.some((flag) => args.includes(flag)) || hasFile(ignore.fileName)

  if (hasIgnore) {
    return []
  }
  return [flagValues[0], ignore.defaultIgnorePath]
}

function ensureConfig(args: string[], config?: ConfigDefaults) {
  if (!config) return []

  const flagValues = Array.isArray(config.flag)
    ? config.flag
    : [config.flag ?? '--config']

  const hasConfigArg =
    args.some((arg) => {
      return flagValues.includes(arg)
    }) || hasExistingConfig(config.fileNames)

  if (hasConfigArg) {
    return []
  }

  return [
    flagValues[0],
    resolveConfigFile(config.defaultConfigPath, isYarnPnP()),
  ]
}

function applyTransforms(args: string[], transforms?: TransformArgsFunc[]) {
  return transforms?.flatMap((transform) => transform(args)) ?? []
}

function seedBaseArgs(incomingArgs: string[], baseSeed?: ArgsSeed) {
  return typeof baseSeed === 'function'
    ? baseSeed(incomingArgs)
    : (baseSeed ?? [])
}

export const createCLICommand = ({
  command,
  name,
  description,
  baseArgs,
  config,
  ignore,
  transforms,
}: CLICommandOptions) => {
  const buildArgs = (incomingArgs: string[]) => {
    return [
      ...seedBaseArgs(incomingArgs, baseArgs),
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

type CommandOptions = {
  name: string
  description: string
  action: ({
    args,
    configPath,
  }: {
    args: string[]
    configPath: string | null
  }) => Promise<void>
  config?: ConfigDefaults
}

async function readFile(configFilePath: string) {
  return fs.readFileSync(configFilePath, 'utf-8')
}

function resolveConfigPath(args: string[], config?: ConfigDefaults) {
  if (!config) return null

  const flagValues = Array.isArray(config.flag)
    ? config.flag
    : [config.flag ?? '--config']

  const configArgIndex = args.findIndex((arg) => {
    return flagValues.includes(arg)
  })

  if (configArgIndex >= 0 && hasFile(args[configArgIndex + 1])) {
    return args[configArgIndex + 1]
  }

  try {
    return (
      findExistingConfig(config.fileNames) ??
      resolveConfigFile(config.defaultConfigPath, isYarnPnP())
    )
  } catch (e) {
    console.error(`Failed to resolve config path: ${e.message}`)
    return null
  }
}

export const createCommand = ({
  name,
  description,
  action,
  config,
}: CommandOptions) => {
  return {
    name,
    description,
    action: async () => {
      const args = process.argv.slice(1)
      const configPath = resolveConfigPath(args, config)

      try {
        await action({ args, configPath })
      } catch (error) {
        console.error(`Failed to execute task: ${name}`, error)
        process.exit(2)
      }
    },
  }
}

export const fromHere = (moduleUrl: string) => {
  const dir = path.dirname(fileURLToPath(moduleUrl))
  return (p: string) => path.join(dir, p)
}
