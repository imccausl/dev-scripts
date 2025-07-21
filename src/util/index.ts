import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)

function getDevScriptsToolPath(
  tool: string,
): { command: string; args: string[] } | null {
  if (isYarnPnP()) {
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

function isToolAvailable(tool: string, cwd?: string): boolean {
  try {
    const { manager, hasExec } = detectPackageManager()
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

export function detectPackageManager(): { manager: string; hasExec: boolean } {
  if (hasFile('yarn.lock')) {
    try {
      const yarnVersion = execSync('yarn --version', {
        encoding: 'utf8',
      }).trim()
      const majorVersion = parseInt(yarnVersion.split('.')[0])
      return { manager: 'yarn', hasExec: majorVersion >= 2 }
    } catch {
      return { manager: 'yarn', hasExec: false }
    }
  }

  if (hasFile('pnpm-lock.yaml')) return { manager: 'pnpm', hasExec: true }
  if (hasFile('package-lock.json')) return { manager: 'npm', hasExec: false }
  return { manager: 'npx', hasExec: false }
}

export function isYarnPnP(): boolean {
  return (
    process.versions.pnp !== undefined ||
    hasFile('.pnp.cjs') ||
    hasFile('.pnp.js')
  )
}

export function resolveConfigFile(configFilePath: string, preferCJS = false) {
  const defaultExtensionsToCheck = ['.ts', '.mjs', '.js', '.cjs']
  const extensionsToCheck = preferCJS
    ? defaultExtensionsToCheck.reverse()
    : defaultExtensionsToCheck

  const possiblePaths = extensionsToCheck.map((ext) => {
    return () => {
      const filePath = `${configFilePath}${ext}`
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
    `Could not find config file. Checked for these files: ${defaultExtensionsToCheck.map((ext) => `${configFilePath}${ext}`).join(', ')}`,
  )
}

export function hasExistingConfig(configFiles: string[]): boolean {
  return configFiles.some((file) => hasFile(file))
}

export function hasFile(filePath: string): boolean {
  return fs.existsSync(filePath)
}

export function here(p: string, dirname = __dirname) {
  return path.join(dirname, p)
}

export async function run(
  tool: string,
  additionalArgs: (args: string[]) => string[] = () => [],
) {
  const args = process.argv.slice(2)
  if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(fs.readFileSync(here('../../package.json'), 'utf8'))
    console.log(pkg.version || 'unknown')
    return
  }

  try {
    const scriptArgs = [...additionalArgs(args), ...args]
    const { manager, hasExec } = detectPackageManager()
    const [command, execArgs] = getExecCommand(manager, hasExec)

    if (!isToolAvailable(tool)) {
      const toolInfo = getDevScriptsToolPath(tool)
      if (toolInfo) {
        console.log(`${tool} not found in host project, using from dev-scripts`)
        const child = spawn(
          toolInfo.command,
          [...toolInfo.args, ...scriptArgs],
          {
            stdio: 'inherit',
          },
        )

        child.on('exit', (code) => process.exit(code || 0))
        child.on('error', (error) => {
          console.error(`Failed to start ${tool}:`, error)
          process.exit(2)
        })
        return
      }
      throw new Error(`${tool} not found in host project or dev-scripts`)
    }

    const child = spawn(command, [...execArgs, tool, ...scriptArgs], {
      stdio: 'inherit',
    })

    child.on('exit', (code) => {
      process.exit(code || 0)
    })

    child.on('error', (error) => {
      console.error(`Failed to start ${tool}:`, error)
      process.exit(2)
    })
  } catch (error) {
    console.error(`${tool} error:`, error)
    process.exit(2)
  }
}
interface TaskDefinition {
  name: string
  description: string
  action: () => Promise<void>
}

export function registerCommand({ name, description, action }: TaskDefinition) {
  return {
    description,
    action: async () => {
      try {
        await action()
      } catch (error) {
        console.error(`Failed to execute task: ${name}`, error)
        process.exit(2)
      }
    },
  }
}
