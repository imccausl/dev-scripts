import { existsSync, readFileSync } from 'node:fs'
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

function showHelp() {
    console.log(`
Usage: @imccausl/dev <script> [options]

Available scripts:
  lint       Run ESLint on your project

Options:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  @imccausl/dev lint src/
  @imccausl/dev lint --fix src/
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
        showHelp()
        process.exit(0)
    }

    if (options.version) {
        showVersion()
        process.exit(0)
    }

    if (!script) {
        console.error('No script specified.')
        showHelp()
        process.exit(1)
    }

    try {
        const scriptPath = await resolveScript(script)

        if (scriptPath.endsWith('.ts')) {
            const { spawn } = await import('node:child_process')
            const child = spawn('yarn', ['tsx', scriptPath, ...scriptArgs], {
                stdio: 'inherit',
            })

            child.on('exit', (code) => process.exit(code || 0))
        } else {
            process.argv = ['node', scriptPath, ...scriptArgs]
            await import(scriptPath)
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
