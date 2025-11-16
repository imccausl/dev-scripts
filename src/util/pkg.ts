import fs from 'node:fs'

import { readPackageUpSync } from 'read-package-up'

const { packageJson: pkgJson } =
  readPackageUpSync({
    cwd: fs.realpathSync(process.cwd()),
  }) ?? {}

console.log(`Loaded package`, pkgJson)

export function hasDependency(packageName: string): boolean {
  if (!pkgJson) return false
  const deps = {
    ...pkgJson.dependencies,
  }
  return !!deps[packageName]
}

export function hasDevDependency(packageName: string): boolean {
  if (!pkgJson) return false
  const devDeps = {
    ...pkgJson.devDependencies,
  }
  return !!devDeps[packageName]
}

export function hasPeerDependency(packageName: string): boolean {
  if (!pkgJson) return false
  const peerDeps = {
    ...pkgJson.peerDependencies,
  }
  return !!peerDeps[packageName]
}

export function hasAnyDependency(packageNames: string[]): boolean {
  return packageNames.some(
    (packageName) =>
      hasDependency(packageName) ||
      hasDevDependency(packageName) ||
      hasPeerDependency(packageName),
  )
}

function ifAny<T, U>(
  predicate: boolean,
  { then, orElse }: { then: T; orElse?: U },
) {
  return predicate ? then : orElse
}

export function ifAnyDependency<T, U>(
  packageNames: string[],
  { then, orElse }: { then: T; orElse?: U },
) {
  return ifAny(hasAnyDependency(packageNames), { then, orElse })
}
