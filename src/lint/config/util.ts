const ignores =  {
    ignores: ['lib', '.yarn', 'node_modules', '.pnp.*'],
  }

  const files = {
    files: ['../../../src/**/*.ts'],
  }

export function createConfig(config: any[]) {
  return [
  {    ...ignores},
  ...config,
  {    ...files}
  ]
}
