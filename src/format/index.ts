import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

function detectPackageManager(): { manager: string; hasExec: boolean } {
  if (fs.existsSync('yarn.lock')) {
    try {
      const { execSync } = require('child_process')
      const yarnVersion = execSync('yarn --version', {
        encoding: 'utf8',
      }).trim()
      const majorVersion = parseInt(yarnVersion.split('.')[0])
      return { manager: 'yarn', hasExec: majorVersion >= 2 }
    } catch {
      return { manager: 'yarn', hasExec: false }
    }
  }

  if (fs.existsSync('pnpm-lock.yaml')) return { manager: 'pnpm', hasExec: true }
  if (fs.existsSync('package-lock.json'))
    return { manager: 'npm', hasExec: false }
  return { manager: 'npx', hasExec: false }
}

function getExecCommand(manager: string, hasExec: boolean): [string, string[]] {
  if (manager === 'yarn' && hasExec) {
    return ['yarn', ['exec']]
  }
  if (manager === 'pnpm' && hasExec) {
    return ['pnpm', ['exec']]
  }
  return ['npx', []]
}

function hasExistingConfig(): boolean {
  const configFiles = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.mjs',
    '.prettierrc.cjs',
    '.prettierrc.ts',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    'prettier.config.js',
    'prettier.config.mjs',
    'prettier.config.cjs',
    'prettier.config.ts',
  ]

  return configFiles.some((file) => fs.existsSync(file))
}

function isYarnPnP(): boolean {
  return (
    process.versions.pnp !== undefined ||
    fs.existsSync('.pnp.cjs') ||
    fs.existsSync('.pnp.js')
  )
}

function resolveConfigFile(): string {
  // For Yarn PnP, prefer CJS version due to compatibility issues
  const preferCJS = isYarnPnP()

  const possiblePaths = preferCJS
    ? [
        // Try CJS first for Yarn PnP
        () => {
          const cjsPath = path.join(__dirname, '../../prettier.config.cjs')
          if (fs.existsSync(cjsPath)) return cjsPath
          throw new Error('File not found')
        },
        () => {
          const jsPath = path.join(__dirname, '../../prettier.config.js')
          if (fs.existsSync(jsPath)) return jsPath
          throw new Error('File not found')
        },
      ]
    : [
        // Try ESM first for normal environments
        () => {
          const jsPath = path.join(__dirname, '../../prettier.config.js')
          if (fs.existsSync(jsPath)) return jsPath
          throw new Error('File not found')
        },
        () => {
          const cjsPath = path.join(__dirname, '../../prettier.config.cjs')
          if (fs.existsSync(cjsPath)) return cjsPath
          throw new Error('File not found')
        },
      ]

  for (const resolver of possiblePaths) {
    try {
      return resolver()
    } catch {
      continue
    }
  }

  throw new Error('Could not find prettier config file')
}

export async function runFormat(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    )
    console.log(pkg.version || 'unknown')
    return
  }

  try {
    const prettierArgs = []

    const hasConfig = args.includes('--config') || hasExistingConfig()

    if (!hasConfig) {
      const configPath = resolveConfigFile()
      prettierArgs.push('--config', configPath)
    }

    prettierArgs.push(...args)

    if (!args.some((arg) => !arg.startsWith('-'))) {
      prettierArgs.push('.')
    }

    if (
      !args.includes('--write') &&
      !args.includes('--check') &&
      !args.includes('--list-different')
    ) {
      prettierArgs.push('--write')
    }

    const { manager, hasExec } = detectPackageManager()
    const [command, execArgs] = getExecCommand(manager, hasExec)

    const child = spawn(command, [...execArgs, 'prettier', ...prettierArgs], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env,
    })

    child.on('exit', (code) => {
      process.exit(code || 0)
    })

    child.on('error', (error) => {
      console.error('Failed to start Prettier:', error)
      process.exit(2)
    })
  } catch (error) {
    console.error('Prettier error:', error)
    process.exit(2)
  }
}
