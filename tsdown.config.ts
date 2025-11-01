import { defineMergedConfig } from './src/lib/config/tsdown.ts'

export default defineMergedConfig({
  entry: ['src/index.ts', 'src/commands/**/*.ts', 'src/**/config/*.ts'],
  copy: [{ from: 'src/format/config', to: 'lib/format/config' }, 'src/types'],
  unbundle: true,
})
