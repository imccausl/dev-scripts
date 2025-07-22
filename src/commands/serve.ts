import { runServe } from '../build/serve.ts'
import { registerCommand } from '../util/index.ts'

export default registerCommand({
  name: 'serve',
  description: 'Run the development server for local development.',
  action: runServe,
})
