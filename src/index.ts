import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
interface CLIOptions {
  help?: boolean;
  version?: boolean;
}

function parseCommandLineArgs() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
    allowPositionals: true,
    strict: false, // Allow unknown options to pass through to scripts
  });

  return {
    options: values as CLIOptions,
    script: positionals[0],
    scriptArgs: positionals.slice(1),
  };
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
  `);
}

function showVersion() {
  try {
    const packagePath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    console.log(packageJson.version);
  } catch {
    console.log('Unknown version'); 
  }
}

async function resolveScript(script: string): Promise<string> {
  const baseUrl = new URL('.', import.meta.url);
    const extensions = ['.ts', '.js'];
  
  for (const ext of extensions) {
    try {
      const scriptUrl = new URL(`${script}/index${ext}`, baseUrl);
      const scriptPath = fileURLToPath(scriptUrl);
      
      if (existsSync(scriptPath)) {
        return scriptPath;
      }
    } catch {
      // ignore
    }
  }
  
  throw new Error(`Script "${script}" not found`);
}

async function main() {
  const { options, script, scriptArgs } = parseCommandLineArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.version) {
    showVersion();
    process.exit(0);
  }

  if (!script) {
    console.error('No script specified.');
    showHelp();
    process.exit(1);
  }

  try {
    const scriptPath = await resolveScript(script);
    
    process.argv = ['node', scriptPath, ...scriptArgs];
    
    if (scriptPath.endsWith('.ts')) {
      const { spawn } = await import('node:child_process');
      const child = spawn('yarn', ['tsx', scriptPath, ...scriptArgs], {
        stdio: 'inherit'
      });
      
      child.on('exit', (code) => process.exit(code || 0));
    } else {
      await import(scriptPath);
    }
  } catch {
    console.error(`Script "${script}" not found.`);
    showHelp();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
