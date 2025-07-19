import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

export function detectPackageManager(): { manager: string; hasExec: boolean } {
  if (fs.existsSync('yarn.lock')) {
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

  if (fs.existsSync('pnpm-lock.yaml')) return { manager: 'pnpm', hasExec: true }
  if (fs.existsSync('package-lock.json'))
    return { manager: 'npm', hasExec: false }
  return { manager: 'npx', hasExec: false }
}

export function isYarnPnP(): boolean {
  return (
    process.versions.pnp !== undefined ||
    fs.existsSync('.pnp.cjs') ||
    fs.existsSync('.pnp.js')
  )
}

export function resolveConfigFile(configFilePath: string, preferCJS = false) {
  const defaultExtensionsToCheck = ['.ts', '.mjs', '.js', '.cjs']
  const extensionsToCheck = preferCJS
    ? defaultExtensionsToCheck.reverse()
    : defaultExtensionsToCheck

  const possiblePaths = extensionsToCheck.map((ext) => {
    return () => {
      const filePath = path.join(__dirname, `${configFilePath}${ext}`)
      if (fs.existsSync(filePath)) return filePath
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
  return configFiles.some((file) => fs.existsSync(file))
}
