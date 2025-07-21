const ignores = {
  ignores: ['lib', '.yarn', 'node_modules', '.pnp.*'],
}

const files = {
  files: ['../../../src/**/*.{ts,tsx,js,jsx}'],
}

export function createConfig(config: any[]) {
  return [{ ...ignores }, ...config, { ...files }]
}
