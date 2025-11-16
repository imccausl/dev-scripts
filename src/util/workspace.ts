import fs, { globSync } from 'node:fs'
import path from 'node:path'

import { readPackageUpSync } from 'read-package-up'
import YAML from 'yaml'

type PackageJson = Record<string, unknown> & {
  name?: string
  workspaces?: string[] | { packages?: string[] }
}

export type WorkspaceInfo = {
  name: string
  dir: string
  relativeDir: string
  manifestPath: string
  packageJson: PackageJson
}

export type MonorepoInfo = {
  root: WorkspaceInfo
  workspaces: WorkspaceInfo[]
}

function readPackageFromDir(dir: string): {
  packageJson: PackageJson
  manifestPath: string
} | null {
  const resolvedDir = path.resolve(dir)
  const result = readPackageUpSync({ cwd: resolvedDir, normalize: false })
  if (!result) return null
  if (path.dirname(result.path) !== resolvedDir) return null
  return {
    packageJson: result.packageJson as PackageJson,
    manifestPath: result.path,
  }
}

function hasPnpmWorkspaceFile(dir: string) {
  return fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))
}

function readPnpmPatterns(dir: string): string[] {
  const pnpmFile = path.join(dir, 'pnpm-workspace.yaml')
  if (!fs.existsSync(pnpmFile)) return []

  try {
    const parsed = YAML.parse(fs.readFileSync(pnpmFile, 'utf8'))
    const packages = parsed?.packages
    return Array.isArray(packages) ? packages : []
  } catch {
    return []
  }
}

function getWorkspacePatterns(packageJson: PackageJson, dir: string): string[] {
  const { workspaces } = packageJson
  if (Array.isArray(workspaces)) {
    return workspaces
  }

  if (workspaces && Array.isArray((workspaces as { packages?: string[] }).packages)) {
    return (workspaces as { packages?: string[] }).packages ?? []
  }

  return readPnpmPatterns(dir)
}

function makeWorkspaceInfo(dir: string, rootDir: string): WorkspaceInfo | null {
  const pkg = readPackageFromDir(dir)
  if (!pkg) return null

  const name = pkg.packageJson.name ?? path.relative(rootDir, dir)
  return {
    name,
    dir,
    relativeDir: path.relative(rootDir, dir) || '.',
    manifestPath: pkg.manifestPath,
    packageJson: pkg.packageJson,
  }
}

function resolveWorkspaceDirs(rootDir: string, patterns: string[]): WorkspaceInfo[] {
  const seen = new Set<string>()
  const workspaces: WorkspaceInfo[] = []

  for (const pattern of patterns) {
    const entries = globSync(pattern, {
      cwd: rootDir,
      withFileTypes: true,
    })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const dir = path.join(entry.parentPath, entry.name)
      const key = path.normalize(dir)
      if (seen.has(key)) continue
      const workspace = makeWorkspaceInfo(dir, rootDir)
      if (workspace) {
        seen.add(key)
        workspaces.push(workspace)
      }
    }
  }

  return workspaces
}

function readRootInfo(dir: string): WorkspaceInfo {
  const pkg = readPackageFromDir(dir)

  return {
    name: pkg?.packageJson.name ?? path.basename(dir),
    dir,
    relativeDir: '.',
    manifestPath: pkg?.manifestPath ?? path.join(dir, 'package.json'),
    packageJson: pkg?.packageJson ?? ({} as PackageJson),
  }
}

function findWorkspaceRoot(startDir: string): { dir: string; manifestPath: string } {
  let dir = path.resolve(startDir)
  let lastPackage: { dir: string; manifestPath: string } | null = null
  const fallbackManifest = path.join(dir, 'package.json')

  while (true) {
    const pkg = readPackageFromDir(dir)
    if (pkg) {
      if (pkg.packageJson.workspaces || hasPnpmWorkspaceFile(dir)) {
        return { dir, manifestPath: pkg.manifestPath }
      }
      lastPackage = { dir, manifestPath: pkg.manifestPath }
    }

    const parent = path.dirname(dir)
    if (parent === dir) {
      return lastPackage ?? { dir: path.resolve(startDir), manifestPath: fallbackManifest }
    }
    dir = parent
  }
}

export function loadMonorepoInfo(startDir = process.cwd()): MonorepoInfo {
  const { dir } = findWorkspaceRoot(startDir)
  const root = readRootInfo(dir)
  const patterns = getWorkspacePatterns(root.packageJson, dir)
  const workspaces = patterns.length ? resolveWorkspaceDirs(dir, patterns) : []

  return { root, workspaces }
}

export function findWorkspace(
  info: MonorepoInfo,
  selector: string,
): WorkspaceInfo | null {
  const normalized = selector.trim()
  if (!normalized) return null

  if (
    normalized === 'root' ||
    normalized === info.root.name ||
    normalized === '.' ||
    normalized === info.root.relativeDir
  ) {
    return info.root
  }

  const absolute = path.isAbsolute(normalized)
    ? path.normalize(normalized)
    : path.normalize(path.join(info.root.dir, normalized))

  return (
    info.workspaces.find((workspace) => {
      return (
        workspace.name === normalized ||
        workspace.relativeDir === normalized ||
        path.normalize(workspace.dir) === absolute
      )
    }) ?? null
  )
}
