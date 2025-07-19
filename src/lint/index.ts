import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  detectPackageManager,
  getExecCommand,
  resolveConfigFile,
  hasExistingConfig
} from '../util/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const configFiles = [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
    'eslint.config.mts',
    'eslint.config.cts',
  ]

export async function runLint(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    )
    console.log(pkg.version || 'unknown')
    return
  }

  try {
    const eslintArgs = []

    const hasConfig =
      args.includes('--config') || args.includes('-c') || hasExistingConfig(configFiles)

    if (!hasConfig) {
      const configPath = resolveConfigFile('./config/eslint.config')
      eslintArgs.push('--config', configPath)
    }

    eslintArgs.push(...args)

    if (!args.some((arg) => !arg.startsWith('-'))) {
      eslintArgs.push('.')
    }

    const { manager, hasExec } = detectPackageManager()
    const [command, execArgs] = getExecCommand(manager, hasExec)

    const child = spawn(command, [...execArgs, 'eslint', ...eslintArgs], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env,
    })

    child.on('exit', (code) => {
      process.exit(code || 0)
    })

    child.on('error', (error) => {
      console.error('Failed to start ESLint:', error)
      process.exit(2)
    })
  } catch (error) {
    console.error('ESLint error:', error)
    process.exit(2)
  }
}
