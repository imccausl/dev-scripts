export async function runBuild() {
  if (process.argv.includes('--bundle')) {
    const { bundle } = await import('./bundle.js')
    return bundle()
  }

  const { compile } = await import('./compile.js')
  return compile()
}
