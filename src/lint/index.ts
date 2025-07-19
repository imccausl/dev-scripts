import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

function detectPackageManager(): { manager: string; hasExec: boolean } {
  if (fs.existsSync('yarn.lock')) {
    try {
      const { execSync } = require('child_process');
      const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
      const majorVersion = parseInt(yarnVersion.split('.')[0]);
      return { 
        manager: 'yarn', 
        hasExec: majorVersion >= 2 
      };
    } catch {
      return { manager: 'yarn', hasExec: false };
    }
  }
  
  if (fs.existsSync('pnpm-lock.yaml')) return { manager: 'pnpm', hasExec: true };
  if (fs.existsSync('package-lock.json')) return { manager: 'npm', hasExec: false };
  return { manager: 'npx', hasExec: false };
}

function getExecCommand(packageManager: string, hasExec: boolean): [string, string[]] {
  if (packageManager === 'yarn' && hasExec) {
    return ['yarn', ['exec']];
  }
  if (packageManager === 'pnpm' && hasExec) {
    return ['pnpm', ['exec']];
  }
  return ['npx', []];
}

function resolveConfigFile(): string {
  const possiblePaths = [
    () => require.resolve('../config/index.js'),
    () => require.resolve('../config/index.ts'),
    () => {
      const jsPath = path.join(__dirname, './config/index.js');
      if (fs.existsSync(jsPath)) return jsPath;
      throw new Error('File not found');
    },
    () => {
      const tsPath = path.join(__dirname, './config/index.ts');
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

function hasExistingConfig(): boolean {
  const configFiles = [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
    'eslint.config.mts',
    'eslint.config.cts'
  ];
  
  return configFiles.some(file => fs.existsSync(file));
}

export async function runLint(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
    console.log(pkg.version || 'unknown');
    return;
  }

  try {
    const eslintArgs = [];

const hasConfig = args.includes('--config') || args.includes('-c') || hasExistingConfig();
    
    if (!hasConfig) {
      const configPath = resolveConfigFile();
      eslintArgs.push('--config', configPath);
    }

    eslintArgs.push(...args);

    if (!args.some(arg => !arg.startsWith('-'))) {
      eslintArgs.push('.');
    }

    const { manager, hasExec } = detectPackageManager();
    const [command, execArgs] = getExecCommand(manager, hasExec);
    
    const child = spawn(command, [...execArgs, 'eslint', ...eslintArgs], {
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

