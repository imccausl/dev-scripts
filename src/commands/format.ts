import { runFormat } from '../format/index.js'

export default {
  description: 'Run code formatting with Prettier',
  action: () => {
    runFormat().catch((error) => {
      console.error('Failed to start Prettier:', error)
      process.exit(2)
    })
  },
}
