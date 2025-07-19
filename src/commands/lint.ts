import { runLint } from '../lint/index.js'

runLint().catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(2)
})
