import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { findUpSync as findUp } from 'find-up'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)

function getDevScriptsToolPath(
  tool: string,
  cwd = process.cwd(),
): { command: string; args: string[] } | null {
  if (isYarnPnP(cwd)) {
    try {
      const toolPackagePath = require.resolve(`${tool}/package.json`)
      const toolDir = path.dirname(toolPackagePath)

      const pkg = JSON.parse(fs.readFileSync(toolPackagePath, 'utf8'))
      const binPath = pkg.bin?.[tool] || pkg.bin

      if (binPath) {
        const fullBinPath = path.join(toolDir, binPath)

        return { command: 'node', args: [fullBinPath] }
      }
    } catch {
      // ignore: tool not found in PnP
    }
    return null
  } else {
    const devScriptsRoot = path.resolve(__dirname, '../..')
    const toolBinPath = path.join(devScriptsRoot, 'node_modules', '.bin', tool)

    if (fs.existsSync(toolBinPath)) {
      return { command: toolBinPath, args: [] }
    }
    return null
  }
}

export function getExecCommand(
  packageManager: string,
  hasExec: boolean,
): [string, string[]] {
  if (packageManager === 'yarn' && hasExec) {
    return ['yarn', ['exec']]
  }
  if (packageManager === 'pnpm' && hasExec) {
    return ['pnpm', ['exec']]
  }
  return ['npx', []]
}

function isToolAvailable(tool: string, cwd = process.cwd()): boolean {
  try {
    const { manager, hasExec } = detectPackageManager(cwd)
    const [command, execArgs] = getExecCommand(manager, hasExec)

    const options = cwd
      ? { stdio: 'ignore' as const, cwd, encoding: 'utf8' as const }
      : { stdio: 'ignore' as const, encoding: 'utf8' as const }

    execSync(
      `${command} ${[...execArgs, tool, '--version'].join(' ')}`,
      options,
    )
    return true
  } catch {
    return false
  }
}

export function detectPackageManager(cwd = process.cwd()): {
  manager: string
  hasExec: boolean
} {
  const userAgent = process.env.npm_config_user_agent ?? null
  if (process.versions.pnp || findUp('.pnp.cjs', { cwd })) {
    return { manager: 'yarn', hasExec: true }
  }

  if (userAgent?.startsWith('yarn/')) return { manager: 'yarn', hasExec: true }
  if (findUp('pnpm-lock.yaml', { cwd }))
    return { manager: 'pnpm', hasExec: true }
  if (findUp('package-lock.json', { cwd }))
    return { manager: 'npm', hasExec: false }
  return { manager: 'npx', hasExec: false }
}

export function isYarnPnP(cwd = process.cwd()): boolean {
  return (
    process.versions.pnp !== undefined ||
    !!findUp('.pnp.cjs', { cwd }) ||
    !!findUp('.pnp.js', { cwd })
  )
}

export function resolveConfigFile(
  configFilePath: string,
  preferCJS = false,
  cwd?: string,
) {
  const baseDir = cwd ?? process.cwd()
  const resolved = path.isAbsolute(configFilePath)
    ? configFilePath
    : path.join(baseDir, configFilePath)

  if (hasFile(resolved)) {
    return resolved
  }

  const defaultExtensionsToCheck = ['.ts', '.mjs', '.js', '.cjs']
  const extensionsToCheck = preferCJS
    ? [...defaultExtensionsToCheck].reverse()
    : defaultExtensionsToCheck

  const possiblePaths = extensionsToCheck.map((ext) => {
    return () => {
      const filePath = `${resolved}${ext}`
      console.log(`Checking for config file: ${filePath}`)
      if (hasFile(filePath)) return filePath
      throw new Error(`File not found: ${filePath}`)
    }
  })

  for (const resolver of possiblePaths) {
    try {
      return resolver()
    } catch {
      continue
    }
  }

  throw new Error(
    `Could not find config file. Checked for these files: ${defaultExtensionsToCheck.map((ext) => `${resolved}${ext}`).join(', ')}`,
  )
}

export function hasExistingConfig(
  configFiles: string[],
  cwd?: string,
): boolean {
  return findExistingConfig(configFiles, cwd) !== null
}

export function findExistingConfig(
  configFiles: string[],
  cwd?: string,
): string | null {
  const baseDir = path.resolve(cwd ?? process.cwd())

  const tryResolve = (filePath: string, fromDir: string): string | null => {
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.join(fromDir, filePath)
    return fs.existsSync(resolved) ? resolved : null
  }

  for (const file of configFiles) {
    if (path.isAbsolute(file)) {
      if (fs.existsSync(file)) return file
      continue
    }

    let currentDir = baseDir

    while (true) {
      const found = tryResolve(file, currentDir)
      if (found) return found

      const parentDir = path.dirname(currentDir)
      if (parentDir === currentDir) break
      currentDir = parentDir
    }
  }

  return null
}

export function hasFile(filePath: string, cwd?: string): boolean {
  const baseDir = cwd ?? process.cwd()
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(baseDir, filePath)
  return fs.existsSync(resolved)
}

export function here(p: string, dirname = __dirname) {
  return path.join(dirname, p)
}

export type AdditionalArgs = (args: string[]) => string[]

async function execute(command: string, args: string[], options = {}) {
  const { promise, resolve, reject } = Promise.withResolvers<number>()

  const child = spawn(command, args, {
    stdio: 'inherit',
    ...options,
  })

  child.on('exit', (code) => {
    resolve(code || 0)
  })
  child.on('error', (error) => {
    reject(error)
  })

  return promise
}

export async function run(
  tool: string,
  additionalArgs: AdditionalArgs = () => [],
  options?: { args?: string[]; cwd?: string },
) {
  const args = options?.args ?? process.argv.slice(1)
  const cwd = options?.cwd ?? process.cwd()
  if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(fs.readFileSync(here('../../package.json'), 'utf8'))
    console.log(pkg.version || 'unknown')
    return 0
  }

  try {
    const scriptArgs = [...additionalArgs(args), ...args]
    const { manager, hasExec } = detectPackageManager(cwd)
    const toolInfo = getDevScriptsToolPath(tool, cwd)
    const hostHasTool = isToolAvailable(tool, cwd)

    if (!hostHasTool) {
      if (!toolInfo) {
        throw new Error(`${tool} not found in host project or dev-scripts`)
      }
      console.log(
        `${tool} not found in host project, using bundled from dev-scripts`,
      )
      return await execute(
        toolInfo.command,
        [...toolInfo.args, ...scriptArgs],
        { cwd },
      )
    }

    const [command, execArgs] = getExecCommand(manager, hasExec)
    return await execute(command, [...execArgs, tool, ...scriptArgs], { cwd })
  } catch (error) {
    console.error(`${tool} error:`, error)
    return 2
  }
}
