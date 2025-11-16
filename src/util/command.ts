import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  type WorkspaceInfo,
  findWorkspace,
  loadMonorepoInfo,
} from './workspace.js'

import {
  findExistingConfig,
  hasExistingConfig,
  hasFile,
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
  supportsWorkspaces?: boolean
}

function ensureIgnore(
  args: string[],
  ignore: IgnoreDefaults | undefined,
  cwd: string,
) {
  if (!ignore) return []

  const flagValues = Array.isArray(ignore.flag) ? ignore.flag : [ignore.flag]
  const hasIgnore =
    flagValues.some((flag) => args.includes(flag)) ||
    hasFile(ignore.fileName, cwd)

  if (hasIgnore) {
    return []
  }
  return [flagValues[0], ignore.defaultIgnorePath]
}

function ensureConfig(
  args: string[],
  config: ConfigDefaults | undefined,
  cwd: string,
) {
  if (!config) return []

  const flagValues = Array.isArray(config.flag)
    ? config.flag
    : [config.flag ?? '--config']

  const hasConfigArg =
    args.some((arg) => {
      return flagValues.includes(arg)
    }) || hasExistingConfig(config.fileNames, cwd)

  if (hasConfigArg) {
    return []
  }

  return [
    flagValues[0],
    resolveConfigFile(config.defaultConfigPath, isYarnPnP(cwd), cwd),
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

type WorkspaceFlags = {
  names: string[]
  all: boolean
}

type WorkspaceTarget = {
  cwd: string
  workspace?: WorkspaceInfo
}

function splitList(value: string | undefined) {
  return (
    value
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  )
}

function extractWorkspaceFlags(args: string[]): {
  args: string[]
  flags: WorkspaceFlags
} {
  const cleaned: string[] = []
  const selections: string[] = []
  let all = false

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]

    if (arg === '--workspace' || arg === '-w') {
      const value = args[i + 1]
      if (!value) {
        console.error('Missing value for --workspace flag.')
        process.exit(1)
      }
      selections.push(value)
      i += 1
      continue
    }

    if (arg.startsWith('--workspace=')) {
      selections.push(arg.split('=').slice(1).join('='))
      continue
    }

    if (arg === '--workspaces') {
      const value = args[i + 1]
      if (!value) {
        console.error('Missing value for --workspaces flag.')
        process.exit(1)
      }
      selections.push(...splitList(value))
      i += 1
      continue
    }

    if (arg.startsWith('--workspaces=')) {
      selections.push(...splitList(arg.split('=').slice(1).join('=')))
      continue
    }

    if (arg === '--all-workspaces') {
      all = true
      continue
    }

    cleaned.push(arg)
  }

  return {
    args: cleaned,
    flags: {
      names: selections,
      all,
    },
  }
}

function dedupeTargets(targets: WorkspaceTarget[]): WorkspaceTarget[] {
  const seen = new Set<string>()
  const result: WorkspaceTarget[] = []

  for (const target of targets) {
    const key = path.normalize(target.cwd)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(target)
  }

  return result
}

function resolveWorkspaceTargets(
  supportsWorkspaces: boolean,
  incomingArgs: string[],
): { args: string[]; targets: WorkspaceTarget[] } {
  if (!supportsWorkspaces) {
    return { args: incomingArgs, targets: [{ cwd: process.cwd() }] }
  }

  const { args, flags } = extractWorkspaceFlags(incomingArgs)
  if (!flags.all && flags.names.length === 0) {
    return { args, targets: [{ cwd: process.cwd() }] }
  }

  const info = loadMonorepoInfo(process.cwd())
  if (!info.workspaces.length && flags.all) {
    console.error('No workspaces configured in this repository.')
    process.exit(1)
  }

  const selected = flags.all
    ? info.workspaces
    : flags.names.map((name) => {
        const match = findWorkspace(info, name)
        if (!match) {
          console.error(`Workspace "${name}" not found.`)
          process.exit(1)
        }
        return match
      })

  if (!selected.length) {
    console.error('No workspaces selected.')
    process.exit(1)
  }

  const targets = selected.map((workspace) => ({
    cwd: workspace.dir,
    workspace,
  }))

  return { args, targets: dedupeTargets(targets) }
}

export const createCLICommand = ({
  command,
  name,
  description,
  baseArgs,
  config,
  ignore,
  transforms,
  supportsWorkspaces = false,
}: CLICommandOptions) => {
  const buildArgs = (incomingArgs: string[], cwd: string) => {
    return [
      ...seedBaseArgs(incomingArgs, baseArgs),
      ...ensureConfig(incomingArgs, config, cwd),
      ...ensureIgnore(incomingArgs, ignore, cwd),
      ...applyTransforms(incomingArgs, transforms),
    ]
  }

  return {
    name,
    description,
    action: async () => {
      const rawArgs = process.argv.slice(1)
      const { args, targets } = resolveWorkspaceTargets(
        supportsWorkspaces,
        rawArgs,
      )
      try {
        for (const target of targets) {
          if (supportsWorkspaces && (target.workspace || targets.length > 1)) {
            const workspaceName = target.workspace?.name ?? target.cwd
            console.log(`Running ${name} in ${workspaceName}`)
          }

          const exitCode = await run(
            command,
            (incomingArgs) => buildArgs(incomingArgs, target.cwd),
            { args, cwd: target.cwd },
          )

          if (exitCode !== 0) {
            process.exit(exitCode)
          }
        }
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

function resolveConfigPath(
  args: string[],
  config: ConfigDefaults | undefined,
  cwd = process.cwd(),
) {
  if (!config) return null

  const flagValues = Array.isArray(config.flag)
    ? config.flag
    : [config.flag ?? '--config']

  const configArgIndex = args.findIndex((arg) => {
    return flagValues.includes(arg)
  })

  if (configArgIndex >= 0 && hasFile(args[configArgIndex + 1], cwd)) {
    return args[configArgIndex + 1]
  }

  try {
    return (
      findExistingConfig(config.fileNames, cwd) ??
      resolveConfigFile(config.defaultConfigPath, isYarnPnP(cwd), cwd)
    )
  } catch {
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
