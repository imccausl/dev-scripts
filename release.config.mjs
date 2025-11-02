export default {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
    '@semantic-release/changelog',
    '@imccausl/semantic-release-yarn',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): release ${nextRelease.version} [skip ci]',
      },
    ],
  ],
  branches: ['main'],
}
