## [2.1.5](https://github.com/imccausl/dev-scripts/compare/v2.1.4...v2.1.5) (2025-11-16)


### Bug Fixes

* disable fixedExtension for build ([2e3a64d](https://github.com/imccausl/dev-scripts/commit/2e3a64d31f950a20798dbf99fd31e316dd3321cd))

## [2.1.4](https://github.com/imccausl/dev-scripts/compare/v2.1.3...v2.1.4) (2025-11-16)


### Bug Fixes

* some args not passed through to command ([953c1d2](https://github.com/imccausl/dev-scripts/commit/953c1d264a7842ee387bc4193e48e2d7086e52cb))

## [2.1.3](https://github.com/imccausl/dev-scripts/compare/v2.1.2...v2.1.3) (2025-11-04)


### Bug Fixes

* update dependencies ([c2523bd](https://github.com/imccausl/dev-scripts/commit/c2523bde8ad9fd3dd6b5250fbd3807bc3f62af2d))

## [2.1.2](https://github.com/imccausl/dev-scripts/compare/v2.1.1...v2.1.2) (2025-11-02)


### Bug Fixes

* update eslint config ([b0e0f58](https://github.com/imccausl/dev-scripts/commit/b0e0f5885835c5de127c9fc401c8ec9179e5b514))

## [2.1.1](https://github.com/imccausl/dev-scripts/compare/v2.1.0...v2.1.1) (2025-11-02)


### Bug Fixes

* release command should work with default config ([45a0f5f](https://github.com/imccausl/dev-scripts/commit/45a0f5fb0fc8857cc83c176f399bd1ea14989d56))

# [2.1.0](https://github.com/imccausl/dev-scripts/compare/v2.0.1...v2.1.0) (2025-11-02)


### Features

* force publish add release command ([819d155](https://github.com/imccausl/dev-scripts/commit/819d1550f269cb9d78eacdfc0985c6d61d3668c2))

## [2.0.1](https://github.com/imccausl/dev-scripts/compare/v2.0.0...v2.0.1) (2025-11-01)


### Bug Fixes

* resolve paths relative to command folders correctly ([33a9faf](https://github.com/imccausl/dev-scripts/commit/33a9fafc29f860d004b455f436504e7c035cda7d))

# [2.0.0](https://github.com/imccausl/dev-scripts/compare/v1.4.10...v2.0.0) (2025-11-01)


### Features

* split off lib command from build ([#93](https://github.com/imccausl/dev-scripts/issues/93)) ([f119d9d](https://github.com/imccausl/dev-scripts/commit/f119d9d58406dd18ec4d81e969e74a5f654fb6be))


### BREAKING CHANGES

* The build --bundle arg has been removed in favour of splitting build into `build` for bundling and `lib` for compiling library code. If you use `yarn dev build --bundle` simply change that to `yarn dev lib`.

* wip: update package.json for changes

* wip: don't ignore the src/lib directory

* wip: remove release wip command

## [1.4.10](https://github.com/imccausl/dev-scripts/compare/v1.4.9...v1.4.10) (2025-10-31)


### Bug Fixes

* release with updated deps ([d65e656](https://github.com/imccausl/dev-scripts/commit/d65e6561d67e8ad330721b3d25894820ff48969e))

## [1.4.9](https://github.com/imccausl/dev-scripts/compare/v1.4.8...v1.4.9) (2025-10-31)


### Bug Fixes

* republish and cleanup changelog after debugging OIDC ([1863c41](https://github.com/imccausl/dev-scripts/commit/1863c416c7883d65e4ed5042ff8c812d61bb35be))

<<<<<<< HEAD
## [1.4.8](https://github.com/imccausl/dev-scripts/compare/v1.4.7...v1.4.8) (2025-10-30)


### Bug Fixes

* extra logging ([e777222](https://github.com/imccausl/dev-scripts/commit/e777222325890e83380b346e866fe28bb9b83310))
* test new yarn patch ([2591ab0](https://github.com/imccausl/dev-scripts/commit/2591ab0fd2c160b6b8a195414978db5575d215de))
* test with latest semantic-release-yarn patch ([8fd2224](https://github.com/imccausl/dev-scripts/commit/8fd222433f7850dec201e17d64f3fe89db7fdbfb))
* try with patched yarn ([20c1887](https://github.com/imccausl/dev-scripts/commit/20c1887b8a9147eb0a077d071d60c1b5e345e1ff))
* try with scope ([b1eb1bf](https://github.com/imccausl/dev-scripts/commit/b1eb1bfed38cbe8054c6393a8e72b78ae77fc113))

## [1.4.7](https://github.com/imccausl/dev-scripts/compare/v1.4.6...v1.4.7) (2025-10-30)


### Bug Fixes

* always the wrong strings ([6719da8](https://github.com/imccausl/dev-scripts/commit/6719da86765df03875de0479fb4e56226995330d))
* and now without dryrun ([fd294b4](https://github.com/imccausl/dev-scripts/commit/fd294b4301a2c3b5209ac322071d77160f944b40))
* examine error ([c1cc158](https://github.com/imccausl/dev-scripts/commit/c1cc158b396ec95ff61dd2211c592256cd6a08ac))
* get more debugging info ([a5d124a](https://github.com/imccausl/dev-scripts/commit/a5d124a7bed27f8344021b62fce40cd96218e13d))
* more logging ([f98e3d6](https://github.com/imccausl/dev-scripts/commit/f98e3d63e289b27c65b6e79414cc35c020c07df9))
* test with more logging ([#92](https://github.com/imccausl/dev-scripts/issues/92)) ([90b3347](https://github.com/imccausl/dev-scripts/commit/90b3347291ac309b17e38368db620f31f042cdce))
* try with only OIDC check ([c5fdf39](https://github.com/imccausl/dev-scripts/commit/c5fdf39d38c59372007b8f607b70687cd82970a8))
* try with only OIDC check part 2 ([dd11c20](https://github.com/imccausl/dev-scripts/commit/dd11c207edc59bce214b49740167743c611d18cc))
* try with semantic-release npm again ([45453ed](https://github.com/imccausl/dev-scripts/commit/45453edf7b2492982f603b690e474b4778d30f3e))
* try without whoami ([26cb57c](https://github.com/imccausl/dev-scripts/commit/26cb57c9103a278ad11ca97f094fc18c30d2f285))
* wrong CI string ([d0b04f6](https://github.com/imccausl/dev-scripts/commit/d0b04f67f684aea15c36f6e2eb11cc1915e3413b))

## [1.4.6](https://github.com/imccausl/dev-scripts/compare/v1.4.5...v1.4.6) (2025-10-29)


### Bug Fixes

* try with yarn modern bug fixes for scoped pkgs ([7e5cc6d](https://github.com/imccausl/dev-scripts/commit/7e5cc6dcba3e175a3796f8d5191dbfb0f61746b4))

## [1.4.5](https://github.com/imccausl/dev-scripts/compare/v1.4.4...v1.4.5) (2025-10-29)


### Bug Fixes

* forgot to include package.json in patch ([c2124bd](https://github.com/imccausl/dev-scripts/commit/c2124bda8f882c919435bc48ebafdfcb131347d6))
* test yarn semantic commit patch ([#91](https://github.com/imccausl/dev-scripts/issues/91)) ([7fd438d](https://github.com/imccausl/dev-scripts/commit/7fd438d837b4c04b0c4a6adab5d50cd1f807041e))
* try with published version ([de4c418](https://github.com/imccausl/dev-scripts/commit/de4c418e09bf1bc14703304bfe8df65d6eae65a0))

## [1.4.4](https://github.com/imccausl/dev-scripts/compare/v1.4.3...v1.4.4) (2025-10-27)


### Bug Fixes

* add release-it ([224fd4f](https://github.com/imccausl/dev-scripts/commit/224fd4f4b7f2d368a8bd802cecad86c7de688986))


### Reverts

* Revert "Add release it" ([#88](https://github.com/imccausl/dev-scripts/issues/88)) ([4d1b261](https://github.com/imccausl/dev-scripts/commit/4d1b261e5aec5cde2af5b95a8cdb20aaf6e07802))

## [1.4.3](https://github.com/imccausl/dev-scripts/compare/v1.4.2...v1.4.3) (2025-10-26)


### Bug Fixes

* attempt to use OIDC for publish ([#85](https://github.com/imccausl/dev-scripts/issues/85)) ([529dae3](https://github.com/imccausl/dev-scripts/commit/529dae3bb6aa40bc7f92d5675ee9f1535d26482c))
* update semantic-release config ([f684d06](https://github.com/imccausl/dev-scripts/commit/f684d069e0f571f1e51cf8d17206e610fc3634b5))

## [1.4.2](https://github.com/imccausl/dev-scripts/compare/v1.4.1...v1.4.2) (2025-10-26)


### Bug Fixes

* add release-it ([#79](https://github.com/imccausl/dev-scripts/issues/79)) ([595a1bf](https://github.com/imccausl/dev-scripts/commit/595a1bf20d6e09576a3f4fa640edb10e3691cfa9))


### Reverts

* Revert "fix: add release-it ([#79](https://github.com/imccausl/dev-scripts/issues/79))" ([#84](https://github.com/imccausl/dev-scripts/issues/84)) ([14c17bc](https://github.com/imccausl/dev-scripts/commit/14c17bc292dfecd94c1d6e2a1e976c4528ac5fec))

=======
>>>>>>> 07fde21 (fix: republish and cleanup changelog after debugging OIDC)
## [1.4.1](https://github.com/imccausl/dev-scripts/compare/v1.4.0...v1.4.1) (2025-07-25)

### Bug Fixes

* add eslint config optional deps ([#21](https://github.com/imccausl/dev-scripts/issues/21)) ([5c1c169](https://github.com/imccausl/dev-scripts/commit/5c1c16981bc5e24cd206d3e8e591c95a07c6390b))

# [1.4.0](https://github.com/imccausl/dev-scripts/compare/v1.3.0...v1.4.0) (2025-07-22)

### Bug Fixes

* bundle mode should be bundle not build ([#20](https://github.com/imccausl/dev-scripts/issues/20)) ([a13fe9c](https://github.com/imccausl/dev-scripts/commit/a13fe9c51a23b7894514d17d9ae2cce7f2f396a6))

### Features

* add bundle and serve scripts using vite ([#19](https://github.com/imccausl/dev-scripts/issues/19)) ([3ff1c7d](https://github.com/imccausl/dev-scripts/commit/3ff1c7de33839bc97f73a07cab9c1b87cd608c3d))

# [1.3.0](https://github.com/imccausl/dev-scripts/compare/v1.2.4...v1.3.0) (2025-07-21)

### Features

* add build script for node-based projects ([#17](https://github.com/imccausl/dev-scripts/issues/17)) ([2e40952](https://github.com/imccausl/dev-scripts/commit/2e40952e7f468c8ecd4e09591d30ebbffd499573))

## [1.2.4](https://github.com/imccausl/dev-scripts/compare/v1.2.3...v1.2.4) (2025-07-20)

### Bug Fixes

* filter d.ts ([#16](https://github.com/imccausl/dev-scripts/issues/16)) ([175dc93](https://github.com/imccausl/dev-scripts/commit/175dc93de2bb6222b371666f85a439b05548e603))

## [1.2.3](https://github.com/imccausl/dev-scripts/compare/v1.2.2...v1.2.3) (2025-07-20)

### Bug Fixes

* export all available commands in help text ([#15](https://github.com/imccausl/dev-scripts/issues/15)) ([c5fa065](https://github.com/imccausl/dev-scripts/commit/c5fa065a9189348aa9936e18167a27a113cb1c28))

## [1.2.2](https://github.com/imccausl/dev-scripts/compare/v1.2.1...v1.2.2) (2025-07-19)

### Bug Fixes

* export paths incorrect for default config ([#13](https://github.com/imccausl/dev-scripts/issues/13)) ([d496022](https://github.com/imccausl/dev-scripts/commit/d496022318ebc8c0a51c04eb699be2fccbd9cf2e))

## [1.2.1](https://github.com/imccausl/dev-scripts/compare/v1.2.0...v1.2.1) (2025-07-19)

### Bug Fixes

* script name should not be passed as an arg to scripts ([#12](https://github.com/imccausl/dev-scripts/issues/12)) ([61c13a0](https://github.com/imccausl/dev-scripts/commit/61c13a02dcc4f714c5a8903052e708cc1e3f3a7c))

# [1.2.0](https://github.com/imccausl/dev-scripts/compare/v1.1.2...v1.2.0) (2025-07-19)

### Features

* split config into base and default ([#11](https://github.com/imccausl/dev-scripts/issues/11)) ([19524a5](https://github.com/imccausl/dev-scripts/commit/19524a590a1532ff4fa7e31ea3c8d024e68654d4))

## [1.1.2](https://github.com/imccausl/dev-scripts/compare/v1.1.1...v1.1.2) (2025-07-19)

### Bug Fixes

* lint script not giving any output ([#10](https://github.com/imccausl/dev-scripts/issues/10)) ([82d145e](https://github.com/imccausl/dev-scripts/commit/82d145e2de641bbb408e7df7f06f891f5a72bc8d))

## [1.1.1](https://github.com/imccausl/dev-scripts/compare/v1.1.0...v1.1.1) (2025-07-19)

### Bug Fixes

* attempt to fix issue with plugin resolution ([#9](https://github.com/imccausl/dev-scripts/issues/9)) ([5ea6c82](https://github.com/imccausl/dev-scripts/commit/5ea6c82f3417830229a1d561704cc675322f4c3c))

# [1.1.0](https://github.com/imccausl/dev-scripts/compare/v1.0.2...v1.1.0) (2025-07-19)

### Features

* add single entry point for scripts ([#8](https://github.com/imccausl/dev-scripts/issues/8)) ([9c62057](https://github.com/imccausl/dev-scripts/commit/9c620570aa7fc258477a676f37c49d6559be57ac))

## [1.0.2](https://github.com/imccausl/dev-scripts/compare/v1.0.1...v1.0.2) (2025-07-19)

### Bug Fixes

* force publish version ([#7](https://github.com/imccausl/dev-scripts/issues/7)) ([c03124e](https://github.com/imccausl/dev-scripts/commit/c03124eb302bf96f556829fc9b9418a0c3f40f74))

## [1.0.1](https://github.com/imccausl/dev-scripts/compare/v1.0.0...v1.0.1) (2025-07-19)

### Bug Fixes

* increment to valid version ([#6](https://github.com/imccausl/dev-scripts/issues/6)) ([0d71d3c](https://github.com/imccausl/dev-scripts/commit/0d71d3ca358af14c4f403f14f1a972a2d405e2eb))

# 1.0.0 (2025-07-19)

### Bug Fixes

* install semantic release ([#5](https://github.com/imccausl/dev-scripts/issues/5)) ([51f4453](https://github.com/imccausl/dev-scripts/commit/51f44531cd560da665ded47733f9e028e920e3bd))

### Features

* publish package ([#4](https://github.com/imccausl/dev-scripts/issues/4)) ([d1476d2](https://github.com/imccausl/dev-scripts/commit/d1476d25b2cb42c3976637a5e02304c2fcccc633))
