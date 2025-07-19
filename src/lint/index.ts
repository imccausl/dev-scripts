import fs from 'node:fs';
import { createRequire } from 'node:module';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

function resolveConfigFile(): string {
  const possiblePaths = [
    () => require.resolve('../eslint.js'),
    () => require.resolve('../eslint.ts'),
    () => {
      const jsPath = path.join(__dirname, './eslint.js');
      if (fs.existsSync(jsPath)) return jsPath;
      throw new Error('File not found');
    },
    () => {
      const tsPath = path.join(__dirname, './eslint.ts');
      if (fs.existsSync(tsPath)) return tsPath;
      throw new Error('File not found');
    },
  ];

  for (const resolver of possiblePaths) {
    try {
      return resolver();
    } catch {
      continue;
    }
  }

  throw new Error('Could not find eslint config file');
}

async function runESLint(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
    console.log(pkg.version || 'unknown');
    return;
  }

  try {
    const eslintArgs = [];

    const hasConfig = args.includes('--config') || args.includes('-c');
    
    if (!hasConfig) {
      const configPath = resolveConfigFile();
      eslintArgs.push('--config', configPath);
    }

   eslintArgs.push(...args);

const eslintModule = require.resolve('eslint');
const eslintDir = path.dirname(eslintModule);
const eslintCli = path.join(eslintDir, 'cli.js');

const child = spawn('node', [eslintCli, ...eslintArgs], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

    child.on('exit', (code) => {
      process.exit(code || 0);
    });

    child.on('error', (error) => {
      console.error('Failed to start ESLint:', error);
      process.exit(2);
    });

  } catch (error) {
    console.error('ESLint error:', error);
    process.exit(2);
  }
}

runESLint().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(2);
});
