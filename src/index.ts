import { existsSync, promises, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function parseCommandLineArgs() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    return { options: { help: true }, script: undefined, scriptArgs: [] }
  }

  if (args.includes('--version') || args.includes('-v')) {
    return { options: { version: true }, script: undefined, scriptArgs: [] }
  }

  const script = args[0]
  const scriptArgs = args.slice(1)

  return {
    options: {},
    script,
    scriptArgs,
  }
}

async function getAvailableScripts() {
  const commandsDir = join(__dirname, 'commands')
  const commands: string[] = []
  const commandFiles = existsSync(commandsDir)
    ? await promises.readdir(commandsDir)
    : []

  // First pass: collect commands and find the longest name
  const commandData: Array<{ name: string; description: string }> = []
  let maxNameLength = 0

  for (const file of commandFiles) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const command = await import(join(commandsDir, file))
      const description = command.default?.description
      if (description) {
        const name = file.replace(/\.(ts|js)$/, '')
        commandData.push({ name, description })
        maxNameLength = Math.max(maxNameLength, name.length)
      }
    }
  }

  // Second pass: format with consistent spacing
  for (const { name, description } of commandData) {
    commands.push(`${name.padEnd(maxNameLength + 2)}${description}`)
  }

  return commands.join('\n  ')
}

async function showHelp() {
  console.log(`
Usage: @imccausl/dev <script> [options]

Available scripts:
  ${await getAvailableScripts()}

Options:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  dev lint src/
  dev lint --fix src/
  `)
}

function showVersion() {
  try {
    const packagePath = join(__dirname, '../package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
    console.log(packageJson.version)
  } catch {
    console.log('Unknown version')
  }
}

async function resolveScript(script: string): Promise<string> {
  const baseUrl = new URL('.', import.meta.url)
  const extensions = ['.ts', '.js']

  for (const ext of extensions) {
    try {
      const scriptUrl = new URL(`commands/${script}${ext}`, baseUrl)
      const scriptPath = fileURLToPath(scriptUrl)

      if (existsSync(scriptPath)) {
        return scriptPath
      }
    } catch {
      // ignore
    }
  }

  throw new Error(`Script "${script}" not found`)
}

async function main() {
  const { options, script, scriptArgs } = parseCommandLineArgs()

  if (options.help) {
    await showHelp()
    process.exit(0)
  }

  if (options.version) {
    showVersion()
    process.exit(0)
  }

  if (!script) {
    console.error('No script specified.')
    await showHelp()
    process.exit(1)
  }

  try {
    const scriptPath = await resolveScript(script)
    process.argv = [scriptPath, ...scriptArgs]
    const module = await import(scriptPath)
    if (module.default?.action && typeof module.default.action === 'function') {
      await module.default.action()
    } else {
      console.error(
        `Script "${script}" does not export a default object with an action function.`,
      )
      process.exit(1)
    }
  } catch {
    console.error(`Script "${script}" not found.`)
    showHelp()
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
