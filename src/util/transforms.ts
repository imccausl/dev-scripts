export function applyToAllFilesIfNoneSpecfied(args: string[]) {
  if (!args.some((arg) => !arg.startsWith('-'))) {
    return ['.']
  }
  return []
}
