import { runBuild } from '../build/index.ts'
import { registerCommand } from '../util/index.ts'

export default registerCommand({
  name: 'build',
  description: 'Build your project. Use --bundle to bundle the output',
  action: runBuild,
})
