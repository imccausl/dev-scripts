import { runFormat } from '../format/index.js'

runFormat().catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(2)
})
