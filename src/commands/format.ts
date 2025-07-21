import { runFormat } from '../format/index.ts'
import { registerCommand } from '../util/index.ts'

export default registerCommand({
  name: 'format',
  description: 'Code formatting with Prettier',
  action: runFormat,
})
