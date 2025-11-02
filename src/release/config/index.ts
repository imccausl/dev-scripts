import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default {
  plugins: [
    require.resolve('@semantic-release/commit-analyzer'),
    require.resolve('@semantic-release/release-notes-generator'),
    require.resolve('@semantic-release/github'),
    require.resolve('@semantic-release/changelog'),
    require.resolve('@imccausl/semantic-release-yarn'),
    [
      require.resolve('@semantic-release/git'),
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): release ${nextRelease.version} [skip ci]',
      },
    ],
  ],
  branches: ['main'],
}
