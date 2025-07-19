import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { ESLint } from 'eslint';

interface CLIOptions {
  fix?: boolean;
  fixDryRun?: boolean;
  fixType?: string[];
  format?: string;
  outputFile?: string;
  config?: string;
  ext?: string[];
  ignore?: boolean;
  ignorePath?: string;
  ignorePattern?: string[];
  cache?: boolean;
  cacheLocation?: string;
  quiet?: boolean;
  maxWarnings?: number;
  debug?: boolean;
  help?: boolean;
  version?: boolean;
}

function parseCommandLineArgs(): { options: CLIOptions; patterns: string[] } {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      fix: { type: 'boolean', short: 'f' },
      'fix-dry-run': { type: 'boolean' },
      'fix-type': { type: 'string', multiple: true },
      format: { type: 'string', short: 'o' },
      'output-file': { type: 'string' },
      config: { type: 'string', short: 'c' },
      ext: { type: 'string', multiple: true },
      'no-ignore': { type: 'boolean' },
      'ignore-path': { type: 'string' },
      'ignore-pattern': { type: 'string', multiple: true },
      cache: { type: 'boolean' },
      'cache-location': { type: 'string' },
      quiet: { type: 'boolean', short: 'q' },
      'max-warnings': { type: 'string' },
      debug: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
    allowPositionals: true,
  });

  const options: CLIOptions = {
    fix: values.fix,
    fixDryRun: values['fix-dry-run'],
    fixType: values['fix-type'],
    format: values.format,
    outputFile: values['output-file'],
    config: values.config,
    ext: values.ext,
    ignore: !values['no-ignore'],
    ignorePath: values['ignore-path'],
    ignorePattern: values['ignore-pattern'],
    cache: values.cache,
    cacheLocation: values['cache-location'],
    quiet: values.quiet,
    maxWarnings: values['max-warnings'] ? parseInt(values['max-warnings'], 10) : undefined,
    debug: values.debug,
    help: values.help,
    version: values.version,
  };

  return { options, patterns: positionals };
}

function showHelp(): void {
  console.log(`
ESLint CLI

Usage: eslint [options] [file|dir|glob]*

Options:
  -f, --fix                 Automatically fix problems
  --fix-dry-run             Like --fix, but don't save changes
  --fix-type                Specify types of fixes to apply (directive, problem, suggestion, layout)
  -o, --format              Use a specific output format (default: stylish)
  --output-file             Specify file to write output to
  -c, --config              Use this configuration file
  --ext                     Specify JavaScript file extensions
  --no-ignore               Disable use of ignore files and patterns
  --ignore-path             Specify path of ignore file
  --ignore-pattern          Pattern of files to ignore (in addition to those in .eslintignore)
  --cache                   Only check changed files
  --cache-location          Path to the cache file or directory
  -q, --quiet               Report errors only
  --max-warnings            Number of warnings to trigger nonzero exit code
  --debug                   Output debugging information
  -h, --help                Show help
  -v, --version             Show version
  `);
}

async function runESLint(): Promise<void> {
  const { options, patterns } = parseCommandLineArgs();

  if (options.help) {
    showHelp();
    return;
  }

  if (options.version) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
    console.log(pkg.version || 'unknown');
    return;
  }

  const filesToLint = patterns.length > 0 ? patterns : ['.'];

  try {
    const eslintOptions: ESLint.Options = {
      fix: options.fix && !options.fixDryRun,
      fixTypes: options.fixType as ESLint.Options['fixTypes'],
      cache: options.cache,
      cacheLocation: options.cacheLocation,
      ignore: options.ignore,
    };

    if (options.config) {
      eslintOptions.overrideConfigFile = options.config;
    }

    if (options.ignorePattern) {
      eslintOptions.ignorePatterns = options.ignorePattern;
    }

    const eslint = new ESLint(eslintOptions);

    const results = await eslint.lintFiles(filesToLint);

    if (options.fix && !options.fixDryRun) {
      await ESLint.outputFixes(results);
    }

    const finalResults = options.quiet 
      ? ESLint.getErrorResults(results)
      : results;

    const formatter = await eslint.loadFormatter(options.format || 'stylish');
    const output = await formatter.format(finalResults);

    if (options.outputFile) {
      fs.writeFileSync(options.outputFile, output);
    } else {
      console.log(output);
    }

    const errorCount = finalResults.reduce((sum, result) => sum + result.errorCount, 0);
    const warningCount = finalResults.reduce((sum, result) => sum + result.warningCount, 0);

    if (options.debug) {
      console.error(`Errors: ${errorCount}, Warnings: ${warningCount}`);
    }

    if (errorCount > 0) {
      process.exit(1);
    }

    if (options.maxWarnings !== undefined && warningCount > options.maxWarnings) {
      process.exit(1);
    }

  } catch (error) {
    console.error('ESLint error:', error);
    process.exit(2);
  }
}

runESLint().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(2);
});


