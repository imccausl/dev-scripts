import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  detectPackageManager,
  getExecCommand,
  isYarnPnP,
  resolveConfigFile,
  hasExistingConfig
} from '../util/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

export async function runFormat() {
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

    const hasConfig = args.includes('--config') || hasExistingConfig(configFiles)

    if (!hasConfig) {
      const configPath = resolveConfigFile(
        './config/prettier.config',
        isYarnPnP(),
      )
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
