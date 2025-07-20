import { runLint } from '../lint/index.js'

export default {
  description: 'Run code linting with ESLint',
  action: () => {
    runLint().catch((error) => {
      console.error('Failed to start ESLint:', error)
      process.exit(2)
    })
  },
}
