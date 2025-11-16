import fs from 'node:fs'
import path from 'node:path'

import { type Options } from 'semantic-release'
import YAML from 'yaml'

const isJSON = (config: string) => {
  try {
    JSON.parse(config)
    return true
  } catch {
    return false
  }
}

const isYAML = (config: string) => {
  try {
    YAML.parse(config)
    return true
  } catch {
    return false
  }
}

const isCodeConfig = (configPath: string) => {
  const codeExtensions = ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts']
  return codeExtensions.includes(path.extname(configPath))
}
export const parseConfig = async (
  configPath: string,
): Promise<Options | null> => {
  const config = fs.readFileSync(configPath, 'utf8')
  if (isJSON(config)) {
    return JSON.parse(config)
  }
  if (isYAML(config)) {
    return YAML.parse(config)
  }
  if (isCodeConfig(configPath)) {
    const importedConfig = await import(path.resolve(configPath))
    console.log(importedConfig)
    return importedConfig.default || importedConfig
  }
  return null
}
