import { runLint } from '../lint/index.ts'
import { registerCommand } from '../util/index.ts'

export default registerCommand({
  name: 'lint',
  description: 'Code linting with ESLint',
  action: runLint,
})
